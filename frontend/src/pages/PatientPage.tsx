import { useEffect, useState } from "react";
import { Plus, Search, Users } from "lucide-react";
import type { Patient } from "../types/Patient";
import PatientTable from "../components/tables/PatientTable";
import PatientForm from "../components/forms/PatientForm";
import {
    addPatient,
    deletePatient,
    getAllPatients,
    updatePatient,
} from "../services/PatientService";
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
                            ? (updatedPatient as Patient) // නිවැරදි කිරීම: Explicit Type Casting
                            : patient
                    )
                );
                toast.success("Patient updated successfully");
            } else {
                // Add new patient
                const newPatient = await addPatient(patientData);
                setPatients((prev) => [...prev, newPatient as Patient]); // නිවැරදි කිරීම: Explicit Type Casting
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
        <div className="h-full px-1 py-2 bg-transparent text-slate-800 animate-fade-in">

            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 border-b border-slate-200 pb-4 gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2 uppercase">
                        <Users className="w-7 h-7 text-blue-600" />
                        Patients Management
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Monitor patient registration, details, and clinical profiles.</p>
                </div>

                <div className="flex items-center gap-2 bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider self-start md:self-auto">
                    {patients.length} Active Records
                </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center mb-6 gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm shadow-slate-100/50">
                <div className="flex-1 relative">
                    <input
                        id="search"
                        type="text"
                        value={search} // නිවැරදි කිරීම: Controlled Input එකක් බවට පත් කිරීම
                        placeholder="Search by patient name, ID, age, phone or blood group..."
                        className="border border-slate-200 pl-10 pr-4 py-2.5 rounded-full w-full bg-slate-50/50 hover:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all text-sm placeholder-slate-400"
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                </div>

                <button
                    onClick={handleAddPatient}
                    className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold px-6 py-2.5 rounded-full shadow-md shadow-blue-500/15 transition-all text-sm flex items-center justify-center gap-1.5"
                >
                    <Plus className="w-4 h-4 stroke-[3]" /> Register Patient
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden min-h-[400px]">
                {isPatientLoading ? (
                    <div className="flex flex-col items-center justify-center h-96 text-slate-400 gap-2">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-sm font-medium mt-1 animate-pulse">Loading patient records...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto min-w-full inline-block align-middle">
                        <PatientTable
                            patients={patients}
                            search={search}
                            onView={handleViewPatient}
                            onDelete={handleDeletePatient}
                        />
                    </div>
                )}
            </div>

            {showPopup && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center z-[1000] p-4 transition-all">
                    <div className="animate-scale-in w-full max-w-2xl">
                        <PatientForm
                            patient={currentPatient}
                            isEditing={!!currentPatient}
                            onSave={handleSavePatient}
                            onClose={handleClosePopup}
                            isSaving={isSaving}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default PatientsPage;