import { useEffect, useState } from "react";
import { Stethoscope, Search, Plus } from "lucide-react";
import type { Doctor } from "../types/Doctor";
import DoctorTable from "../components/tables/DoctorTable";
import DoctorForm from "../components/forms/DoctorForm";
import {
  addDoctor,
  deleteDoctor,
  getAllDoctors,
  updateDoctor,
} from "../services/DoctorService";
import toast from "react-hot-toast";
import axios from "axios";
import { useAuth } from "../context/useAuth";

const DoctorsPage = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [search, setSearch] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [currentDoctor, setCurrentDoctor] = useState<Doctor | null>(null);
  const [isDoctorLoading, setIsDoctorLoading] = useState(false);
  const { isAuthenticating, isLoggedIn } = useAuth();

  const fetchAllDoctors = async () => {
    try {
      setIsDoctorLoading(true);
      const result = await getAllDoctors();
      setDoctors(result);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.message);
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setIsDoctorLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticating && isLoggedIn) {
      fetchAllDoctors();
    }
  }, [isAuthenticating, isLoggedIn]);

  const handleAddDoctor = () => {
    setCurrentDoctor(null);
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setCurrentDoctor(null);
  };

  const handleViewDoctor = (id: string) => {
    const doctor = doctors.find((d) => d.doctorId === id || d._id === id);
    if (doctor) {
      setCurrentDoctor(doctor);
      setShowPopup(true);
    }
  };

  const handleDeleteDoctor = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this doctor profile?")) {
      try {
        await deleteDoctor(id);
        toast.success("Doctor profile removed successfully");
        fetchAllDoctors();
      } catch (error) {
        if (axios.isAxiosError(error)) {
          toast.error(error.message);
        } else {
          toast.error("Something went wrong");
        }
      }
    }
  };

  const handleSaveDoctor = (
      doctorData: Omit<Doctor, "createdAt" | "updatedAt">
  ) => {
    setIsSaving(true);

    setTimeout(async () => {
      const activeId = currentDoctor?._id || currentDoctor?.doctorId;

      if (currentDoctor && activeId) {
        try {
          const updatedDoctor = await updateDoctor(activeId, doctorData);
          setDoctors((prev) =>
              prev.map((doc) =>
                  doc.doctorId === activeId || doc._id === activeId ? updatedDoctor : doc
              )
          );
          toast.success("Doctor details updated successfully");
          setShowPopup(false);
        } catch (error) {
          if (axios.isAxiosError(error)) {
            const errorMsg = error.response?.data?.message || error.message;
            toast.error(errorMsg);
          } else {
            toast.error("Something went wrong");
          }
        }
      } else {
        try {
          const newDoctor = await addDoctor(doctorData);
          setDoctors((prev) => [...prev, newDoctor]);
          toast.success("Doctor registered successfully");
          setShowPopup(false);
        } catch (error) {
          if (axios.isAxiosError(error)) {
            const errorMsg = error.response?.data?.message || error.message;
            toast.error(errorMsg);
          } else {
            toast.error("Something went wrong");
          }
        }
      }

      setIsSaving(false);
    }, 500);
  };

  return (
      <div className="h-full px-1 py-2 bg-transparent text-slate-800 animate-fade-in">

        {/* Title Block */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 border-b border-slate-200 pb-4 gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2 uppercase">
              <Stethoscope className="w-7 h-7 text-blue-600 animate-pulse" />
              Doctors Registry
            </h1>
            <p className="text-sm text-gray-500 mt-1">Manage and monitor hospital medical staff profiles.</p>
          </div>

          <div className="flex items-center gap-2 bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider self-start md:self-auto">
            {doctors.length} Registered Staff
          </div>
        </div>

        {/* Search & Actions Controls Row */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center mb-6 gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm shadow-slate-100/50">
          <div className="flex-1 relative">
            <input
                id="search"
                type="text"
                placeholder="Search by name, specialization, or ID..."
                className="border border-slate-200 pl-10 pr-4 py-2.5 rounded-full w-full bg-slate-50/50 hover:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all text-sm placeholder-slate-400"
                onChange={(e) => setSearch(e.target.value)}
            />
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          </div>

          <button
              onClick={handleAddDoctor}
              className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold px-6 py-2.5 rounded-full shadow-md shadow-blue-500/15 transition-all text-sm flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> Register Doctor
          </button>
        </div>

        {/* Doctors Table Card Container */}
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 min-h-[400px]">
          {isDoctorLoading ? (
              <div className="flex flex-col items-center justify-center h-96 text-slate-400 gap-2">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm font-medium mt-1">Loading system profiles...</p>
              </div>
          ) : (
              <div>
                <DoctorTable
                    doctors={doctors}
                    search={search}
                    onView={handleViewDoctor}
                    onDelete={handleDeleteDoctor}
                />
              </div>
          )}
        </div>

        {/* Sleek Popup Form Modal */}
        {showPopup && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center z-[1000] p-4 transition-all">
              <div className="animate-scale-in">
                <DoctorForm
                    doctor={currentDoctor}
                    existingDoctors={doctors}
                    isEditing={!!currentDoctor}
                    onSave={handleSaveDoctor}
                    onClose={handleClosePopup}
                    isSaving={isSaving}
                />
              </div>
            </div>
        )}
      </div>
  );
};

export default DoctorsPage;