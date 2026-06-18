import { useEffect, useState } from "react";
import { Plus, Search, Users } from "lucide-react";
import type { Patient } from "../types/Patient.ts";
import PatientTable from "../components/tables/PatientTable.tsx";
import PatientForm from "../components/forms/PatientForm.tsx";
import {
    addPatient,
    deletePatient,
    getAllPatients,
    updatePatient,
} from "../services/PatientService.ts";
import toast from "react-hot-toast";
import axios from "axios";
import { useAuth } from "../context/useAuth";
import { showConfirmation } from "../components/ConfirmationToast";

const PatientsPage = () => {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [search, setSearch] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [currentPatient, setCurrentPatient] = useState<Patient | null>(null);
    const [isPatientLoading, setIsPatientLoading] = useState(false);
    const { isAuthenticating, isLoggedIn } = useAuth();

    const fetchAllPatients = async () => {
        try {
            setIsPatientLoading(true);
            const result = await getAllPatients();
            setPatients(result);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                toast.error(error.message);
            } else {
                toast.error("Something went wrong while fetching patients");
            }
        } finally {
            setIsPatientLoading(false);
        }
    };

    useEffect(() => {
        if (!isAuthenticating && isLoggedIn) {
            fetchAllPatients();
        }
    }, [isAuthenticating, isLoggedIn]);

    const handleAddPatient = () => {
        setCurrentPatient(null);
        setShowPopup(true);
    };

    const handleClosePopup = () => {
        setShowPopup(false);
        setCurrentPatient(null);
    };

    const handleViewPatient = (id: string) => {
        const patient = patients.find((p) => p.patientId === id || p._id === id);
        if (patient) {
            setCurrentPatient(patient);
            setShowPopup(true);
        }
    };

    const handleDeletePatient = async (id: string) => {
        const confirmed = await showConfirmation({
            message: "Are you sure you want to delete this patient profile?",
            confirmText: "Delete Patient",
            cancelText: "Cancel"
        });

        if (!confirmed) return;

        try {
            await deletePatient(id);
            await fetchAllPatients();
            toast.success("Patient deleted successfully!");
        } catch (error) {
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data?.message || error.message);
            } else {
                toast.error("Failed to delete patient");
            }
        }
    };

    const handleSavePatient = async (
        patientData: Omit<Patient, "_id" | "patientId" | "createdAt" | "updatedAt">
    ) => {
        setIsSaving(true);

        try {
            const targetId = currentPatient?.patientId || currentPatient?._id || "";

            if (currentPatient && targetId) {
                // Update existing patient
                const updatedPatient = await updatePatient(targetId, patientData);
                setPatients((prev) =>
                    prev.map((patient) =>
                        (patient.patientId === targetId || patient._id === targetId)
                            ? updatedPatient
                            : patient
                    )
                );
                toast.success("Patient updated successfully");
            } else {
                // Add new patient
                const newPatient = await addPatient(patientData);
                setPatients((prev) => [...prev, newPatient]);
                toast.success("Patient saved successfully");
            }
            setShowPopup(false);
            setCurrentPatient(null);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                toast.error(error.message);
            } else {
                toast.error("Something went wrong while saving patient");
            }
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="h-full overflow-y-auto px-4 py-6 bg-slate-50/50 text-slate-800">
            <h1 className="text-3xl font-extrabold mb-4 text-center flex items-center justify-center gap-2 text-teal-800 tracking-wide uppercase">
                <Users className="w-8 h-8 text-teal-600" />
                PATIENTS MANAGEMENT
            </h1>

            {/* Search bar and button to Add patient */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-end mb-4 gap-4">
                {/* Search Input */}
                <div className="flex-1">
                    <div className="flex items-center gap-1 mb-1">
                        <Search className="w-4 h-4 text-slate-500" />
                        <label htmlFor="search" className="text-slate-700 font-medium text-sm block">
                            Search Registered Patients
                        </label>
                    </div>

                    <div className="relative">
                        <input
                            id="search"
                            type="text"
                            placeholder="Search by patient name, ID, age, phone or blood group..."
                            className="border border-slate-300 p-2.5 pr-10 rounded-lg w-full bg-white hover:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition shadow-sm text-sm"
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    </div>
                </div>

                {/* Add Button */}
                <button
                    onClick={handleAddPatient}
                    className="flex items-center justify-center gap-1 bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-semibold px-5 py-2.5 rounded-lg text-sm w-full sm:w-auto shadow-sm transition-all"
                >
                    <Plus className="w-5 h-5" />
                    Register Patient
                </button>
            </div>

            <div className="border-b border-slate-200 mb-5"></div>

            {/* Patients Table Container */}
            <div className="h-[calc(100vh-260px)] overflow-y-auto rounded-xl shadow-sm border border-slate-200/60 bg-white">
                {isPatientLoading ? (
                    <div className="flex items-center justify-center h-full text-slate-400 text-sm animate-pulse">
                        Loading patient records...
                    </div>
                ) : (
                    <div className="min-w-full inline-block align-middle">
                        <PatientTable
                            patients={patients}
                            search={search}
                            onView={handleViewPatient}
                            onDelete={handleDeletePatient}
                        />
                    </div>
                )}
            </div>

            {/* Patient Form Popup */}
            {showPopup && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex justify-center items-center z-[1000] p-4 transition-all">
                    <PatientForm
                        patient={currentPatient}
                        isEditing={!!currentPatient}
                        onSave={handleSavePatient}
                        onClose={handleClosePopup}
                        isSaving={isSaving}
                    />
                </div>
            )}
        </div>
    );
};

export default PatientsPage;