import React, { useEffect, useState } from 'react';

interface UserData {
  name: string;
  email: string;
  phone?: string;
  role?: string;
  doctorId?: string;
}

const UserProfile = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // ⚡ FIX: Full Name එක පමණක් භාවිතා කිරීම
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setFormData({
        fullName: parsedUser.name || '',
        email: parsedUser.email || '',
        phone: parsedUser.phone || '',
      });
    }
  }, []);

  const openEditModal = () => setIsEditing(true);
  const closeEditModal = () => setIsEditing(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (!user) return;

    const updatedUser = {
      ...user,
      name: formData.fullName,
      email: formData.email,
      phone: formData.phone,
    };

    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
    closeEditModal();
  };

  if (!user) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 text-blue-600 font-medium">
          Loading user data...
        </div>
    );
  }

  // User Role එක ලස්සනට පෙන්වීමට (Capitalized)
  const displayRole = user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "Patient";

  return (
      <div className="min-h-screen bg-slate-50/50 py-12 px-4 flex justify-center items-start">
        <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100">

          {/* Header Section - Modern Gradient Line */}
          <div className="relative bg-gradient-to-r from-blue-700 to-blue-600 p-8 text-white flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:24px_24px]"></div>

            <div className="relative z-10 text-center sm:text-left">
            <span className="bg-blue-500/30 text-blue-200 text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full border border-blue-400/20">
              {displayRole} Account
            </span>
              <h2 className="text-3xl font-black tracking-tight mt-3">{user.name}</h2>
              <p className="text-blue-200/90 text-sm mt-1">{user.email}</p>
            </div>

            {/* Avatar Area */}
            <div className="relative z-10 flex-shrink-0">
              <div className="absolute inset-0 bg-white rounded-full rotate-6 opacity-20 blur-sm"></div>
              <div className="relative h-24 w-24 rounded-full border-4 border-white/20 overflow-hidden bg-slate-100 flex items-center justify-center shadow-lg">
                {/* Profile Image එකක් නැත්නම් පළමු අකුර පෙන්වයි */}
                <span className="text-3xl font-black text-blue-600">
                {user.name ? user.name.charAt(0).toUpperCase() : "M"}
              </span>
              </div>
            </div>
          </div>

          {/* Profile Details Section */}
          <div className="p-8">
            <h3 className="text-lg font-bold text-slate-800 tracking-tight uppercase mb-6 flex items-center gap-2">
              <span className="w-1 h-5 bg-blue-600 rounded-full"></span>
              Personal Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Name</p>
                <p className="font-semibold text-slate-700 mt-1">{user.name}</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</p>
                <p className="font-semibold text-slate-700 mt-1">{user.email}</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Phone Number</p>
                <p className="font-semibold text-slate-700 mt-1">{user.phone || "Not Provided"}</p>
              </div>

              {user.role === "doctor" && (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Doctor ID</p>
                    <p className="font-semibold text-blue-600 mt-1">{user.doctorId || "DOC-PORTAL"}</p>
                  </div>
              )}
            </div>

            <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl">
              <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-1">Account Privileges</h4>
              <p className="text-sm text-blue-700/90 font-medium">
                Registered as a verified {user.role || "patient"}. You have standard access to the Medicare Portal features.
              </p>
            </div>
          </div>

          <div className="bg-slate-50 px-8 py-5 text-right border-t border-slate-100 flex justify-end">
            <button
                onClick={openEditModal}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-6 py-2.5 rounded-full transition-all active:scale-95 shadow-sm shadow-blue-500/20"
            >
              Edit Profile
            </button>
          </div>
        </div>

        {/* Edit Modal (Sleek Popup) */}
        {isEditing && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in">
              <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl border border-slate-100 relative transform transition-all">
                <h2 className="text-xl font-extrabold text-slate-800 tracking-tight mb-5">EDIT PROFILE</h2>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Full Name</label>
                    <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="w-full border border-slate-200 rounded-full px-4 py-2.5 text-sm outline-none focus:border-blue-600 transition-colors"
                        placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Email Address</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full border border-slate-200 rounded-full px-4 py-2.5 text-sm outline-none focus:border-blue-600 transition-colors"
                        placeholder="Enter email address"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Phone Number</label>
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full border border-slate-200 rounded-full px-4 py-2.5 text-sm outline-none focus:border-blue-600 transition-colors"
                        placeholder="Enter phone number"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                      onClick={closeEditModal}
                      className="px-5 py-2.5 rounded-full border border-slate-200 text-sm font-medium text-slate-500 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                      onClick={handleSave}
                      className="px-6 py-2.5 rounded-full bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm shadow-blue-500/15"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
        )}
      </div>
  );
};

export default UserProfile;