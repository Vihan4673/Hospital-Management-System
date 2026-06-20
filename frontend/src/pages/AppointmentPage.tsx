import React, { useEffect, useState } from "react";
import { getAllDoctors } from "../services/DoctorService.ts";
import { getAllPatients } from "../services/PatientService.ts";
import {
    createAppointment,
    getActiveAppointments,
    completeAppointment,
} from "../services/AppointmentService.ts";
import type { Doctor } from "../types/Doctor.ts";
import type { Patient } from "../types/Patient.ts";
import type { Appointment } from "../types/Appointment";
import axios from "axios";
import toast from "react-hot-toast";
import { showConfirmation } from "../components/ConfirmationToast";
import { CalendarCheck, Search } from "lucide-react";
import AppointmentTable from "../components/tables/AppointmentTable";

const AppointmentPage: React.FC = () => {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [activeAppointments, setActiveAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const [specialties, setSpecialties] = useState<string[]>([]);
    const [selectedSpecialty, setSelectedSpecialty] = useState<string>("");
    const [selectedDayName, setSelectedDayName] = useState<string>("");

    const [patientDetails, setPatientDetails] = useState({
        _id: "",
        mobile: "",
        name: "",
        patientId: "",
    });

    const [doctorDetails, setDoctorDetails] = useState({
        doctorId: "",
        name: "",
        roomNumber: "", // මෙය ඩොක්ටර්ව සිලෙක්ට් කරද්දී auto-fill වෙනවා වගේම වෙනස් කරන්නත් පුළුවන්
    });

    const [appointmentDate, setAppointmentDate] = useState("");
    const [showAppointmentForm, setShowAppointmentForm] = useState(false);
    const [search, setSearch] = useState("");

    const fetchAllDoctors = async () => {
        try {
            const result = await getAllDoctors();
            setDoctors(result);

            const uniqueSpecialties = Array.from(
                new Set(result.map((doc) => doc.specialty).filter(Boolean))
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

    const handleDateChange = (dateValue: string) => {
        setAppointmentDate(dateValue);
        if (!dateValue) {
            setSelectedDayName("");
            return;
        }

        const date = new Date(dateValue);
        const dayName = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(date);
        setSelectedDayName(dayName);

        // දවස වෙනස් කරද්දී කලින් තෝරලා තිබ්බ ඩොක්ටර්ව reset කරනවා
        setDoctorDetails({ doctorId: "", name: "", roomNumber: "" });
    };

    const handleSpecialtyChange = (specialty: string) => {
        setSelectedSpecialty(specialty);
        setDoctorDetails({ doctorId: "", name: "", roomNumber: "" });
    };

    // Specialty එක සහ තෝරාගත් දවස (Day) අනුව Doctorsලා Filter කිරීමේ Logic එක
    const filteredDoctors = doctors.filter((doc) => {
        if (!doc.isActive) return false;

        const matchesSpecialty = selectedSpecialty ? doc.specialty === selectedSpecialty : true;

        const matchesDay = selectedDayName
            ? doc.availableDays?.some(day => day.toLowerCase() === selectedDayName.toLowerCase())
            : true;

        return matchesSpecialty && matchesDay;
    });

    const handleCreateAppointment = async () => {
        if (!doctorDetails.doctorId || !patientDetails._id || !appointmentDate) {
            toast.error("Please fill all required details");
            return;
        }
        setLoading(true);
        try {
            // සටහන: ඔබේ backend එකෙන් roomNumber එක ගන්නවා නම් doctorDetails.roomNumber එක මෙතනින් pass කරන්න පුළුවන්
            await createAppointment(doctorDetails.doctorId, patientDetails._id, appointmentDate);

            setPatientDetails({ _id: "", mobile: "", name: "", patientId: "" });
            setDoctorDetails({ doctorId: "", name: "", roomNumber: "" });
            setAppointmentDate("");
            setSelectedSpecialty("");
            setSelectedDayName("");
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
        <div className="h-full overflow-y-auto px-4 py-6 text-slate-800">
            <div className="flex gap-2 items-center justify-center mb-6">
                <CalendarCheck className="w-8 h-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-blue-900">APPOINTMENT MANAGEMENT</h1>
            </div>

            {/* Search Bar & Toggle Button */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-end mb-6 gap-4">
                <div className="flex-1">
                    <label htmlFor="search" className="text-slate-700 font-medium mb-1 block">
                        Search Appointments
                    </label>
                    <div className="relative">
                        <input
                            id="search"
                            type="text"
                            placeholder="Search by Patient Name, Doctor, or ID..."
                            className="border border-neutral-300 p-2 pr-10 rounded-lg w-full focus:ring-1 focus:ring-blue-400 focus:border-blue-500 outline-none transition"
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    </div>
                </div>

                <button
                    className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-4 py-2 rounded-lg transition"
                    onClick={() => setShowAppointmentForm(!showAppointmentForm)}
                >
                    {showAppointmentForm ? "Hide Form" : "Add New Appointment"}
                </button>
            </div>

            {showAppointmentForm && (
                <div className="bg-white border p-6 rounded-xl shadow-sm space-y-6 mb-6 animate-fade-in">
                    {/* Patient Details Section */}
                    <div>
                        <h2 className="text-md font-bold text-blue-800 mb-3 border-b pb-1">Patient Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block mb-1 text-sm font-medium">Mobile No</label>
                                <input
                                    type="text"
                                    className="w-full border px-3 py-2 rounded-lg bg-slate-50 focus:border-blue-500 outline-none"
                                    placeholder="Enter mobile number"
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
                                            }
                                        }
                                    }}
                                />
                            </div>
                            <div>
                                <label className="block mb-1 text-sm font-medium">Patient Name</label>
                                <input
                                    type="text"
                                    className="w-full border px-3 py-2 rounded-lg bg-slate-50 focus:border-blue-500 outline-none"
                                    placeholder="Search Patient Name"
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
                                                    patientId: foundPatient.patientId,
                                                });
                                            }
                                        }
                                    }}
                                />
                            </div>
                            <div>
                                <label className="block mb-1 text-sm font-medium">Patient ID</label>
                                <input
                                    type="text"
                                    className="w-full border px-3 py-2 rounded-lg bg-slate-50 focus:border-blue-500 outline-none"
                                    placeholder="Patient ID"
                                    value={patientDetails.patientId}
                                    onChange={(e) => {
                                        const patientId = e.target.value;
                                        setPatientDetails({ ...patientDetails, patientId });
                                        const foundPatient = patients.find((p) => p.patientId === patientId);
                                        if (foundPatient) {
                                            setPatientDetails({
                                                _id: foundPatient._id || "",
                                                mobile: foundPatient.phone,
                                                name: foundPatient.name,
                                                patientId: foundPatient.patientId,
                                            });
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Doctor & Schedule Details Section */}
                    <div>
                        <h2 className="text-md font-bold text-blue-800 mb-3 border-b pb-1">Doctor & Schedule Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

                            {/* SELECT SPECIALTY DROPDOWN */}
                            <div>
                                <label className="block mb-1 text-sm font-medium">Select Specialty</label>
                                <select
                                    className="w-full border px-3 py-2 rounded-lg bg-slate-50 focus:border-blue-500 outline-none cursor-pointer"
                                    value={selectedSpecialty}
                                    onChange={(e) => handleSpecialtyChange(e.target.value)}
                                >
                                    <option value="">-- All Specialties --</option>
                                    {specialties.map((spec) => (
                                        <option key={spec} value={spec}>{spec}</option>
                                    ))}
                                </select>
                            </div>

                            {/* APPOINTMENT DATE */}
                            <div>
                                <label className="block mb-1 text-sm font-medium">
                                    Appointment Date & Time {selectedDayName && <span className="text-blue-600 font-bold">({selectedDayName})</span>}
                                </label>
                                <input
                                    type="datetime-local"
                                    className="w-full border px-3 py-2 rounded-lg bg-slate-50 focus:border-blue-500 outline-none"
                                    value={appointmentDate}
                                    onChange={(e) => handleDateChange(e.target.value)}
                                />
                            </div>

                            {/* SELECT DOCTOR DROPDOWN (FILTERED BY SPECIALTY & DAY) */}
                            <div>
                                <label className="block mb-1 text-sm font-medium">Select Doctor</label>
                                <select
                                    className="w-full border px-3 py-2 rounded-lg bg-slate-50 focus:border-blue-500 outline-none cursor-pointer disabled:bg-slate-100 disabled:cursor-not-allowed"
                                    value={doctorDetails.name}
                                    onChange={(e) => {
                                        const name = e.target.value;
                                        const foundDoctor = doctors.find((d) => d.name === name);
                                        if (foundDoctor) {
                                            setDoctorDetails({
                                                doctorId: foundDoctor.doctorId,
                                                name: foundDoctor.name,
                                                roomNumber: foundDoctor.roomNumber || "",
                                            });
                                        } else {
                                            setDoctorDetails({ doctorId: "", name: "", roomNumber: "" });
                                        }
                                    }}
                                >
                                    <option value="">
                                        {filteredDoctors.length === 0 ? "-- No Doctors Available --" : "-- Select Doctor --"}
                                    </option>
                                    {filteredDoctors.map((doc) => (
                                        <option key={doc.doctorId} value={doc.name}>
                                            {doc.name} ({doc.specialty})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* CHANGED: ASSIGNED ROOM FIELD IS NOW EDITABLE (නවතම වෙනස්කම) */}
                            <div>
                                <label className="block mb-1 text-sm font-medium">Assigned Room</label>
                                <input
                                    type="text"
                                    className="w-full border px-3 py-2 rounded-lg bg-slate-50 focus:border-blue-500 outline-none"
                                    placeholder="Enter or edit room number"
                                    value={doctorDetails.roomNumber}
                                    onChange={(e) => setDoctorDetails({ ...doctorDetails, roomNumber: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <button
                            onClick={handleCreateAppointment}
                            className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-5 py-2 rounded-full transition disabled:opacity-50"
                            disabled={!patientDetails._id || !doctorDetails.doctorId || !appointmentDate || loading}
                        >
                            {loading ? "Creating..." : "Confirm Appointment"}
                        </button>
                    </div>
                </div>
            )}

            {/* Active Appointments Table */}
            <h2 className="text-xl font-bold mt-8 mb-4 text-slate-700">Active Appointment Queue</h2>

            <div className="overflow-x-auto rounded-xl border shadow-sm bg-white">
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