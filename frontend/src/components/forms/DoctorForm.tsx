import React from "react";
import type { Doctor } from "../../types/Doctor.ts";

interface DoctorFormProps {
  doctor?: Doctor | null;
  isEditing: boolean;
  isSaving: boolean;
  onSave: (doctor: Omit<Doctor, "createdAt" | "updatedAt">) => void;
  onClose: () => void;
}

interface DoctorFormData {
  doctorId: string;
  name: string;
  specialization: string;
  phone: string;
  email: string;
  consultationFee: number;
  availableDays: string[];
}

interface DoctorFormErrors {
  doctorId?: string;
  name?: string;
  specialization?: string;
  phone?: string;
  email?: string;
  consultationFee?: string;
  availableDays?: string;
}

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const DoctorForm: React.FC<DoctorFormProps> = ({
                                                 doctor,
                                                 isEditing,
                                                 isSaving,
                                                 onSave,
                                                 onClose,
                                               }) => {
  const [formData, setFormData] = React.useState<DoctorFormData>({
    doctorId: doctor?.doctorId || "",
    name: doctor?.name || "",
    specialization: doctor?.specialization || "",
    phone: doctor?.phone || "",
    email: doctor?.email || "",
    consultationFee: doctor?.consultationFee ?? 0,
    availableDays: doctor?.availableDays || [],
  });

  const [errors, setErrors] = React.useState<DoctorFormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: DoctorFormErrors = {};

    if (!formData.doctorId.trim()) newErrors.doctorId = "Doctor ID is required";
    if (!formData.name.trim()) newErrors.name = "Doctor name is required";
    if (!formData.specialization.trim()) newErrors.specialization = "Specialization is required";

    // Phone validation (Basic 10 digit validation)
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone.trim())) {
      newErrors.phone = "Enter a valid 10-digit phone number";
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (formData.consultationFee <= 0) {
      newErrors.consultationFee = "Consultation fee must be greater than 0";
    }

    if (formData.availableDays.length === 0) {
      newErrors.availableDays = "Select at least one available day";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "consultationFee" ? Number(value) : value,
    }));
  };

  const handleDayChange = (day: string) => {
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
      onSave(formData);
    }
  };

  return (
      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-3">
          <h2 className="text-2xl font-bold text-center w-full text-teal-800 tracking-wide">
            {isEditing ? "🏥 EDIT DOCTOR PROFILE" : "🏥 REGISTER NEW DOCTOR"}
          </h2>
          <button onClick={onClose} className="hover:bg-rose-50 rounded-full p-1.5 transition-colors group">
            <svg xmlns="http://www.w3.org/2000/svg" height="22px" viewBox="0 -960 960 960" width="22px" className="fill-slate-500 group-hover:fill-rose-600">
              <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
            </svg>
          </button>
        </div>

        <form className="text-sm text-slate-700" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

            {/* Doctor ID */}
            <div>
              <label className="block mb-1.5 font-medium text-slate-600">Doctor ID / Reg No</label>
              <input
                  type="text"
                  name="doctorId"
                  className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg w-full focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition"
                  placeholder="Ex: DOC1042"
                  value={formData.doctorId}
                  onChange={handleChange}
                  disabled={isEditing} // ID usually cannot be changed while editing
              />
              {errors.doctorId && <p className="text-red-500 text-xs mt-1 pl-1">{errors.doctorId}</p>}
            </div>

            {/* Full Name */}
            <div>
              <label className="block mb-1.5 font-medium text-slate-600">Doctor Name</label>
              <input
                  type="text"
                  name="name"
                  className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg w-full focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition"
                  placeholder="Ex: Dr. John Doe"
                  value={formData.name}
                  onChange={handleChange}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1 pl-1">{errors.name}</p>}
            </div>

            {/* Specialization */}
            <div>
              <label className="block mb-1.5 font-medium text-slate-600">Specialization</label>
              <input
                  type="text"
                  name="specialization"
                  className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg w-full focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition"
                  placeholder="Ex: Cardiologist, Pediatrician"
                  value={formData.specialization}
                  onChange={handleChange}
              />
              {errors.specialization && <p className="text-red-500 text-xs mt-1 pl-1">{errors.specialization}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block mb-1.5 font-medium text-slate-600">Contact Number</label>
              <input
                  type="text"
                  name="phone"
                  className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg w-full focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition"
                  placeholder="Ex: 0771234567"
                  value={formData.phone}
                  onChange={handleChange}
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1 pl-1">{errors.phone}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block mb-1.5 font-medium text-slate-600">Email Address</label>
              <input
                  type="email"
                  name="email"
                  className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg w-full focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition"
                  placeholder="Ex: doctor@hospital.com"
                  value={formData.email}
                  onChange={handleChange}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1 pl-1">{errors.email}</p>}
            </div>

            {/* Consultation Fee */}
            <div>
              <label className="block mb-1.5 font-medium text-slate-600">Consultation Fee (LKR)</label>
              <input
                  type="number"
                  name="consultationFee"
                  className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg w-full focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition"
                  placeholder="Ex: 2500"
                  value={formData.consultationFee || ""}
                  min={0}
                  onChange={handleChange}
              />
              {errors.consultationFee && (
                  <p className="text-red-500 text-xs mt-1 pl-1">{errors.consultationFee}</p>
              )}
            </div>

            {/* Available Days Checkboxes (Full width span) */}
            <div className="sm:col-span-2">
              <label className="block mb-2 font-medium text-slate-600">Available Days</label>
              <div className="flex flex-wrap gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                {DAYS_OF_WEEK.map((day) => {
                  const isChecked = formData.availableDays.includes(day);
                  return (
                      <label
                          key={day}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs font-medium cursor-pointer transition-all ${
                              isChecked
                                  ? "bg-teal-50 border-teal-300 text-teal-700 shadow-sm"
                                  : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                          }`}
                      >
                        <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleDayChange(day)}
                            className="hidden"
                        />
                        <span>{isChecked ? "✓" : "+"}</span>
                        {day}
                      </label>
                  );
                })}
              </div>
              {errors.availableDays && (
                  <p className="text-red-500 text-xs mt-1.5 pl-1">{errors.availableDays}</p>
              )}
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-end mt-6 pt-4 border-t border-slate-100">
            <button
                type="submit"
                className="bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-medium px-6 py-2.5 rounded-lg transition-all shadow-sm disabled:opacity-70"
                disabled={isSaving}
            >
              {isSaving ? "Saving Profiles..." : "Save Profile"}
            </button>
          </div>
        </form>
      </div>
  );
};

export default DoctorForm;