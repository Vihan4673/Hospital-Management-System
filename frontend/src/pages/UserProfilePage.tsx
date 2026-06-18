/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';

const UserProfile = () => {
  const [user, setUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form state for editing
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setFormData({
        name: parsedUser.name || '',
        lastName: parsedUser.lastName || '',
        email: parsedUser.email || '',
        phone: parsedUser.phone || '',
      });
    }
  }, []);

  const openEditModal = () => setIsEditing(true);
  const closeEditModal = () => setIsEditing(false);

  const handleInputChange = (e:any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    const updatedUser = {
      ...user,
      name: formData.name,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
    };
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
    closeEditModal();
  };

  if (!user) {
    return <div>Loading user data...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="w-full mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header Section */}
        <div className="bg-blue-600 p-6 text-white flex justify-between">
          <div>
            <h1 className="text-3xl font-bold">Profile</h1>
            <div className="mt-4">
              <h2 className="text-2xl font-semibold">{user.name} {user.lastName}</h2>
              <p className="text-blue-100">Admin</p>
            </div>
          </div>

          <div className='rounded-full h-24 w-24'>
            <img src="/images/user/user-01.jpg" alt="" className='rounded-full' />
          </div>
        </div>

        {/* Divider */}
        <div className="border-b border-gray-200"></div>

        {/* Personal Information Section */}
        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Personal Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-500">First Name</p>
              <p className="font-medium">{user.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Last Name</p>
              <p className="font-medium">{!user.lastName ? "Fernando" : user.lastName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email address</p>
              <p className="font-medium">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="font-medium">{!user.phone ? "0778626300" : user.phone}</p>
            </div>
          </div>

          {/* Bio Section */}
          <div>
            <h4 className="text-sm font-semibold text-gray-500 mb-2">Bio</h4>
            <div className="bg-gray-50 rounded-lg">
              <p className="font-medium">Admin</p>
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <div className="bg-gray-50 px-6 py-4 text-right">
          <button
            onClick={openEditModal}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition duration-200"
          >
            Edit Profile
          </button>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-lg relative">
            <h2 className="text-2xl font-semibold mb-4">Edit Profile</h2>

            <label className="block mb-2">
              First Name
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="mt-1 w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-400"
              />
            </label>

            <label className="block mb-2">
              Last Name
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className="mt-1 w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-400"
              />
            </label>

            <label className="block mb-2">
              Email
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="mt-1 w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-400"
              />
            </label>

            <label className="block mb-4">
              Phone
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="mt-1 w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-400"
              />
            </label>

            <div className="flex justify-end gap-3">
              <button
                onClick={closeEditModal}
                className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
