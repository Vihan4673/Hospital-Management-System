import React from "react";
import type { Appointment } from "../../types/Appointment";

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
        <div className="w-full max-h-[500px] overflow-y-auto overflow-x-auto border border-slate-200 rounded-lg shadow-sm">
            <table className="w-full border-collapse text-sm bg-white table-auto">
                <thead className="bg-slate-100 text-slate-800 font-semibold border-b sticky top-0 z-10 shadow-sm">
                <tr>
                    <th className="p-3 text-center border-b">Patient Name</th>
                    <th className="p-3 text-center border-b">Doctor Name</th>
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

                        const patientName = appointment.patient?.name?.toLowerCase() || "";
                        const doctorName = appointment.doctor?.name?.toLowerCase() || "";
                        const appointmentId = appointment._id?.toLowerCase() || "";

                        return patientName.includes(term) || doctorName.includes(term) || appointmentId.includes(term);
                    })
                    .map((appointment: Appointment) => {
                        return (
                            <tr key={appointment._id} className="border-t hover:bg-slate-50/60 transition-colors">
                                <td className="p-3 text-center text-slate-800 font-medium">
                                    {appointment.patient?.name || "Unknown Patient"}
                                </td>
                                <td className="p-3 text-center text-blue-700 font-medium">
                                    {appointment.doctor?.name ? `Dr. ${appointment.doctor.name}` : "Unknown Doctor"}
                                </td>

                                <td className="p-3 text-center text-slate-700 font-semibold">
                                    {appointment.roomNumber || appointment.doctor?.roomNumber || "N/A"}
                                </td>

                                <td className="p-3 text-center text-slate-600">
                                    {appointment.appointmentDate
                                        ? new Date(appointment.appointmentDate).toLocaleString([], { hour: '2-digit', minute: '2-digit', year: 'numeric', month: 'numeric', day: 'numeric' })
                                        : "N/A"
                                    }
                                </td>

                                <td className="p-3 text-center">
                                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 uppercase tracking-wider">
                                      {appointment.status || "Waiting"}
                                    </span>
                                </td>

                                <td className="p-3 text-center">
                                    <button
                                        onClick={() => onComplete(appointment._id)}
                                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded-md text-xs font-semibold shadow-sm transition active:scale-95 cursor-pointer"
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