import React, { useEffect, useState } from "react";
import { getAllDoctors } from "../services/DoctorService";
import { getAllPatients } from "../services/PatientService";
import {
    createAppointment,
    getActiveAppointments,
    completeAppointment,
} from "../services/AppointmentService";
import type { Doctor } from "../types/Doctor";
import type { Patient } from "../types/Patient";
import type { Appointment } from "../types/Appointment";
import axios from "axios";
import toast from "react-hot-toast";
import { showConfirmation } from "../components/ConfirmationToast";
import { CalendarCheck, Search, User, UserCheck, Stethoscope, Banknote } from "lucide-react";
import AppointmentTable from "../components/tables/AppointmentTable";

interface ClinicSlot {
    dateString: string;
    dayName: string;
    display: string;
    doctor: Doctor;
}

const AppointmentPage: React.FC = () => {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [activeAppointments, setActiveAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const [specialties, setSpecialties] = useState<string[]>([]);
    const [selectedSpecialty, setSelectedSpecialty] = useState<string>("");

    const [availableDates, setAvailableDates] = useState<ClinicSlot[]>([]);
    const [selectedDate, setSelectedDate] = useState<string>("");

    const [patientDetails, setPatientDetails] = useState({
        _id: "",
        mobile: "",
        name: "",
        patientId: "",
    });

    const [doctorDetails, setDoctorDetails] = useState({
        _id: "",
        doctorId: "",
        name: "",
        roomNumber: "",
        timeSlot: "",
        doctorFee: 0
    });

    const [showAppointmentForm, setShowAppointmentForm] = useState(false);
    const [search, setSearch] = useState("");

    const fetchAllDoctors = async () => {
        try {
            const result = await getAllDoctors();
            setDoctors(result);

            const uniqueSpecialties = Array.from(
                new Set(result.map((doc: Doctor) => doc.specialty?.trim()).filter(Boolean))
            );
            setSpecialties(uniqueSpecialties);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                toast.error(error.message);
            } else {
                toast.error("Something went wrong");
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
                toast.error("Something went wrong");
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
                toast.error("Failed to fetch appointments");
            }
        }
    };

    useEffect(() => {
        fetchAllDoctors();
        fetchAllPatients();
        fetchActiveAppointments();
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
                    display: `${formattedDate} (${dayName})`,
                    doctor: doctor
                });
            }
        }
        return slots;
    };

    const handleSpecialtyChange = (specialty: string) => {
        setSelectedSpecialty(specialty);
        setSelectedDate("");
        setDoctorDetails({ _id: "", doctorId: "", name: "", roomNumber: "", timeSlot: "", doctorFee: 0 });

        if (!specialty) {
            setAvailableDates([]);
            return;
        }

        const filteredDocs = doctors.filter(doc => {
            const isDoctorActive = doc.isActive !== false;
            const matchSpecialty = doc.specialty?.toLowerCase().trim() === specialty.toLowerCase().trim();
            return isDoctorActive && matchSpecialty;
        });

        let combinedSlots: ClinicSlot[] = [];
        filteredDocs.forEach(doc => {
            const doctorSlots = generateSlotsForDoctor(doc);
            combinedSlots = [...combinedSlots, ...doctorSlots];
        });

        combinedSlots.sort((a, b) => new Date(a.dateString).getTime() - new Date(b.dateString).getTime());

        const uniqueSlots: ClinicSlot[] = [];
        const seenDates = new Set();

        combinedSlots.forEach(slot => {
            if (!seenDates.has(slot.dateString)) {
                seenDates.add(slot.dateString);
                uniqueSlots.push(slot);
            }
        });

        setAvailableDates(uniqueSlots);

        if (uniqueSlots.length === 0) {
            toast.error("No active doctor schedules found for this specialty!");
        }
    };

    const handleDateChange = (dateStr: string) => {
        setSelectedDate(dateStr);

        if (!dateStr) {
            setDoctorDetails({ _id: "", doctorId: "", name: "", roomNumber: "", timeSlot: "", doctorFee: 0 });
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

            const docData = foundSlot.doctor as any;

            setDoctorDetails({
                _id: foundSlot.doctor._id || "",
                doctorId: foundSlot.doctor.doctorId || "",
                name: foundSlot.doctor.name,
                roomNumber: foundSlot.doctor.roomNumber || "Not Assigned",
                timeSlot: timeRange,
                doctorFee: docData.doctorFee || docData.fee || docData.channellingPrice || 0
            });
            toast.success(`Assigned: Dr. ${foundSlot.doctor.name}`);
        }
    };

    const handleCreateAppointment = async () => {
        const targetDoctorId = doctorDetails._id || doctorDetails.doctorId;

        if (!targetDoctorId || !patientDetails._id || !selectedDate || !doctorDetails.roomNumber) {
            toast.error("Please fill all required details!");
            return;
        }
        setLoading(true);
        try {
            await createAppointment(
                targetDoctorId,
                patientDetails._id,
                selectedDate,
                doctorDetails.roomNumber,
                doctorDetails.doctorFee
            );

            setPatientDetails({ _id: "", mobile: "", name: "", patientId: "" });
            setDoctorDetails({ _id: "", doctorId: "", name: "", roomNumber: "", timeSlot: "", doctorFee: 0 });
            setSelectedDate("");
            setSelectedSpecialty("");
            setAvailableDates([]);
            await fetchActiveAppointments();
            toast.success("Appointment created successfully!");
            setShowAppointmentForm(false);
        } catch (error) {
            console.error("Appointment Error:", error);
            toast.error("Failed to create appointment");
        } finally {
            setLoading(false);
        }
    };

    const handleCompleteAppointment = async (appointmentId: string) => {
        const confirmed = await showConfirmation({
            message: "Are you sure you want to mark this appointment as completed?",
            confirmText: "Complete Appointment"
        });

        if (!confirmed) return;

        try {
            setLoading(true);
            await completeAppointment(appointmentId);
            await fetchActiveAppointments();
            toast.success("Appointment completed successfully!");
        } catch (error) {
            toast.error("Failed to complete appointment");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto px-2 py-4 sm:px-6 lg:px-8 text-slate-800 antialiased selection:bg-blue-500 selection:text-white">

            {/* Header section */}
            <div className="flex flex-col items-center justify-center mb-6 text-center">
                <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 mb-3 shadow-sm border border-blue-100">
                    <CalendarCheck className="w-7 h-7 sm:w-8 sm:h-8" />
                </div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-wide text-slate-900 uppercase">
                    Appointment Management
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">Manage and channel patients with real-time doctor availability</p>
            </div>

            {/* Actions Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-6">
                <div className="relative flex-1">
                    <input
                        id="search"
                        type="text"
                        placeholder="Search by Patient Name, Doctor, or ID..."
                        className="border border-slate-200 pl-11 pr-4 py-2.5 rounded-xl w-full text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition bg-slate-50/50 hover:bg-slate-50 focus:bg-white"
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                </div>

                <button
                    className={`font-semibold text-sm px-5 py-2.5 rounded-xl transition shadow-sm flex items-center justify-center gap-2 ${
                        showAppointmentForm
                            ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                            : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md"
                    }`}
                    onClick={() => setShowAppointmentForm(!showAppointmentForm)}
                >
                    {showAppointmentForm ? "Hide Form" : "Add New Appointment"}
                </button>
            </div>

            {/* Appointment Form */}
            {showAppointmentForm && (
                <div className="bg-white border border-slate-100 rounded-2xl shadow-md p-4 sm:p-6 space-y-6 mb-8 transition-all duration-300 ease-in-out">

                    {/* Patient Details Section */}
                    <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-2 mb-4 text-blue-900">
                            <User className="w-4 h-4 text-blue-600" />
                            <h2 className="text-xs sm:text-sm font-bold tracking-wide uppercase">Patient Details</h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block mb-1.5 text-xs font-semibold text-slate-600">Mobile No</label>
                                <input
                                    type="text"
                                    className="w-full border border-slate-200 px-3 py-2 text-sm rounded-lg bg-white shadow-inner focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                                    placeholder="Enter 10-digit mobile"
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
                                                    patientId: foundPatient.patientId,
                                                });
                                                toast.success(`Patient found: ${foundPatient.name}`);
                                            } else {
                                                toast.error("No patient found with this mobile number");
                                            }
                                        }
                                    }}
                                />
                            </div>
                            <div>
                                <label className="block mb-1.5 text-xs font-semibold text-slate-600">Patient Name</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        className="w-full border border-slate-200 px-3 py-2 text-sm rounded-lg bg-slate-100 text-slate-700 font-medium outline-none"
                                        placeholder="Patient Name"
                                        value={patientDetails.name}
                                        readOnly
                                    />
                                    {patientDetails.name && <UserCheck className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />}
                                </div>
                            </div>
                            <div className="sm:col-span-2 md:col-span-1">
                                <label className="block mb-1.5 text-xs font-semibold text-slate-600">Patient ID</label>
                                <input
                                    type="text"
                                    className="w-full border border-slate-200 px-3 py-2 text-sm rounded-lg bg-slate-100 text-slate-700 font-medium outline-none"
                                    placeholder="Patient ID"
                                    value={patientDetails.patientId}
                                    readOnly
                                />
                            </div>
                        </div>
                    </div>

                    {/* Doctor & Schedule Details Section */}
                    <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-2 mb-4 text-blue-900">
                            <Stethoscope className="w-4 h-4 text-blue-600" />
                            <h2 className="text-xs sm:text-sm font-bold tracking-wide uppercase">Doctor & Schedule Details</h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">

                            {/*  SELECT SPECIALTY */}
                            <div>
                                <label className="block mb-1.5 text-xs font-semibold text-slate-600">Select Specialty</label>
                                <select
                                    className="w-full border border-slate-200 px-3 py-2 text-sm rounded-lg bg-white focus:border-blue-500 outline-none cursor-pointer transition shadow-sm"
                                    value={selectedSpecialty}
                                    onChange={(e) => handleSpecialtyChange(e.target.value)}
                                >
                                    <option value="">-- Specialty --</option>
                                    {specialties.map((spec) => (
                                        <option key={spec} value={spec}>{spec}</option>
                                    ))}
                                </select>
                            </div>

                            {/*  SELECT DATE */}
                            <div>
                                <label className="block mb-1.5 text-xs font-semibold text-slate-600">Select Available Date</label>
                                <select
                                    className="w-full border border-slate-200 px-3 py-2 text-sm rounded-lg bg-white focus:border-blue-500 outline-none cursor-pointer transition shadow-sm disabled:bg-slate-100 disabled:cursor-not-allowed text-xs sm:text-sm"
                                    value={selectedDate}
                                    onChange={(e) => handleDateChange(e.target.value)}
                                    disabled={!selectedSpecialty}
                                >
                                    <option value="">
                                        {!selectedSpecialty
                                            ? "-- Select Specialty First --"
                                            : availableDates.length === 0
                                                ? "-- No Available Dates --"
                                                : "-- Select Date --"
                                        }
                                    </option>
                                    {availableDates.map((slot, index) => (
                                        <option key={index} value={slot.dateString}>
                                            {slot.display}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* ASSIGNED DOCTOR  */}
                            <div>
                                <label className="block mb-1.5 text-xs font-semibold text-slate-600">Assigned Doctor</label>
                                <input
                                    type="text"
                                    className="w-full border border-slate-200 px-3 py-2 text-sm rounded-lg bg-slate-100 font-bold text-slate-800 outline-none"
                                    placeholder="Auto-filled Doctor"
                                    value={doctorDetails.name ? `Dr. ${doctorDetails.name}` : ""}
                                    readOnly
                                />
                            </div>

                            {/* CLINIC TIME  */}
                            <div>
                                <label className="block mb-1.5 text-xs font-semibold text-slate-600">Available Time</label>
                                <input
                                    type="text"
                                    className="w-full border border-slate-200 px-3 py-2 text-sm rounded-lg bg-slate-100 font-bold text-emerald-700 outline-none"
                                    placeholder="Auto-filled Time"
                                    value={doctorDetails.timeSlot}
                                    readOnly
                                />
                            </div>

                            {/* ASSIGNED ROOM */}
                            <div>
                                <label className="block mb-1.5 text-xs font-semibold text-slate-600">Assigned Room</label>
                                <input
                                    type="text"
                                    className="w-full border border-slate-200 px-3 py-2 text-sm rounded-lg bg-slate-100 font-bold text-slate-800 outline-none"
                                    placeholder="Room Number"
                                    value={doctorDetails.roomNumber}
                                    readOnly
                                />
                            </div>

                            {/* DOCTOR FEE*/}
                            <div className="sm:col-span-2 lg:col-span-1 xl:col-span-1">
                                <label className="block mb-1.5 text-xs font-semibold text-slate-600 flex items-center gap-1">
                                    <Banknote className="w-3.5 h-3.5 text-blue-600" /> Doctor Fee
                                </label>
                                <input
                                    type="text"
                                    className="w-full border border-slate-200 px-3 py-2 text-sm rounded-lg bg-blue-50/60 font-black text-blue-700 border-blue-100 outline-none"
                                    placeholder="LKR 0.00"
                                    value={doctorDetails.doctorFee > 0 ? `LKR ${doctorDetails.doctorFee.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : "LKR 0.00"}
                                    readOnly
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-2 border-t border-slate-100">
                        <button
                            onClick={handleCreateAppointment}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition shadow-md disabled:opacity-50 disabled:pointer-events-none w-full sm:w-auto"
                            disabled={!patientDetails._id || (!doctorDetails._id && !doctorDetails.doctorId) || !selectedDate || !doctorDetails.roomNumber || loading}
                        >
                            {loading ? "Creating..." : "Confirm Appointment"}
                        </button>
                    </div>
                </div>
            )}

            {/* Table Header Wrapper */}
            <div className="mt-6 mb-4 flex items-center justify-between px-1">
                <h2 className="text-base sm:text-lg font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Active Appointment Queue
                </h2>
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                    Total: {activeAppointments.length}
                </span>
            </div>

            <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
                <AppointmentTable
                    activeAppointments={activeAppointments}
                    search={search}
                    onComplete={handleCompleteAppointment}
                />
            </div>
        </div>
    );
};

export default AppointmentPage;