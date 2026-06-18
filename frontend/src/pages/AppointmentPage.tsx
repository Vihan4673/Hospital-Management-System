import React, { useEffect, useState } from "react";
import { getAllDoctors } from "../services/doctorService.ts";
import { getAllReaders as getAllPatients } from "../services/readerService";
import {
  lendBook as bookAppointment,
  getActiveLendings as getActiveAppointments,
  returnBook as dischargePatient,
} from "../services/lendingService";
import type { Doctor } from "../types/Doctor.ts";
import type { Reader as Patient } from "../types/Reader";
import type { Lending as Appointment } from "../types/Lending";
import axios from "axios";
import toast from "react-hot-toast";
import { showConfirmation } from "../components/ConfirmationToast";
import { CalendarCheck, Search } from "lucide-react";
import AppointmentTable from "../components/tables/LendingTable"; // Keeps the reference but clean variable inside

const AppointmentPage: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [activeAppointments, setActiveAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [patientDetails, setPatientDetails] = useState({
    _id: "",
    mobile: "",
    name: "",
    patientId: "",
  });

  const [doctorDetails, setDoctorDetails] = useState({
    doctorId: "",
    name: "",
    specialization: "",
    consultationFee: 0,
  });

  const [appointmentDate, setAppointmentDate] = useState("");
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [search, setSearch] = useState("");

  const fetchAllDoctors = async () => {
    try {
      const result = await getAllDoctors();
      setDoctors(result);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.message);
      } else {
        toast.error("Something went wrong fetching doctors");
      }
    }
  };

  const fetchAllPatients = async () => {
    try {
      const result = await getAllPatients();
      setPatients(result);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.message);
      } else {
        toast.error("Something went wrong fetching patients");
      }
    }
  };

  const fetchActiveAppointments = async () => {
    try {
      const result = await getActiveAppointments();
      setActiveAppointments(result);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.message);
      } else {
        toast.error("Failed to fetch active appointments");
      }
    }
  };

  useEffect(() => {
    fetchAllDoctors();
    fetchAllPatients();
    fetchActiveAppointments();
  }, []);

  const handleCreateAppointment = async () => {
    if (!doctorDetails.doctorId || !patientDetails._id) {
      toast.error("Please select a doctor and patient completely.");
      return;
    }
    setLoading(true);
    try {
      // Passes doctorId, patient database ID, and the chosen channeling date
      await bookAppointment(doctorDetails.doctorId, patientDetails._id, appointmentDate);

      // Reset Form State safely
      setPatientDetails({
        _id: "",
        mobile: "",
        name: "",
        patientId: "",
      });
      setDoctorDetails({
        doctorId: "",
        name: "",
        specialization: "",
        consultationFee: 0,
      });
      setAppointmentDate("");
      setShowAppointmentForm(false);

      await fetchActiveAppointments();
      toast.success("Appointment booked successfully!");
    } catch (error) {
      console.error("Booking Error:", error);
      toast.error("Failed to schedule appointment");
    } finally {
      setLoading(false);
    }
  };

  const handleDischarge = async (appointmentId: string) => {
    const confirmed = await showConfirmation({
      message: "Are you sure you want to complete/discharge this appointment session?",
      confirmText: "Confirm Discharge"
    });

    if (!confirmed) return;

    try {
      setLoading(true);
      await dischargePatient(appointmentId);
      await fetchActiveAppointments();
      await fetchAllDoctors();
      toast.success("PatientModel session completed successfully!");
    } catch (error) {
      toast.error("Failed to complete appointment session");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="h-full overflow-y-auto px-4 py-6 bg-slate-50/30">
        {/* Page Header */}
        <div className="flex gap-2 items-center justify-center mb-6">
          <CalendarCheck className="w-7 h-7 text-teal-600 animate-pulse" />
          <h1 className="text-2xl font-bold text-slate-800 tracking-wide">PATIENT APPOINTMENT SCHEDULER</h1>
        </div>

        {/* Control Actions and Search Area */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-end mb-5 gap-4">
          <div className="flex-1">
            <label htmlFor="search" className="text-slate-700 text-sm font-medium mb-1 block">
              Search Patient Bookings
            </label>
            <div className="relative">
              <input
                  id="search"
                  type="text"
                  placeholder="Search appointments by patient, doctor or ID..."
                  className="border border-slate-300 p-2.5 pr-10 rounded-lg w-full bg-white hover:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 transition shadow-sm text-sm"
                  onChange={(e) => setSearch(e.target.value)}
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            </div>
          </div>

          <button
              className="bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-medium px-4 py-2.5 rounded-lg shadow-sm transition-all text-sm"
              onClick={() => setShowAppointmentForm(!showAppointmentForm)}
          >
            {showAppointmentForm ? "✕ Close Form" : "➕ Schedule New Appointment"}
          </button>
        </div>

        {/* Dynamic Appointment Creation Form Container */}
        {showAppointmentForm && (
            <div id="appointmentToggle" className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6 animate-fadeIn">
              <div className="space-y-6">

                {/* PatientModel Search and Fill Section */}
                <div>
                  <h2 className="text-md font-bold text-teal-800 mb-3 uppercase tracking-wider">Step 1: Patient Verification</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                    <div>
                      <label className="block mb-1 text-xs font-semibold text-slate-600">Mobile Number</label>
                      <input
                          type="text"
                          className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg focus:outline-none focus:border-teal-500 text-sm"
                          placeholder="Ex: 0771234567"
                          value={patientDetails.mobile}
                          onChange={(e) => {
                            const mobile = e.target.value;
                            setPatientDetails({ ...patientDetails, mobile });

                            if (mobile.length >= 10) {
                              const foundPatient = patients.find((p) => p.phone === mobile);
                              if (foundPatient) {
                                setPatientDetails({
                                  _id: foundPatient._id || "",
                                  mobile: foundPatient.phone,
                                  name: foundPatient.name,
                                  patientId: foundPatient.readerId || "", // mapping backward securely
                                });
                              }
                            }
                          }}
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-xs font-semibold text-slate-600">Patient Full Name</label>
                      <input
                          type="text"
                          className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg focus:outline-none focus:border-teal-500 text-sm"
                          placeholder="Enter full name"
                          value={patientDetails.name}
                          onChange={(e) => {
                            const name = e.target.value;
                            setPatientDetails({ ...patientDetails, name });

                            if (name.length >= 3) {
                              const foundPatient = patients.find((p) =>
                                  p.name.toLowerCase().includes(name.toLowerCase())
                              );
                              if (foundPatient) {
                                setPatientDetails({
                                  _id: foundPatient._id || "",
                                  mobile: foundPatient.phone,
                                  name: foundPatient.name,
                                  patientId: foundPatient.readerId || "",
                                });
                              }
                            }
                          }}
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-xs font-semibold text-slate-600">Patient System ID</label>
                      <input
                          type="text"
                          className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg focus:outline-none focus:border-teal-500 text-sm"
                          placeholder="Ex: PTN-102"
                          value={patientDetails.patientId}
                          onChange={(e) => {
                            const pId = e.target.value;
                            setPatientDetails({ ...patientDetails, patientId: pId });

                            const foundPatient = patients.find((p) => p.readerId === pId);
                            if (foundPatient) {
                              setPatientDetails({
                                _id: foundPatient._id || "",
                                mobile: foundPatient.phone,
                                name: foundPatient.name,
                                patientId: foundPatient.readerId || "",
                              });
                            }
                          }}
                      />
                    </div>
                  </div>
                </div>

                {/* Doctor Selection Section */}
                <div>
                  <h2 className="text-md font-bold text-teal-800 mb-3 uppercase tracking-wider">Step 2: Assign Medical Specialist</h2>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

                    {/* Select Doctor Menu */}
                    <div className="md:col-span-2">
                      <label className="block mb-1 text-xs font-semibold text-slate-600">Select Available Doctor</label>
                      <select
                          className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg focus:outline-none focus:border-teal-500 text-sm h-[38px]"
                          value={doctorDetails.name}
                          onChange={(e) => {
                            const selectedName = e.target.value;
                            const foundDoctor = doctors.find((b) => b.name === selectedName || (b as any).title === selectedName);
                            if (foundDoctor) {
                              setDoctorDetails({
                                doctorId: foundDoctor.doctorId || (foundDoctor as any).isbn || "",
                                name: foundDoctor.name || (foundDoctor as any).title || "",
                                specialization: foundDoctor.specialization || (foundDoctor as any).genre || "General Consultant",
                                consultationFee: foundDoctor.consultationFee || 0,
                              });
                            }
                          }}
                      >
                        <option value="">-- Choose Specialist --</option>
                        {doctors.map((doc) => {
                          const visibleName = doc.name || (doc as any).title;
                          const visibleId = doc.doctorId || (doc as any).isbn;
                          return (
                              <option key={visibleId} value={visibleName}>
                                {visibleName} — ({doc.specialization || (doc as any).genre})
                              </option>
                          );
                        })}
                      </select>
                    </div>

                    {/* Consultation Fee Tracker */}
                    <div>
                      <label className="block mb-1 text-xs font-semibold text-slate-600">Fee (LKR)</label>
                      <input
                          type="text"
                          className="w-full bg-slate-100 border border-slate-200 px-3 py-2 rounded-lg text-sm font-semibold text-slate-700"
                          value={doctorDetails.consultationFee > 0 ? `${doctorDetails.consultationFee.toLocaleString()}.00` : "0.00"}
                          readOnly
                      />
                    </div>

                    {/* Appointment Schedule Date Selector */}
                    <div>
                      <label className="block mb-1 text-xs font-semibold text-slate-600">Channeling Date</label>
                      <input
                          type="date"
                          className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg focus:outline-none focus:border-teal-500 text-sm"
                          value={appointmentDate}
                          onChange={(e) => setAppointmentDate(e.target.value)}
                      />
                    </div>

                  </div>
                </div>
              </div>

              {/* Action Trigger inside Form */}
              <div className="mt-5 flex justify-end border-t border-slate-100 pt-4">
                <button
                    onClick={handleCreateAppointment}
                    className="bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-medium px-5 py-2 rounded-lg disabled:opacity-50 transition-all text-sm shadow-sm"
                    disabled={!patientDetails.patientId || !doctorDetails.doctorId || !appointmentDate || loading}
                >
                  {loading ? "Scheduling Clinic..." : "Confirm & Schedule Appointment"}
                </button>
              </div>
            </div>
        )}

        {/* Grid List View Table Container */}
        <h2 className="text-xl font-bold text-slate-800 mt-6 mb-3 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          Active Registered Consultation Sessions
        </h2>
        <div className="overflow-x-auto rounded-xl shadow-sm border border-slate-200 bg-white">
          <AppointmentTable
              activeLendings={activeAppointments}
              search={search}
              onReturn={handleDischarge}
          />
        </div>
      </div>
  );
};

export default AppointmentPage;