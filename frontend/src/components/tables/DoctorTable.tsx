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
        <div className="w-full border border-slate-200 rounded-lg shadow-sm overflow-hidden bg-white">
            <div className="max-h-[450px] overflow-y-auto overflow-x-auto block w-full">
                <table className="min-w-full text-sm text-left border-collapse table-auto">
                    <thead className="bg-slate-100 text-slate-800 font-semibold border-b sticky top-0 z-10 shadow-xs">
                    <tr>
                        <th className="px-4 py-3 text-center">Doctor ID</th>
                        <th className="px-4 py-3 text-center">Name</th>
                        <th className="px-4 py-3 text-center">Specialty</th>
                        <th className="px-4 py-3 text-center">Assigned Room</th>
                        <th className="px-4 py-3 text-center">Phone</th>
                        <th className="px-4 py-3 text-center">Available Days</th>
                        <th className="px-4 py-3 text-center">Available Time</th>
                        <th className="px-4 py-3 text-center">Fee (LKR)</th>
                        <th className="px-4 py-3 text-center">Actions</th>
                    </tr>
                    </thead>

                    <tbody>
                    {doctors
                        .filter((doctor) => {
                            const term = search.toLowerCase().trim();

                            const daysString = doctor.availableDays?.join(", ").toLowerCase() || "";
                            const timeString = `${doctor.startTime || ""} ${doctor.endTime || ""}`.toLowerCase();
                            const roomString = (doctor.roomNumber || "").toLowerCase();

                            return (
                                term === "" ||
                                doctor.name.toLowerCase().includes(term) ||
                                doctor.specialty.toLowerCase().includes(term) ||
                                (doctor.doctorId || "").toLowerCase().includes(term) ||
                                doctor.phone.toLowerCase().includes(term) ||
                                daysString.includes(term) ||
                                timeString.includes(term) ||
                                roomString.includes(term)
                            );
                        })
                        .map((doctor) => {
                            const targetId = doctor._id || doctor.doctorId || "";

                            const formatTime = (timeStr?: string) => {
                                if (!timeStr) return "";
                                const [hours, minutes] = timeStr.split(":");
                                const h = parseInt(hours, 10);
                                const ampm = h >= 12 ? "PM" : "AM";
                                const formattedHours = h % 12 || 12;
                                return `${formattedHours}:${minutes} ${ampm}`;
                            };

                            return (
                                <tr
                                    key={targetId}
                                    className="border-t hover:bg-blue-50/60 transition-colors"
                                >
                                    <td className="px-4 py-3 text-center font-medium text-slate-700">{doctor.doctorId || "N/A"}</td>
                                    <td className="px-4 py-3 text-center text-slate-800 font-medium">{doctor.name}</td>
                                    <td className="px-4 py-3 text-center text-slate-600">{doctor.specialty}</td>

                                    <td className="px-4 py-3 text-center">
                                        {doctor.roomNumber ? (
                                            <span className="bg-slate-100 text-slate-700 font-semibold px-2 py-1 rounded border border-slate-200 text-xs">
                                                {doctor.roomNumber}
                                            </span>
                                        ) : (
                                            <span className="text-rose-400 text-xs italic font-medium">No Room</span>
                                        )}
                                    </td>

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

                                    {/* Available Time Slot */}
                                    <td className="px-4 py-3 text-center">
                                        {doctor.startTime && doctor.endTime ? (
                                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide block whitespace-nowrap">
                                                {formatTime(doctor.startTime)} - {formatTime(doctor.endTime)}
                                            </span>
                                        ) : (
                                            <span className="text-gray-400 text-xs italic">Not Set</span>
                                        )}
                                    </td>

                                    {/* Channelling Price */}
                                    <td className="px-4 py-3 text-center font-semibold text-slate-700">
                                        {doctor.channellingPrice ? doctor.channellingPrice.toLocaleString() : "0"}/=
                                    </td>

                                    <td className="px-4 py-3 text-center">
                                        <div className="flex justify-center gap-2 flex-wrap">
                                            <button
                                                type="button"
                                                className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded-md text-sm font-medium transition shadow-xs active:scale-95 cursor-pointer"
                                                onClick={() => onView(targetId)}
                                            >
                                                View
                                            </button>
                                            <button
                                                type="button"
                                                className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded-md text-sm font-medium transition shadow-xs active:scale-95 cursor-pointer"
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
            </div>
        </div>
    );
};

export default DoctorsTable;