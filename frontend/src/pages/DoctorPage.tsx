import { useEffect, useState } from "react";
import { Stethoscope, Search } from "lucide-react";
import type { Doctor } from "../types/Doctor";
import DoctorTable from "../components/tables/DoctorTable";
import DoctorForm from "../components/forms/DoctorForm";
import {
  addDoctor,
  deleteDoctor,
  getAllDoctors,
  updateDoctor,
} from "../services/DoctorService.ts";
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
        } catch (error) {
          if (axios.isAxiosError(error)) {
            toast.error(error.message);
          } else {
            toast.error("Something went wrong");
          }
        }
      } else {
        try {
          const newDoctor = await addDoctor(doctorData);
          setDoctors((prev) => [...prev, newDoctor]);
          toast.success("Doctor registered successfully");
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
      setShowPopup(false);
    }, 1000);
  };

  return (
      <div className="h-full overflow-y-auto px-4 py-6 bg-slate-50/50">
        <h1 className="text-3xl font-bold mb-4 text-center text-teal-800 flex items-center justify-center gap-2 tracking-wide">
          <Stethoscope className="w-8 h-8 text-teal-600 animate-pulse" />
          DOCTORS REGISTRY
        </h1>

        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-end mb-4 gap-4">
          <div className="flex-1">
            <label htmlFor="search" className="text-slate-700 font-medium mb-1 text-sm block">
              Search Registry
            </label>
            <div className="relative">
              <input
                  id="search"
                  type="text"
                  placeholder="Search by name, specialization, or ID..."
                  className="border border-slate-300 p-2.5 pr-10 rounded-lg w-full bg-white hover:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition shadow-sm text-sm"
                  onChange={(e) => setSearch(e.target.value)}
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            </div>
          </div>

          <button
              onClick={handleAddDoctor}
              className="bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-medium px-5 py-2.5 rounded-lg w-full sm:w-auto shadow-sm transition-all text-sm"
          >
            ➕ Register Doctor
          </button>
        </div>

        <div className="border-b border-slate-200 mb-5"></div>

        {/* FIX: <table> ටැග් එක මෙතනින් ඉවත් කර කෙලින්ම DoctorTable එක ලබා දී ඇත */}
        <div className="h-[calc(100vh-260px)] overflow-y-auto rounded-xl shadow-sm border border-slate-200/60 bg-white">
          {isDoctorLoading ? (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                Loading system profiles...
              </div>
          ) : (
              <DoctorTable
                  doctors={doctors}
                  search={search}
                  onView={handleViewDoctor}
                  onDelete={handleDeleteDoctor}
              />
          )}
        </div>

        {showPopup && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center z-[1000] p-4 transition-all">
              <DoctorForm
                  doctor={currentDoctor}
                  isEditing={!!currentDoctor}
                  onSave={handleSaveDoctor}
                  onClose={handleClosePopup}
                  isSaving={isSaving}
              />
            </div>
        )}
      </div>
  );
};

export default DoctorsPage;