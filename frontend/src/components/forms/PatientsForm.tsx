import React from "react";
import type { Reader } from "../../types/Reader";

interface ReaderFormProps {
  reader?: Reader | null;
  isEditing: boolean;
  onSave: (reader: Omit<Reader, "_id" | "readerId" | "createdAt" | "updatedAt">) => void;
  onClose: () => void;
  isSaving: boolean;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
}

const ReaderForm: React.FC<ReaderFormProps> = ({
  reader,
  isEditing,
  onSave,
  onClose,
  isSaving,
}) => {
  const [name, setName] = React.useState(reader?.name || "");
  const [email, setEmail] = React.useState(reader?.email || "");
  const [phone, setPhone] = React.useState(reader?.phone || "");
  const [address, setAddress] = React.useState(reader?.address || "");
  const [isActive, setIsActive] = React.useState(reader?.isActive ?? true);
  const [errors, setErrors] = React.useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!name.trim()) newErrors.name = "Name is required";
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Enter a valid email";
    }

    if (!phone.trim()) {
      newErrors.phone = "Phone is required";
    } else if (!/^\d{10}$/.test(phone)) {
      newErrors.phone = "Phone must be 10 digits";
    }

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
      address,
      isActive,
    });
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl">
      <div className="flex justify-between items-center mb-6">
        <div className="flex flex-col w-full">
          <h2 className="text-2xl font-bold flex items-center gap-2 justify-center">
            {isEditing ? "EDIT READER" : "ADD READER"}
          </h2>
        </div>
        <button onClick={onClose} className="hover:bg-red-500 rounded-full p-1">
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="black">
            <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
          </svg>
        </button>
      </div>

      <form className="text-sm" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {isEditing && reader && (
            <div>
              <label className="block text-black mb-1">Reader ID</label>
              <input
                type="text"
                className="bg-gray-200 border border-gray-300 p-2 rounded-lg w-full"
                value={reader.readerId}
                readOnly
              />
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-black mb-1">Name</label>
            <input
              type="text"
              className="bg-blue-100 border border-blue-300 p-2 rounded-lg w-full"
              placeholder="Ex: sherul dhanushka"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-black mb-1">Email</label>
            <input
              type="email"
              className="bg-blue-100 border border-blue-300 p-2 rounded-lg w-full"
              placeholder="Ex: sherul@exmaple.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-black mb-1 ">Phone</label>
            <input
              type="text"
              className="bg-blue-100 border border-blue-300 p-2 rounded-lg w-full"
              placeholder="Ex: 07xxxxxxxx"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
          </div>

          {/* Address */}
          <div className="sm:col-span-2">
            <label className="block text-black mb-1">Address</label>
            <input
              type="text"
              className="bg-blue-100 border border-blue-300 p-2 rounded-lg w-full"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
          </div>

          {/* Status */}
          <div>
            <label className="block text-black mb-1">Status</label>
            <select
              className="bg-blue-100 border border-blue-300 p-2 rounded-lg w-full"
              value={isActive ? "active" : "inactive"}
              onChange={(e) => setIsActive(e.target.value === "active")}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            type="submit"
            className="bg-blue-700 hover:bg-blue-600 text-white px-6 py-2 rounded-full transition"
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReaderForm;
