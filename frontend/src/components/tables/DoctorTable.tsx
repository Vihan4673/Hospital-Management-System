import React from "react";
import type { Doctor } from "../../types/Doctor.ts";

interface DoctorTableProps {
  doctors: Doctor[];
  search: string;
  onView: (id: string) => void;
  onDelete: (id: string) => void;
}

const DoctorTable: React.FC<DoctorTableProps> = ({
                                                   doctors,
                                                   search,
                                                   onView,
                                                   onDelete,
                                                 }) => {
  return (
      <>
        {/* Medical/Clinical Style Table Head */}
        <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
        <tr>
          <th className="px-4 py-3 text-center">Doctor ID</th>
          <th className="px-4 py-3 text-left">Name</th>
          <th className="px-4 py-3 text-left">Specialization</th>
          <th className="px-4 py-3 text-center">Phone</th>
          <th className="px-4 py-3 text-left">Email</th>
          <th className="px-4 py-3 text-right">Fee (LKR)</th>
          <th className="px-4 py-3 text-center">Available Days</th>
          <th className="px-4 py-3 text-center">Actions</th>
        </tr>
        </thead>

        <tbody className="divide-y divide-slate-100 text-slate-600">
        {doctors
            .filter((doc) => {
              const term = search.toLowerCase();
              return (
                  term === "" ||
                  doc.name.toLowerCase().includes(term) ||
                  doc.specialization.toLowerCase().includes(term) ||
                  doc.doctorId.toLowerCase().includes(term) ||
                  doc.email.toLowerCase().includes(term)
              );
            })
            .map((doc) => {
              // Using doctorId or fallback to backend mongo _id if doctorId is missing
              const activeId = doc.doctorId || doc._id || "";

              return (
                  <tr
                      key={activeId}
                      className="hover:bg-slate-50 transition-colors"
                  >
                    {/* Doctor ID */}
                    <td className="px-4 py-3 text-center font-medium text-slate-900">{doc.doctorId}</td>

                    {/* Name */}
                    <td className="px-4 py-3 text-left font-medium text-slate-800">{doc.name}</td>

                    {/* Specialization */}
                    <td className="px-4 py-3 text-left">
                  <span className="bg-teal-50 text-teal-700 px-2.5 py-1 rounded-md text-xs font-medium border border-teal-100">
                    {doc.specialization}
                  </span>
                    </td>

                    {/* Phone */}
                    <td className="px-4 py-3 text-center text-xs">{doc.phone}</td>

                    {/* Email */}
                    <td className="px-4 py-3 text-left text-xs text-slate-500">{doc.email}</td>

                    {/* Consultation Fee */}
                    <td className="px-4 py-3 text-right font-medium text-slate-700">
                      {doc.consultationFee.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                    </td>

                    {/* Available Days */}
                    <td className="px-4 py-3 text-center">
                      <div className="flex flex-wrap justify-center gap-1 max-w-[180px] mx-auto">
                        {doc.availableDays?.map((day, idx) => (
                            <span key={idx} className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px] font-medium">
                        {day.substring(0, 3)} {/* Showing Short names like Mon, Tue */}
                      </span>
                        ))}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                            className="bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-600 hover:text-white px-3 py-1 rounded-md text-xs font-medium transition-all"
                            onClick={() => onView(activeId)}
                        >
                          View
                        </button>
                        <button
                            className="bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-600 hover:text-white px-3 py-1 rounded-md text-xs font-medium transition-all"
                            onClick={() => onDelete(activeId)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
              );
            })}
        </tbody>
      </>
  );
};

export default DoctorTable;