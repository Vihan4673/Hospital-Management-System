import  { useEffect, useState } from "react";
import { Plus, Search, User } from "lucide-react";
import type { Reader } from "../types/Reader";
import ReaderTable from "../components/tables/ReaderTable";
import ReaderForm from "../components/forms/ReaderForm";
import {
  addReader,
  deleteReader,
  getAllReaders,
  updateReader,
} from "../services/readerService";
import toast from "react-hot-toast";
import axios from "axios";
import { useAuth } from "../context/useAuth";
import { showConfirmation } from "../components/ConfirmationToast";

const ReadersPage = () => {
  // States for readers list and search
  const [readers, setReaders] = useState<Reader[]>([
    //   {
    //     readerId: "R001",
    //     name: "John Doe",
    //     email: "john@example.com",
    //     phone: "1234567890",
    //     address: "123 Main St",
    //     isActive: true,
    //     createdAt: "2023-01-15",
    //     updatedAt: "2023-01-15",
    //   },
    //   {
    //     readerId: "R002",
    //     name: "Sherul Doe",
    //     email: "sherul@example.com",
    //     phone: "0987654321",
    //     address: "456 Oak St",
    //     isActive: true,
    //     createdAt: "2023-01-16",
    //     updatedAt: "2023-01-16",
    //   },
  ]);

  const [search, setSearch] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [currentReader, setCurrentReader] = useState<Reader | null>(null);
  const [isReaderLoading, setIsReaderLoading] = useState(false);
  const { isAuthenticating, isLoggedIn } = useAuth();

  const fetchAllReaders = async () => {
    try {
      setIsReaderLoading(true);
      const result = await getAllReaders();
      setReaders(result);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.message);
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setIsReaderLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticating && isLoggedIn) {
      fetchAllReaders();
    }
  }, []);

  const handleAddReader = () => {
    setCurrentReader(null);
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setCurrentReader(null);
  };

  const handleViewReader = (id: string) => {
    const reader = readers.find((r) => r.readerId === id);
    if (reader) {
      setCurrentReader(reader);
      setShowPopup(true);
    }
  };

  const handleDeleteReader = async (id: string) => {
    const confirmed = await showConfirmation({
    message: "Are you sure you want to delete this reader?",
    confirmText: "Delete PatientModel",
    cancelText: "Cancel"
  });

  if (!confirmed) return;

  try {
    await deleteReader(id);
    await fetchAllReaders();
    toast.success("PatientModel deleted successfully!");
  } catch (error) {
    if (axios.isAxiosError(error)) {
      toast.error(error.response?.data?.message || error.message);
    } else {
      toast.error("Failed to delete reader");
    }
  }
  };

  const handleSaveReader = (
    readerData: Omit<Reader, "_id" | "readerId" | "createdAt" | "updatedAt">
  ) => {
    setIsSaving(true);

    setTimeout(async () => {
      if (currentReader) {
        // Update existing reader
        try {
          const updatedReader = await updateReader(
            currentReader.readerId,
            readerData
          );
          setReaders((prev) =>
            prev.map((reader) =>
              reader.readerId === currentReader.readerId
                ? updatedReader
                : reader
            )
          );
          toast.success("PatientModel updated successfully")
        } catch (error) {
          if (axios.isAxiosError(error)) {
            toast.error(error.message);
          } else {
            toast.error("Something went wrong");
          }
        }
      } else {
        // Add new reader
        try {
          const newReader = await addReader(readerData);
          setReaders((prev) => [...prev, newReader]);
          toast.success("PatientModel saved successfully")
        } catch (error) {
          if (axios.isAxiosError(error)) {
            toast.error(error.message);
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
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4 text-center flex items-center justify-center gap-2 text-black text-shadow-lg">
        <User className="w-6 h-6" />
        READERS
      </h1>

      {/* Search bar and button to Add reader */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-end mb-4 gap-4">
        {/* Search Input */}
        <div className="flex-1">
          <div className="flex">
              <Search/>
              <label htmlFor="search" className="text-black font-medium mb-1">
                Search
              </label>
          </div>

          <div className="relative">

            <input
              id="search"
              type="text"
              placeholder="Search reader..."
              className="border border-neutral-300 p-2 pr-10 rounded w-full hover:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-400 transition"
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>
        </div>

        {/* Add Button */}
        <button
          onClick={handleAddReader}
          className="flex bg-blue-600 hover:bg-blue-500 hover:scale-105 text-white px-4 py-2 rounded w-full sm:w-auto"
        >
          <Plus/>
          Add
        </button>
      </div>

      <div className="border-b-2 black"></div>

      {/* Readers Table */}
      <div className="h-[calc(100vh-260px)] overflow-y-auto rounded shadow border bg-white">
        <table className="min-w-full text-sm text-left ">
          <ReaderTable
            readers={readers}
            search={search}
            onView={handleViewReader}
            onDelete={handleDeleteReader}
          />
        </table>
      </div>

      {/* PatientModel Form Popup */}
      {showPopup && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-[1000] p-4">

            <ReaderForm
              reader={currentReader}
              isEditing={!!currentReader}
              onSave={handleSaveReader}
              onClose={handleClosePopup}
              isSaving={isSaving}
            />

        </div>
      )}
    </div>
  );
};

export default ReadersPage;

























