import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllDoctors } from "../services/DoctorService";
import { addPatient } from "../services/PatientService";
import { createAppointment } from "../services/AppointmentService";
import { getAiRecommendation } from "../services/AiService";

import type { Doctor } from "../types/Doctor.ts";
import { CalendarCheck, User, Stethoscope, Sparkles, X, ChevronDown, CheckCircle2, ArrowLeft, Home } from "lucide-react";
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
  const navigate = useNavigate();

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

  // Doctor Details State
  const [doctorDetails, setDoctorDetails] = useState({
    _id: "",
    name: "",
    roomNumber: "",
    timeSlot: "",
    doctorFee: 0
  });

  // AI States
  const [symptoms, setSymptoms] = useState<string>("");
  const [isAiAnalyzing, setIsAiAnalyzing] = useState<boolean>(false);
  const [aiResult, setAiResult] = useState<RecommendationResult | null>(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);

  useEffect(() => {
    document.title = "MediCare | Book Appointment";
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

  const handleSpecialtyChange = (spec: string, currentDoctorsList = doctors) => {
    setSelectedSpecialty(spec);
    setSelectedDate("");
    setDoctorDetails({ _id: "", name: "", roomNumber: "", timeSlot: "", doctorFee: 0 });

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

  const handleDateChange = (dateStr: string) => {
    setSelectedDate(dateStr);

    if (!dateStr) {
      setDoctorDetails({ _id: "", name: "", roomNumber: "", timeSlot: "", doctorFee: 0 });
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

      // ⚡ FIX: 'Doctor' type එකේ doctorFee නැති නිසා (as any) ලෙස cast කර TS Error TS2339 මඟහැරුවා
      const docData = foundSlot.doctor as any;

      setDoctorDetails({
        _id: foundSlot.doctor._id || "",
        name: foundSlot.doctor.name,
        roomNumber: foundSlot.doctor.roomNumber || "Not Assigned",
        timeSlot: timeRange,
        doctorFee: docData.doctorFee || docData.fee || docData.channellingPrice || 0
      });
    }
  };

  const handleAiAnalysis = async () => {
    if (!symptoms.trim()) {
      toast.error("Please describe your symptoms first.");
      return;
    }

    setIsAiAnalyzing(true);
    setIsAiModalOpen(false);

    try {
      const recommendation = await getAiRecommendation(symptoms, specialties);
      setAiResult(recommendation);

      const generatedSlots = handleSpecialtyChange(recommendation.recommendedSpecialty, doctors);

      if (!generatedSlots || generatedSlots.length === 0) {
        toast.error(`AI suggested "${recommendation.recommendedSpecialty}", but no active schedules were found!`);
      } else {
        toast.success(`AI Recommended: ${recommendation.recommendedSpecialty}`);
      }
    } catch (error) {
      console.error("Grok AI Assistant Error:", error);
      toast.error("AI Analysis failed. Please select a specialty manually.");
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorDetails._id || !selectedDate) {
      toast.error("Please select a valid specialty and available schedule!");
      return;
    }

    try {
      // ⚡ FIX: email එක 'undefined' නොදී string එකක් දීමෙන් TS Error TS2345 නිවැරදි කළා
      const patientData = {
        name: patientName,
        phone: patientPhone,
        email: patientEmail || "",
        age: parseInt(patientAge, 10),
        gender: patientGender,
        address: patientAddress
      };

      const savedPatient = await addPatient(patientData as any);
      const savedPatientId = savedPatient._id;

      const appointmentResponse = await createAppointment(
          doctorDetails._id,
          savedPatientId as string,
          selectedDate,
          doctorDetails.roomNumber,
          doctorDetails.doctorFee
      );

      if (appointmentResponse) {
        toast.success("Appointment successfully booked!");
        setPatientName("");
        setPatientPhone("");
        setPatientEmail("");
        setPatientAge("");
        setPatientGender("Male");
        setPatientAddress("");
        setSelectedSpecialty("");
        setSelectedDate("");
        setAvailableDates([]);
        setDoctorDetails({ _id: "", name: "", roomNumber: "", timeSlot: "", doctorFee: 0 });
        setAiResult(null);
        setSymptoms("");
      }
    } catch (error: any) {
      console.error("Booking handler error:", error);
      const serverMessage = error.response?.data?.message || error.message;
      if (serverMessage?.includes("E11000") || serverMessage?.includes("duplicate")) {
        toast.error("This email address is already registered with another patient.");
      } else {
        toast.error(serverMessage || "Booking Failed.");
      }
    }
  };

  if (isLoading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-[3px] border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-bold text-blue-950 uppercase tracking-wider">Loading Hospital Core Data...</p>
          </div>
        </div>
    );
  }

  return (
      <div className="h-screen bg-slate-100/60 overflow-y-auto py-6 sm:py-12 px-4 sm:px-6 lg:px-8 custom-scrollbar">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 mb-12 overflow-hidden">

          {/* Premium Header Banner & Home Navigation */}
          <div className="bg-[#1976D2] px-6 sm:px-10 py-6 sm:py-8 border-b border-blue-700/20 flex flex-col gap-4 sm:flex-row items-center justify-between">
            <div className="flex items-center gap-4 flex-col sm:flex-row text-center sm:text-left">
              <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md hidden sm:block">
                <CalendarCheck className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase">MEDI<span className="text-blue-200">CARE</span> PORTAL</h1>
                <p className="text-blue-100 text-xs sm:text-sm mt-0.5 font-medium">Book Your Doctor's Appointment Online Instantly</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition duration-200 backdrop-blur-sm border border-white/10"
              >
                <Home className="w-4 h-4" />
                <span>Go Home</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleFormSubmit} className="p-5 sm:p-10 space-y-8">

            {/* AI Banner */}
            {aiResult && (
                <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fade-in">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wide">Grok AI Suggestion</span>
                    </div>
                    <h4 className="text-sm font-black text-slate-900">Recommended Specialty: <span className="text-emerald-700 font-extrabold">{aiResult.recommendedSpecialty}</span></h4>
                    <p className="text-xs text-slate-600 font-medium max-w-xl leading-relaxed">{aiResult.explanation}</p>
                  </div>
                  <button type="button" onClick={() => { setAiResult(null); handleSpecialtyChange(""); }} className="text-xs font-bold border border-slate-200 px-4 py-2 rounded-xl bg-white text-slate-700 shadow-xs hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all duration-200 w-full sm:w-auto text-center shrink-0">Reset Input</button>
                </div>
            )}

            {/* SECTION 1: PATIENT INFORMATION */}
            <div className="space-y-5">
              <h3 className="text-sm font-black text-blue-900 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2.5">
                <User className="w-4 h-4 text-blue-600" /> 1. Patient Personal Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Full Name *</label>
                  <input type="text" required placeholder="Enter patient's full name" value={patientName} onChange={(e) => setPatientName(e.target.value)} className="w-full text-sm p-3.5 border border-slate-200 rounded-xl outline-none focus:border-blue-500 bg-slate-50/50 font-medium transition" />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Mobile Number *</label>
                  <input type="tel" required placeholder="e.g. 0771234567" value={patientPhone} onChange={(e) => setPatientPhone(e.target.value)} className="w-full text-sm p-3.5 border border-slate-200 rounded-xl outline-none focus:border-blue-500 bg-slate-50/50 font-medium transition" />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Email Address (Optional)</label>
                  <input type="email" placeholder="patient@example.com" value={patientEmail} onChange={(e) => setPatientEmail(e.target.value)} className="w-full text-sm p-3.5 border border-slate-200 rounded-xl outline-none focus:border-blue-500 bg-slate-50/50 font-medium transition" />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Age *</label>
                  <input type="number" required placeholder="Age" min="0" max="120" value={patientAge} onChange={(e) => setPatientAge(e.target.value)} className="w-full text-sm p-3.5 border border-slate-200 rounded-xl outline-none focus:border-blue-500 bg-slate-50/50 font-medium transition" />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Gender *</label>
                  <div className="grid grid-cols-3 gap-2 h-[48px]">
                    {["Male", "Female", "Other"].map((gen) => (
                        <button key={gen} type="button" onClick={() => setPatientGender(gen)} className={`h-full text-xs font-bold rounded-xl border transition-all duration-200 ${patientGender === gen ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/10" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}>
                          {gen}
                        </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Residential Address *</label>
                  <input type="text" required placeholder="Enter primary residential address" value={patientAddress} onChange={(e) => setPatientAddress(e.target.value)} className="w-full text-sm p-3.5 border border-slate-200 rounded-xl outline-none focus:border-blue-500 bg-slate-50/50 font-medium transition" />
                </div>
              </div>
            </div>

            {/* SECTION 2: APPOINTMENT DETAILS */}
            <div className="space-y-5 pt-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <h3 className="text-sm font-black text-blue-900 uppercase tracking-wider flex items-center gap-2.5">
                  <Stethoscope className="w-4 h-4 text-blue-600" /> 2. Select Hospital Schedule
                </h3>
                <button type="button" onClick={() => setIsAiModalOpen(true)} className="inline-flex items-center justify-center gap-2 bg-[#009688] hover:bg-[#00897B] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all duration-200 transform active:scale-95 w-full sm:w-auto">
                  <Sparkles className="w-4 h-4 animate-pulse" /> {isAiAnalyzing ? "Analyzing Symptoms..." : "Smart AI Symptom Guide"}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">

                {/* Specialty Dropdown */}
                <div className="flex flex-col gap-1.5 relative">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Medical Specialty *</label>
                  <div className="relative">
                    <select value={selectedSpecialty} onChange={(e) => handleSpecialtyChange(e.target.value)} required className="w-full text-sm p-3.5 border border-slate-200 rounded-xl outline-none focus:border-blue-500 bg-white appearance-none font-medium h-[50px] pr-10">
                      <option value="">-- Choose Specialty --</option>
                      {specialties.map((spec) => (
                          <option key={spec} value={spec}>{spec}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Available Dates & Doctor Choice */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Available Schedules *</label>
                  <div className="relative">
                    <select value={selectedDate} onChange={(e) => handleDateChange(e.target.value)} required disabled={!selectedSpecialty || availableDates.length === 0} className="w-full text-sm p-3.5 border border-slate-200 rounded-xl outline-none focus:border-blue-500 bg-white disabled:bg-slate-100 appearance-none font-medium h-[50px] pr-10">
                      <option value="">
                        {!selectedSpecialty
                            ? "Select Specialty First"
                            : availableDates.length === 0
                                ? "No Available Slots Found"
                                : "-- Choose Available Slot --"}
                      </option>
                      {availableDates.map((slot) => (
                          <option key={`${slot.doctor._id}-${slot.dateString}`} value={slot.dateString}>{slot.display}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Assigned Doctor Display */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Assigned Doctor</label>
                  <input type="text" readOnly placeholder="Auto-filled Doctor Name" value={doctorDetails.name ? `Dr. ${doctorDetails.name}` : ""} className="w-full text-sm p-3.5 border border-slate-100 rounded-xl bg-slate-100/80 font-bold text-slate-800 outline-none h-[50px]" />
                </div>

                {/* Info Display Card */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Consultation Summary</label>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 grid grid-cols-3 gap-2 text-center h-[50px] items-center">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Room</span>
                      <span className="text-xs font-extrabold text-slate-700 block truncate">{doctorDetails.roomNumber || "—"}</span>
                    </div>
                    <div className="border-x border-slate-200 px-1">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Time</span>
                      <span className="text-[10px] font-extrabold text-emerald-700 block truncate leading-tight">{doctorDetails.timeSlot || "—"}</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Fee</span>
                      <span className="text-xs font-black text-blue-600 block truncate">
                        {doctorDetails.doctorFee > 0
                            ? `LKR ${doctorDetails.doctorFee.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                            : "—"}
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Submit Action Button */}
            <div className="pt-6 border-t border-slate-100">
              <button type="submit" className="w-full bg-[#1976D2] hover:bg-blue-700 text-white py-4 rounded-xl text-sm font-black uppercase tracking-wider shadow-lg shadow-blue-700/20 transition-all transform active:scale-[0.99]">
                Confirm & Secure Appointment
              </button>
            </div>
          </form>

          {/* Subtle Back Link */}
          <div className="p-6 bg-slate-50 text-center border-t border-slate-100">
            <button
                type="button"
                onClick={() => navigate("/")}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home Page</span>
            </button>
          </div>
        </div>

        {/* MODERN BLUR AI MODAL */}
        {isAiModalOpen && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
              <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-slate-100 animate-scale-up">
                <div className="bg-slate-950 px-6 py-4 flex justify-between items-center">
                  <div className="flex items-center gap-2 text-white">
                    <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
                    <h3 className="text-sm font-black uppercase tracking-wider">Grok AI Assistant</h3>
                  </div>
                  <button type="button" onClick={() => setIsAiModalOpen(false)} className="text-slate-400 hover:text-white transition p-1 rounded-lg">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6 space-y-4 flex-1">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Describe Your Symptoms</label>
                    <p className="text-xs text-slate-400">Our AI will match you with the right clinical specialist department instantly.</p>
                  </div>
                  <textarea
                      value={symptoms}
                      onChange={(e) => setSymptoms(e.target.value)}
                      placeholder="Enter details (e.g., experiencing severe lower back pain spreading down into right leg...)"
                      rows={4}
                      className="w-full text-sm p-4 border border-slate-200 rounded-xl outline-none focus:border-blue-500 bg-slate-50/50 font-medium resize-none"
                  />
                  <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                    <button type="button" onClick={() => setIsAiModalOpen(false)} className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition">Cancel</button>
                    <button
                        type="button"
                        onClick={handleAiAnalysis}
                        disabled={!symptoms.trim() || isAiAnalyzing}
                        className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-300 text-white px-6 py-2.5 rounded-xl text-xs font-bold transition shadow-md shadow-blue-600/10"
                    >
                      {isAiAnalyzing ? "Analyzing..." : "Analyze & Apply"}
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