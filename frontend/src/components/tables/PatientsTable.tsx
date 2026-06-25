import React from "react";
import  type {Reader}  from "../../types/Reader";

interface ReaderTableProps {
  readers: Reader[];
  search: string;
  onView: (id: string) => void;
  onDelete: (id: string) => void;
}

const ReaderTable: React.FC<ReaderTableProps> = ({ readers, search, onView, onDelete }) => {
  return (
     <>
      <thead className="bg-gray-100 text-gray-800 font-medium">
        <tr>
          <th className="px-4 py-2 text-center">Reader ID</th>
          <th className="px-4 py-2 text-center">Name</th>
          <th className="px-4 py-2 text-center">Email</th>
          <th className="px-4 py-2 text-center">Phone</th>
          <th className="px-4 py-2 text-center">Status</th>
          <th className="px-4 py-2 text-center">Actions</th>
        </tr>
      </thead>

      <tbody>
        {readers
          .filter((reader) => {
            const term = search.toLowerCase();
            return (
              term === "" ||
              reader.name.toLowerCase().includes(term) ||
              reader.email.toLowerCase().includes(term) ||
              reader.phone.includes(term) ||
              reader.readerId.toLowerCase().includes(term)
            );
          })
          .map((reader) => (
            <tr
              key={reader.readerId}
              className="border-t hover:bg-blue-300 hover:scale-105 transition-all "
            >
              <td className="px-4 py-2 text-center">{reader.readerId}</td>
              <td className="px-4 py-2 text-center">{reader.name}</td>
              <td className="px-4 py-2 text-center">{reader.email}</td>
              <td className="px-4 py-2 text-center">{reader.phone}</td>
              <td className="px-4 py-2 text-center">
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    reader.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {reader.isActive ? "Active" : "Inactive"}
                </span>
              </td>
              <td className="px-4 py-2 text-center">
                <div className="flex justify-center gap-2 flex-wrap">
                  <button
                    className="bg-blue-600 hover:bg-blue-500 hover:scale-105 text-white px-3 py-1 rounded text-sm"
                    onClick={() => onView(reader.readerId)}
                  >
                    View
                  </button>
                  <button
                    className="bg-red-600 hover:bg-red-500 hover:scale-105 text-white px-3 py-1 rounded text-sm"
                    onClick={() => onDelete(reader.readerId)}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
      </tbody>
    </>
  );
};

export default ReaderTable;