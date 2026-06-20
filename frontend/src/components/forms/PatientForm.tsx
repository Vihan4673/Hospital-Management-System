import React, { useEffect } from "react";
import type { Patient } from "../../types/Patient.ts";

interface PatientFormProps {
  patient?: Patient | null;
  isEditing: boolean;
  onSave: (patient: Omit<Patient, "_id" | "patientId" | "createdAt" | "updatedAt">) => void;
  onClose: () => void;
  isSaving: boolean;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  age?: string;
  gender?: string;
  address?: string;
}

const PatientForm: React.FC<PatientFormProps> = ({
                                                   patient,
                                                   isEditing,
                                                   onSave,
                                                   onClose,
                                                   isSaving,
                                                 }) => {
  const [name, setName] = React.useState(patient?.name || "");
  const [email, setEmail] = React.useState(patient?.email || "");
  const [phone, setPhone] = React.useState(patient?.phone || "");
  const [age, setAge] = React.useState(patient?.age || "");
  const [gender, setGender] = React.useState(patient?.gender || "Male");
  const [address, setAddress] = React.useState(patient?.address || "");
  const [errors, setErrors] = React.useState<FormErrors>({});

  // 👈 FIX: වෙනත් පේෂන්ට් කෙනෙක් Edit කරන්න තෝරන විට Form එකේ Inputs වල අගයන් auto update වන කොටස
  useEffect(() => {
    setName(patient?.name || "");
    setEmail(patient?.email || "");
    setPhone(patient?.phone || "");
    setAge(patient?.age || "");
    setGender(patient?.gender || "Male");
    setAddress(patient?.address || "");
    setErrors({}); // පරණ Errors තියෙනවා නම් ඒවාත් Clear කරයි
  }, [patient]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!name.trim()) newErrors.name = "Patient name is required";

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (!phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(phone)) {
      newErrors.phone = "Phone number must be 10 digits";
    }

    if (age === "" || Number(age) <= 0 || Number(age) > 120) {
      newErrors.age = "Enter a valid age (1-120)";
    }

    if (!gender) newErrors.gender = "Gender is required";

    if (!address.trim()) newErrors.address = "Address is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    onSave({
      name,
      email,
      phone,
      age: Number(age),
      gender,
      address,
    });
  };

  return (
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl text-gray-700 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex flex-col w-full">
            <h2 className="text-2xl font-bold flex items-center gap-2 justify-center text-teal-800 tracking-wide uppercase">
              {isEditing ? "EDIT PATIENT DETAILS" : "REGISTER NEW PATIENT"}
            </h2>
          </div>
          <button type="button" onClick={onClose} className="hover:bg-gray-100 rounded-full p-1.5 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor" className="text-gray-500">
              <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
            </svg>
          </button>
        </div>

        <form className="text-sm" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {isEditing && patient && (
                <div className="sm:col-span-2">
                  <label className="block text-slate-800 font-medium mb-1">Patient ID</label>
                  <input
                      type="text"
                      className="bg-slate-100 border border-slate-200 p-2 rounded-lg w-full outline-none font-medium text-slate-500 cursor-not-allowed"
                      value={patient.patientId || ""}
                      readOnly
                  />
                </div>
            )}

            <div>
              <label className="block text-slate-800 font-medium mb-1">Full Name</label>
              <input
                  type="text"
                  className="bg-slate-50 border border-neutral-300 p-2 rounded-lg w-full focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition"
                  placeholder="Ex: John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-slate-800 font-medium mb-1">Email Address</label>
              <input
                  type="email"
                  className="bg-slate-50 border border-neutral-300 p-2 rounded-lg w-full focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition"
                  placeholder="Ex: johndoe@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-slate-800 font-medium mb-1">Phone Number</label>
              <input
                  type="text"
                  className="bg-slate-50 border border-neutral-300 p-2 rounded-lg w-full focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition"
                  placeholder="Ex: 0771234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-slate-800 font-medium mb-1">Age</label>
              <input
                  type="number"
                  min="1"
                  max="120"
                  className="bg-slate-50 border border-neutral-300 p-2 rounded-lg w-full focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition"
                  placeholder="Ex: 28"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
              />
              {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age}</p>}
            </div>

            <div>
              <label className="block text-slate-800 font-medium mb-1">Gender</label>
              <select
                  className="bg-slate-50 border border-neutral-300 p-2 rounded-lg w-full focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition cursor-pointer"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-800 font-medium mb-1">Residential Address</label>
              <input
                  type="text"
                  className="bg-slate-50 border border-neutral-300 p-2 rounded-lg w-full focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition"
                  placeholder="Ex: No 123, Main Street, Colombo"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
              />
              {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-full border border-gray-300 font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
                type="submit"
                className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-full font-medium transition disabled:opacity-70"
                disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save Details"}
            </button>
          </div>
        </form>
      </div>
  );
};

export default PatientForm;