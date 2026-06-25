import React from "react";
import type { Doctor } from "../../types/Doctor";

interface DoctorFormProps {
  doctor?: Doctor | null;
  existingDoctors: Doctor[];
  isEditing: boolean;
  isSaving: boolean;
  onSave: (doctor: Omit<Doctor, "createdAt" | "updatedAt">) => void;
  onClose: () => void;
}

interface DoctorFormData {
  doctorId: string;
  name: string;
  email: string;
  phone: string;
  specialty: string;
  roomNumber: string;
  channellingPrice: number | string;
  availableDays: string[];
  startTime: string;
  endTime: string;
}

interface DoctorFormErrors {
  name?: string;
  email?: string;
  phone?: string;
  specialty?: string;
  roomNumber?: string;
  channellingPrice?: string;
  availableDays?: string;
  time?: string;
}

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const DoctorForm: React.FC<DoctorFormProps> = ({
                                                 doctor,
                                                 existingDoctors = [], // Default empty array
                                                 isEditing,
                                                 isSaving,
                                                 onSave,
                                                 onClose,
                                               }) => {
  const [formData, setFormData] = React.useState<DoctorFormData>({
    doctorId: doctor?.doctorId || "",
    name: doctor?.name || "",
    email: doctor?.email || "",
    phone: doctor?.phone || "",
    specialty: doctor?.specialty || "",
    roomNumber: doctor?.roomNumber || "",
    channellingPrice: doctor?.channellingPrice || "",
    availableDays: doctor?.availableDays || [],
    startTime: doctor?.startTime || "",
    endTime: doctor?.endTime || "",
  });

  const [errors, setErrors] = React.useState<DoctorFormErrors>({});

  const isTimeOverlapping = (start1: string, end1: string, start2: string, end2: string) => {
    return start1 < end2 && start2 < end1;
  };

  const validateForm = (): boolean => {
    const newErrors: DoctorFormErrors = {};

    if (!formData.name.trim()) newErrors.name = "Doctor name is required";

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\+?[0-9]{9,12}$/.test(formData.phone.trim())) {
      newErrors.phone = "Enter a valid phone number";
    }

    if (!formData.specialty.trim()) newErrors.specialty = "Specialty is required";

    if (!formData.roomNumber.trim()) {
      newErrors.roomNumber = "Room number is required";
    }

    if (formData.channellingPrice === "" || Number(formData.channellingPrice) <= 0) {
      newErrors.channellingPrice = "Please enter a valid channelling price";
    }

    if (formData.availableDays.length === 0) {
      newErrors.availableDays = "Please select at least one available day";
    }

    if (!formData.startTime || !formData.endTime) {
      newErrors.time = "Both Start Time and End Time are required";
    } else if (formData.startTime >= formData.endTime) {
      newErrors.time = "Start Time must be earlier than End Time";
    }

    if (formData.roomNumber.trim() && formData.startTime && formData.endTime && formData.availableDays.length > 0) {

      const hasConflict = existingDoctors.some((doc) => {
        if (isEditing && doc._id === doctor?._id) return false;

        const isSameRoom = doc.roomNumber?.toLowerCase().trim() === formData.roomNumber.toLowerCase().trim();
        const sharesDays = doc.availableDays.some((day) => formData.availableDays.includes(day));
        const sharesTime = isTimeOverlapping(formData.startTime, formData.endTime, doc.startTime, doc.endTime);

        return isSameRoom && sharesDays && sharesTime;
      });

      if (hasConflict) {
        newErrors.roomNumber = "This room is already reserved by another doctor for the selected day/time slot.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "channellingPrice" ? (value === "" ? "" : Number(value)) : value,
    }));
  };

  const handleDayToggle = (day: string) => {
    setFormData((prev) => {
      const isAlreadySelected = prev.availableDays.includes(day);
      const updatedDays = isAlreadySelected
          ? prev.availableDays.filter((d) => d !== day)
          : [...prev.availableDays, day];

      return { ...prev, availableDays: updatedDays };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave({
        ...formData,
        channellingPrice: Number(formData.channellingPrice),
        _id: doctor?._id || "",
        isActive: doctor?.isActive ?? true
      });
    }
  };

  return (
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-center w-full text-blue-800">
            {isEditing ? "EDIT DOCTOR DETAILS" : "ADD NEW DOCTOR"}
          </h2>
          <button type="button" onClick={onClose} className="hover:bg-gray-100 rounded-full p-1.5 transition-colors cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor" className="text-gray-500">
              <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
            </svg>
          </button>
        </div>

        <form className="text-sm text-gray-700" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {isEditing && (
                <div className="sm:col-span-2">
                  <label className="block mb-1 font-medium">Doctor ID</label>
                  <input
                      type="text"
                      name="doctorId"
                      disabled={true}
                      className="border p-2 rounded-lg w-full bg-slate-100 disabled:opacity-70 text-slate-500 outline-none transition cursor-not-allowed"
                      value={formData.doctorId}
                      readOnly
                  />
                </div>
            )}

            <div>
              <label className="block mb-1 font-medium">Full Name</label>
              <input
                  type="text"
                  name="name"
                  className="border p-2 rounded-lg w-full bg-slate-50 focus:border-blue-500 outline-none transition"
                  placeholder="Ex: Dr. John Doe"
                  value={formData.name}
                  onChange={handleChange}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block mb-1 font-medium">Email Address</label>
              <input
                  type="email"
                  name="email"
                  className="border p-2 rounded-lg w-full bg-slate-50 focus:border-blue-500 outline-none transition"
                  placeholder="johndoe@hospital.com"
                  value={formData.email}
                  onChange={handleChange}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block mb-1 font-medium">Phone Number</label>
              <input
                  type="text"
                  name="phone"
                  className="border p-2 rounded-lg w-full bg-slate-50 focus:border-blue-500 outline-none transition"
                  placeholder="Ex: 0771234567"
                  value={formData.phone}
                  onChange={handleChange}
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label className="block mb-1 font-medium">Specialty</label>
              <input
                  type="text"
                  name="specialty"
                  className="border p-2 rounded-lg w-full bg-slate-50 focus:border-blue-500 outline-none transition"
                  placeholder="Ex: Cardiologist / Pediatrician"
                  value={formData.specialty}
                  onChange={handleChange}
              />
              {errors.specialty && <p className="text-red-500 text-xs mt-1">{errors.specialty}</p>}
            </div>

            <div>
              <label className="block mb-1 font-medium">Assigned Room Number</label>
              <input
                  type="text"
                  name="roomNumber"
                  className="border p-2 rounded-lg w-full bg-slate-50 focus:border-blue-500 outline-none transition"
                  placeholder="Ex: Room 101 / OPD-02"
                  value={formData.roomNumber}
                  onChange={handleChange}
              />
              {errors.roomNumber && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.roomNumber}</p>}
            </div>

            <div>
              <label className="block mb-1 font-medium">Channelling Fee (LKR)</label>
              <input
                  type="number"
                  name="channellingPrice"
                  min="0"
                  className="border p-2 rounded-lg w-full bg-slate-50 focus:border-blue-500 outline-none transition"
                  placeholder="Ex: 2500"
                  value={formData.channellingPrice}
                  onChange={handleChange}
              />
              {errors.channellingPrice && <p className="text-red-500 text-xs mt-1">{errors.channellingPrice}</p>}
            </div>

            <div className="bg-slate-50 border p-4 rounded-lg sm:col-span-2 grid grid-cols-2 gap-4">
              <div className="col-span-2 mb-1">
                <label className="font-semibold text-blue-800">Channelling Session Time</label>
              </div>
              <div>
                <label className="block mb-1 font-medium text-xs text-gray-600">Start Time (From)</label>
                <input
                    type="time"
                    name="startTime"
                    className="border p-2 rounded-lg w-full bg-white focus:border-blue-500 outline-none transition cursor-pointer"
                    value={formData.startTime}
                    onChange={handleChange}
                />
              </div>
              <div>
                <label className="block mb-1 font-medium text-xs text-gray-600">End Time (To)</label>
                <input
                    type="time"
                    name="endTime"
                    className="border p-2 rounded-lg w-full bg-white focus:border-blue-500 outline-none transition cursor-pointer"
                    value={formData.endTime}
                    onChange={handleChange}
                />
              </div>
              {errors.time && <p className="text-red-500 text-xs col-span-2 mt-1">{errors.time}</p>}
            </div>

            <div className="sm:col-span-2 bg-slate-50 p-4 rounded-lg border">
              <label className="block mb-2 font-semibold text-blue-800">Available Days for Channelling</label>
              <div className="flex flex-wrap gap-2">
                {DAYS_OF_WEEK.map((day) => {
                  const isChecked = formData.availableDays.includes(day);
                  return (
                      <button
                          key={day}
                          type="button"
                          onClick={() => handleDayToggle(day)}
                          className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all cursor-pointer ${
                              isChecked
                                  ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
                          }`}
                      >
                        {day}
                      </button>
                  );
                })}
              </div>
              {errors.availableDays && <p className="text-red-500 text-xs mt-2">{errors.availableDays}</p>}
            </div>

          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-full border border-gray-300 font-medium text-gray-700 hover:bg-gray-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-full font-medium shadow-sm transition active:scale-98 disabled:opacity-70 cursor-pointer"
                disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save Details"}
            </button>
          </div>
        </form>
      </div>
  );
};

export default DoctorForm;