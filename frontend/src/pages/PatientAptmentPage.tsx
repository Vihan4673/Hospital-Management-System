import React, { useState, useEffect } from "react";
import { getAllDoctors } from "../services/DoctorService";
import { addPatient } from "../services/PatientService";
import { createAppointment } from "../services/AppointmentService";

import type { Doctor } from "../types/Doctor.ts";
import { CalendarCheck, User, Stethoscope, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

interface RecommendationResult {
  recommendedSpecialty: string;
  confidence: number;
  explanation: string;
}

interface ClinicSlot {
  dateString: string;
  dayName: string;
  display: string;
  doctor: Doctor;
}

const PatientAppointmentPage: React.FC = () => {
  // Database States
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Patient Input Fields
  const [patientName, setPatientName] = useState<string>("");
  const [patientPhone, setPatientPhone] = useState<string>("");
  const [patientEmail, setPatientEmail] = useState<string>("");
  const [patientAge, setPatientAge] = useState<string>("");
  const [patientGender, setPatientGender] = useState<string>("Male");
  const [patientAddress, setPatientAddress] = useState<string>("");

  // Appointment Input Fields
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("");
  const [availableDates, setAvailableDates] = useState<ClinicSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");

  const [doctorDetails, setDoctorDetails] = useState({
    _id: "",
    name: "",
    roomNumber: "",
    timeSlot: "",
    channelingPrice: "—"
  });

  // AI States
  const [symptoms, setSymptoms] = useState<string>("");
  const [isAiAnalyzing, setIsAiAnalyzing] = useState<boolean>(false);
  const [aiResult, setAiResult] = useState<RecommendationResult | null>(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);

  // Backend එකෙන් Doctors ලා Fetch කිරීම
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setIsLoading(true);
        const data = await getAllDoctors();
        const activeDoctors = data.filter((d: Doctor) => d.isActive !== false);

        setDoctors(activeDoctors);

        const uniqueSpecs = Array.from(
            new Set(activeDoctors.map((d: Doctor) => d.specialty?.trim()).filter(Boolean))
        ) as string[];
        setSpecialties(uniqueSpecs);
      } catch (error) {
        console.error("Error fetching doctors:", error);
        toast.error("Failed to connect to the server.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  // ඩොක්ටර් කෙනෙකුගේ දින 14ක කාලසටහන සෑදීම
  const generateSlotsForDoctor = (doctor: Doctor): ClinicSlot[] => {
    const slots: ClinicSlot[] = [];
    const today = new Date();
    const lowerCaseDays = doctor.availableDays?.map(d => d.toLowerCase().trim()) || [];

    for (let i = 0; i < 14; i++) {
      const futureDate = new Date(today);
      futureDate.setDate(today.getDate() + i);

      const dayName = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(futureDate);

      if (lowerCaseDays.includes(dayName.toLowerCase())) {
        const year = futureDate.getFullYear();
        const month = String(futureDate.getMonth() + 1).padStart(2, '0');
        const date = String(futureDate.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${date}`;

        slots.push({
          dateString: formattedDate,
          dayName: dayName,
          display: `${formattedDate} (${dayName}) - Dr. ${doctor.name}`,
          doctor: doctor
        });
      }
    }
    return slots;
  };

  // Specialty එක වෙනස් කිරීමේදී දින සොයා ගැනීම
  const handleSpecialtyChange = (spec: string, currentDoctorsList = doctors) => {
    setSelectedSpecialty(spec);
    setSelectedDate("");
    setDoctorDetails({ _id: "", name: "", roomNumber: "", timeSlot: "", channelingPrice: "—" });

    if (!spec) {
      setAvailableDates([]);
      return;
    }

    const filteredDocs = currentDoctorsList.filter(
        doc => doc.specialty?.toLowerCase().trim() === spec.toLowerCase().trim()
    );

    let combinedSlots: ClinicSlot[] = [];
    filteredDocs.forEach(doc => {
      const doctorSlots = generateSlotsForDoctor(doc);
      combinedSlots = [...combinedSlots, ...doctorSlots];
    });

    combinedSlots.sort((a, b) => new Date(a.dateString).getTime() - new Date(b.dateString).getTime());
    setAvailableDates(combinedSlots);
    return combinedSlots;
  };

  // ਰਹੀਆ ਦਿනයක් තෝරාගත් පසු ඩොක්ටර්ගේ විස්තර Auto-Fill කිරීම
  const handleDateChange = (dateStr: string) => {
    setSelectedDate(dateStr);

    if (!dateStr) {
      setDoctorDetails({ _id: "", name: "", roomNumber: "", timeSlot: "", channelingPrice: "—" });
      return;
    }

    const foundSlot = availableDates.find(s => s.dateString === dateStr);
    if (foundSlot) {
      const formatTime = (timeStr?: string) => {
        if (!timeStr) return "";
        const [hours, minutes] = timeStr.split(":");
        const h = parseInt(hours, 10);
        const ampm = h >= 12 ? "PM" : "AM";
        const formattedHours = h % 12 || 12;
        return `${formattedHours}:${minutes} ${ampm}`;
      };

      const timeRange = foundSlot.doctor.startTime && foundSlot.doctor.endTime
          ? `${formatTime(foundSlot.doctor.startTime)} - ${formatTime(foundSlot.doctor.endTime)}`
          : "Not Set";

      setDoctorDetails({
        _id: foundSlot.doctor._id || "",
        name: foundSlot.doctor.name,
        roomNumber: foundSlot.doctor.roomNumber || "Not Assigned",
        timeSlot: timeRange,
        channelingPrice: foundSlot.doctor.channelingPrice ? `LKR ${foundSlot.doctor.channelingPrice}.00` : "—"
      });
    }
  };

  // AI Symptom Matcher
  const handleAiAnalysis = async () => {
    if (!symptoms.trim()) return;
    setIsAiAnalyzing(true);
    setIsAiModalOpen(false);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      const text = symptoms.toLowerCase();
      let recommendation: RecommendationResult = {
        recommendedSpecialty: "General Physician",
        confidence: 60,
        explanation: "Based on your symptoms, we suggest starting with a General Physician."
      };

      if (text.includes("heart") || text.includes("chest pain") || text.includes("palpitation")) {
        recommendation = { recommendedSpecialty: "Cardiologist", confidence: 95, explanation: "Your chest symptoms strongly suggest a cardiovascular checkup." };
      } else if (text.includes("headache") || text.includes("nerve") || text.includes("dizzy")) {
        recommendation = { recommendedSpecialty: "Neurologist", confidence: 90, explanation: "Headaches or nerve-related anomalies indicate a neurological assessment." };
      } else if (text.includes("skin") || text.includes("rash") || text.includes("itching")) {
        recommendation = { recommendedSpecialty: "Dermatologist", confidence: 88, explanation: "Rashes or skin irritations are best handled by a Dermatologist." };
      } else if (text.includes("child") || text.includes("baby") || text.includes("kid") || text.includes("infant")) {
        recommendation = { recommendedSpecialty: "Pediatrician", confidence: 94, explanation: "Medical care for children/infants is assigned to specialist Pediatricians." };
      }

      setAiResult(recommendation);
      const generatedSlots = handleSpecialtyChange(recommendation.recommendedSpecialty, doctors);

      if (!generatedSlots || generatedSlots.length === 0) {
        toast.error(`AI suggested ${recommendation.recommendedSpecialty}, but no active schedules found!`);
      } else {
        toast.success(`AI Recommended: ${recommendation.recommendedSpecialty}`);
      }
    } catch (error) {
      console.error("AI Assistant Error:", error);
      toast.error("AI Analysis failed.");
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  // Form Submit - Database එකට Patient සහ Appointment සේව් කිරීම
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorDetails._id || !selectedDate) {
      toast.error("Please select a valid specialty and available date!");
      return;
    }

    try {
      // 1. Patient විස්තර Patient Table එකට සේව් කිරීම
      const patientData = {
        name: patientName,
        phone: patientPhone,
        email: patientEmail || undefined, // 💡 Empty string එකක් වෙනුවට undefined යැවීමෙන් duplicate errors අවම වේ
        age: parseInt(patientAge, 10),
        gender: patientGender,
        address: patientAddress
      };

      const savedPatient = await addPatient(patientData);
      const savedPatientId = savedPatient._id;

      // 2. Appointment එක Appointment Table එකට සේව් කිරීම
      // 💡 FIX: මෙතනට 'doctorDetails.timeSlot' එකත් දත්තයක් විදිහට පාස් කළා (Backend එකට අවශ්‍ය නම්)
      const appointmentResponse = await createAppointment(
          doctorDetails._id,
          savedPatientId as string,
          selectedDate,
          doctorDetails.roomNumber
      );

      if (appointmentResponse) {
        toast.success("Appointment successfully booked!");

        // Form Fields Reset කිරීම
        setPatientName("");
        setPatientPhone("");
        setPatientEmail("");
        setPatientAge("");
        setPatientGender("Male");
        setPatientAddress("");
        setSelectedSpecialty("");
        setSelectedDate("");
        setAvailableDates([]);
        setDoctorDetails({ _id: "", name: "", roomNumber: "", timeSlot: "", channelingPrice: "—" });
        setAiResult(null);
        setSymptoms("");
      }
    } catch (error: any) {
      console.error("Booking handler error:", error);
      // 💡 FIX: සර්වර් එකෙන් එන ඇත්තම වැරැද්ද (උදා: Email duplicate error) screen එකේ පෙන්වීම
      const serverMessage = error.response?.data?.message || error.message;
      if (serverMessage?.includes("E11000") || serverMessage?.includes("duplicate")) {
        toast.error("This email address is already registered with another patient.");
      } else {
        toast.error(serverMessage || "Booking Failed. Please check backend log.");
      }
    }
  };

  if (isLoading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-semibold text-slate-600">Loading Hospital Data...</p>
          </div>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">

          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-6 text-center sm:text-left flex items-center gap-3 justify-center sm:justify-start">
            <CalendarCheck className="w-8 h-8 text-white hidden sm:block" />
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide uppercase">MEDICARE HOSPITAL</h1>
              <p className="text-blue-100 text-xs sm:text-sm mt-0.5 font-medium">Book Your Doctor's Appointment Online Instantly</p>
            </div>
          </div>

          <form onSubmit={handleFormSubmit} className="p-5 sm:p-8 space-y-6">

            {/* AI Banner */}
            {aiResult && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">AI Suggestion</span>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">Recommended Specialty: <span className="text-emerald-700">{aiResult.recommendedSpecialty}</span></h4>
                    <p className="text-xs text-slate-600">{aiResult.explanation}</p>
                  </div>
                  <button type="button" onClick={() => { setAiResult(null); handleSpecialtyChange(""); }} className="text-xs font-bold border px-2.5 py-1 rounded-lg bg-white shadow-sm hover:bg-rose-50 hover:text-rose-600 transition">Reset</button>
                </div>
            )}

            {/* SECTION 1: PATIENT INFORMATION */}
            <div className="space-y-4">
              <h3 className="text-xs sm:text-sm font-bold text-blue-700 uppercase tracking-wider border-b pb-2 flex items-center gap-2">
                <User className="w-4 h-4" /> 1. Patient Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-600">Full Name *</label>
                  <input type="text" required placeholder="Enter patient's full name" value={patientName} onChange={(e) => setPatientName(e.target.value)} className="w-full text-xs sm:text-sm p-3 border border-slate-200 rounded-xl outline-none focus:border-blue-500 bg-slate-50/50" />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-600">Mobile Number *</label>
                  <input type="tel" required placeholder="e.g. 0771234567" value={patientPhone} onChange={(e) => setPatientPhone(e.target.value)} className="w-full text-xs sm:text-sm p-3 border border-slate-200 rounded-xl outline-none focus:border-blue-500 bg-slate-50/50" />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-600">Email Address (Optional)</label>
                  <input type="email" placeholder="patient@example.com" value={patientEmail} onChange={(e) => setPatientEmail(e.target.value)} className="w-full text-xs sm:text-sm p-3 border border-slate-200 rounded-xl outline-none focus:border-blue-500 bg-slate-50/50" />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-600">Age *</label>
                  <input type="number" required placeholder="Age" min="0" max="120" value={patientAge} onChange={(e) => setPatientAge(e.target.value)} className="w-full text-xs sm:text-sm p-3 border border-slate-200 rounded-xl outline-none focus:border-blue-500 bg-slate-50/50" />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-600">Gender *</label>
                  <div className="grid grid-cols-3 gap-2">
                    {["Male", "Female", "Other"].map((gen) => (
                        <button key={gen} type="button" onClick={() => setPatientGender(gen)} className={`py-2.5 text-xs font-bold rounded-xl border transition ${patientGender === gen ? "bg-blue-600 text-white border-blue-600 shadow-sm" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}>
                          {gen}
                        </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-600">Residential Address *</label>
                  <input type="text" required placeholder="Enter primary residential address" value={patientAddress} onChange={(e) => setPatientAddress(e.target.value)} className="w-full text-xs sm:text-sm p-3 border border-slate-200 rounded-xl outline-none focus:border-blue-500 bg-slate-50/50" />
                </div>
              </div>
            </div>

            {/* SECTION 2: APPOINTMENT DETAILS */}
            <div className="space-y-4 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-2">
                <h3 className="text-xs sm:text-sm font-bold text-blue-700 uppercase tracking-wider flex items-center gap-2">
                  <Stethoscope className="w-4 h-4" /> 2. Select Schedule
                </h3>
                <button type="button" onClick={() => setIsAiModalOpen(true)} className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-3 py-1.5 rounded-lg text-[11px] font-bold shadow-sm transition transform active:scale-95 self-start sm:self-auto">
                  <Sparkles className="w-3.5 h-3.5" /> {isAiAnalyzing ? "Analyzing..." : "Don't Know the Specialty? Ask AI"}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* Specialty Dropdown */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-600">Medical Specialty *</label>
                  <select value={selectedSpecialty} onChange={(e) => handleSpecialtyChange(e.target.value)} required className="w-full text-xs sm:text-sm p-3 border border-slate-200 rounded-xl outline-none focus:border-blue-500 bg-white">
                    <option value="">-- Choose Specialty --</option>
                    {specialties.map((spec) => (
                        <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                </div>

                {/* Available Dates Dropdown */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-600">Available Date & Doctor *</label>
                  <select value={selectedDate} onChange={(e) => handleDateChange(e.target.value)} required disabled={!selectedSpecialty || availableDates.length === 0} className="w-full text-xs sm:text-sm p-3 border border-slate-200 rounded-xl outline-none focus:border-blue-500 bg-white disabled:bg-slate-100">
                    <option value="">
                      {!selectedSpecialty
                          ? "-- Select Specialty First --"
                          : availableDates.length === 0
                              ? "-- No Available Schedules --"
                              : "-- Select Date & Doctor --"}
                    </option>
                    {availableDates.map((slot) => (
                        // 💡 FIX: HTML keys වලට index එක වෙනුවට unique string එකක් භාවිතය
                        <option key={`${slot.doctor._id}-${slot.dateString}`} value={slot.dateString}>{slot.display}</option>
                    ))}
                  </select>
                </div>

                {/* Auto-filled Doctor */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-600">Assigned Doctor</label>
                  <input type="text" readOnly placeholder="Auto-filled Doctor" value={doctorDetails.name ? `Dr. ${doctorDetails.name}` : ""} className="w-full text-xs sm:text-sm p-3 border border-slate-200 rounded-xl bg-slate-100 font-bold text-slate-800 outline-none" />
                </div>

                {/* Info Card for Room, Time & Price */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Room</span>
                    <span className="text-xs font-bold text-slate-700">{doctorDetails.roomNumber || "—"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Time Slot</span>
                    <span className="text-[11px] font-bold text-emerald-700 block leading-tight mt-0.5">{doctorDetails.timeSlot || "—"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Fee</span>
                    <span className="text-xs font-extrabold text-blue-600">{doctorDetails.channelingPrice}</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Book Button */}
            <div className="pt-4 border-t border-slate-100">
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-blue-600/15 transition-all transform active:scale-[0.99]">
                Confirm & Book Appointment
              </button>
            </div>
          </form>
        </div>

        {/* AI Modal */}
        {isAiModalOpen && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
                <div className="bg-slate-900 px-5 py-4 flex justify-between items-center">
                  <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">🔮 AI Symptom Guide</h3>
                  <button type="button" onClick={() => setIsAiModalOpen(false)} className="text-slate-400 hover:text-white font-bold">✕</button>
                </div>
                <div className="p-5 space-y-4">
                  <textarea value={symptoms} onChange={(e) => setSymptoms(e.target.value)} placeholder="Describe symptoms (e.g., severe chest discomfort, skin rash...)" rows={4} className="w-full text-xs sm:text-sm p-3 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 bg-slate-50" />
                  <div className="flex justify-end gap-3">
                    <button type="button" onClick={() => setIsAiModalOpen(false)} className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200">Cancel</button>
                    <button type="button" onClick={handleAiAnalysis} disabled={!symptoms.trim() || isAiAnalyzing} className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-300 text-white px-5 py-2 rounded-xl text-xs font-bold transition">
                      {isAiAnalyzing ? "Analyzing..." : "Analyze & Auto-Fill"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
        )}
      </div>
  );
};

export default PatientAppointmentPage;