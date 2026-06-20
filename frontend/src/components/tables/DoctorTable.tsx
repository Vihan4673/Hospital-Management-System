import React from "react";
import type { Doctor } from "../../types/Doctor.ts";

interface DoctorsTableProps {
    doctors: Doctor[];
    search: string;
    onView: (id: string) => void;
    onDelete: (id: string) => void;
}

const DoctorsTable: React.FC<DoctorsTableProps> = ({
                                                       doctors,
                                                       search,
                                                       onView,
                                                       onDelete,
                                                   }) => {
    return (
        <table className="min-w-full text-sm text-left">
            <thead className="bg-slate-100 text-slate-800 font-semibold border-b">
            <tr>
                <th className="px-4 py-3 text-center">Doctor ID</th>
                <th className="px-4 py-3 text-center">Name</th>
                <th className="px-4 py-3 text-center">Specialty</th>
                <th className="px-4 py-3 text-center">Phone</th>
                <th className="px-4 py-3 text-center">Available Days</th>
                <th className="px-4 py-3 text-center">Fee (LKR)</th>
                <th className="px-4 py-3 text-center">Actions</th>
            </tr>
            </thead>

            <tbody>
            {doctors
                .filter((doctor) => {
                    const term = search.toLowerCase();

                    const daysString = doctor.availableDays?.join(", ").toLowerCase() || "";

                    return (
                        term === "" ||
                        doctor.name.toLowerCase().includes(term) ||
                        doctor.specialty.toLowerCase().includes(term) ||
                        doctor.doctorId.toLowerCase().includes(term) ||
                        doctor.phone.toLowerCase().includes(term) ||
                        daysString.includes(term)
                    );
                })
                .map((doctor) => {
                    const targetId = doctor.doctorId || doctor._id || "";
                    return (
                        <tr
                            key={targetId}
                            className="border-t hover:bg-blue-50/60 transition-colors"
                        >
                            <td className="px-4 py-3 text-center font-medium text-slate-700">{doctor.doctorId}</td>
                            <td className="px-4 py-3 text-center text-slate-800 font-medium">{doctor.name}</td>
                            <td className="px-4 py-3 text-center text-slate-600">{doctor.specialty}</td>
                            <td className="px-4 py-3 text-center text-slate-600">{doctor.phone}</td>

                            {/* Available Days Badges */}
                            <td className="px-4 py-3 text-center">
                                <div className="flex flex-wrap justify-center gap-1 max-w-[200px] mx-auto">
                                    {doctor.availableDays && doctor.availableDays.length > 0 ? (
                                        doctor.availableDays.map((day, index) => (
                                            <span
                                                key={index}
                                                className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-md text-[11px] font-medium"
                                            >
                                  {day}
                                </span>
                                        ))
                                    ) : (
                                        <span className="text-gray-400 text-xs italic">Not Set</span>
                                    )}
                                </div>
                            </td>

                            {/* Channelling Price */}
                            <td className="px-4 py-3 text-center font-semibold text-slate-700">
                                {doctor.channellingPrice ? doctor.channellingPrice.toLocaleString() : "0"}/=
                            </td>

                            <td className="px-4 py-3 text-center">
                                <div className="flex justify-center gap-2 flex-wrap">
                                    <button
                                        className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded-md text-sm font-medium transition shadow-xs active:scale-95"
                                        onClick={() => onView(targetId)}
                                    >
                                        View
                                    </button>
                                    <button
                                        className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded-md text-sm font-medium transition shadow-xs active:scale-95"
                                        onClick={() => onDelete(targetId)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
};

export default DoctorsTable;