import React from "react";
import type { Doctor } from "../../types/Doctor.ts";
import type { Appointment } from "../../types/Appointment.ts";
import type { Patient } from "../../types/Patient.ts";

interface AppointmentTableProps {
    activeAppointments: Appointment[];
    search: string;
    onComplete: (appointmentId: string) => void;
}

const AppointmentTable: React.FC<AppointmentTableProps> = ({
                                                               activeAppointments,
                                                               search,
                                                               onComplete,
                                                           }) => {
    return (
        <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse text-sm bg-white">
                <thead className="bg-slate-100 text-slate-800 font-semibold border-b sticky top-0 z-10 shadow-sm">
                <tr>
                    <th className="p-3 text-center border-b">Patient Name</th>
                    <th className="p-3 text-center border-b">Doctor Name</th>
                    {/* 💡 1. ROOM NUMBER සඳහා නව COLUMN එකක් එකතු කළා */}
                    <th className="p-3 text-center border-b">Assigned Room</th>
                    <th className="p-3 text-center border-b">Appointment Date & Time</th>
                    <th className="p-3 text-center border-b">Status</th>
                    <th className="p-3 text-center border-b">Action</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                {activeAppointments.length === 0 && (
                    <tr>
                        <td colSpan={6} className="text-center py-6 text-gray-400 font-medium bg-slate-50/50">
                            No active appointments in the queue.
                        </td>
                    </tr>
                )}

                {activeAppointments
                    .filter((appointment: Appointment) => {
                        const term = search.toLowerCase().trim();
                        if (term === "") return true;

                        const patientName = typeof appointment.patient === "object"
                            ? (appointment.patient as Patient)?.name?.toLowerCase() || ""
                            : "";
                        const doctorName = typeof appointment.doctor === "object"
                            ? (appointment.doctor as Doctor)?.name?.toLowerCase() || ""
                            : "";
                        const appointmentId = appointment._id?.toLowerCase() || "";

                        return patientName.includes(term) || doctorName.includes(term) || appointmentId.includes(term);
                    })
                    .map((appointment: Appointment) => {
                        const patientObj = appointment.patient as Patient;
                        const doctorObj = appointment.doctor as Doctor;

                        return (
                            <tr key={appointment._id} className="border-t hover:bg-slate-50/60 transition-colors">
                                {/* Patient Name */}
                                <td className="p-3 text-center text-slate-800 font-medium">
                                    {typeof appointment.patient === "object" && patientObj ? patientObj.name : "Unknown Patient"}
                                </td>

                                {/* Doctor Name */}
                                <td className="p-3 text-center text-blue-700 font-medium">
                                    {typeof appointment.doctor === "object" && doctorObj ? `Dr. ${doctorObj.name}` : "Unknown Doctor"}
                                </td>

                                <td className="p-3 text-center text-slate-700 font-semibold">
                                    {appointment.roomNumber || (typeof appointment.doctor === "object" && doctorObj?.roomNumber) || "N/A"}
                                </td>

                                {/* Appointment Date and Time */}
                                <td className="p-3 text-center text-slate-600">
                                    {appointment.appointmentDate
                                        ? new Date(appointment.appointmentDate).toLocaleString([], { hour: '2-digit', minute: '2-digit', year: 'numeric', month: 'numeric', day: 'numeric' })
                                        : "N/A"
                                    }
                                </td>

                                {/* Status Badge */}
                                <td className="p-3 text-center">
                                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 uppercase tracking-wider">
                                      {appointment.status || (appointment.isCompleted ? "Completed" : "Waiting")}
                                    </span>
                                </td>

                                {/* Actions */}
                                <td className="p-3 text-center">
                                    <button
                                        onClick={() => onComplete(appointment._id)}
                                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded-md text-xs font-semibold shadow-sm transition active:scale-95"
                                    >
                                        Complete
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default AppointmentTable;