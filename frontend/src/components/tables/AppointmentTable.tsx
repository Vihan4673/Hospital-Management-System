import React from "react";
import type { Doctor } from "../../types/Doctor.ts";
import type { Appointment } from "../../types/Appointment.ts";
import type { Patient } from "../../types/Patient.ts";

interface AppointmentTableProps {
    activeAppointments: Appointment[]; // activeLendings -> activeAppointments
    search: string;
    onComplete: (appointmentId: string) => void; // onReturn -> onComplete
}

const AppointmentTable: React.FC<AppointmentTableProps> = ({
                                                               activeAppointments,
                                                               search,
                                                               onComplete,
                                                           }) => {
    return (
        <>
            <table className="w-full border-collapse text-sm">
                <thead className="bg-slate-100 text-slate-800 font-semibold border-b">
                <tr>
                    <th className="p-3 text-center border-b">Patient Name</th>
                    <th className="p-3 text-center border-b">Doctor Name</th>
                    <th className="p-3 text-center border-b">Appointment Date & Time</th>
                    <th className="p-3 text-center border-b">Status</th>
                    <th className="p-3 text-center border-b">Action</th>
                </tr>
                </thead>
                <tbody>
                {activeAppointments.length === 0 && (
                    <tr>
                        <td colSpan={5} className="text-center py-6 text-gray-400 font-medium">
                            No active appointments in the queue.
                        </td>
                    </tr>
                )}

                {activeAppointments
                    .filter((appointment: Appointment) => {
                        const term = search.toLowerCase().trim();
                        if (term === "") return true;

                        // Type Casting safely (object ද string ID එකක්ද කියලා චෙක් කිරීම)
                        const patientName = typeof appointment.patient === "object"
                            ? (appointment.patient as Patient).name?.toLowerCase()
                            : "";
                        const doctorName = typeof appointment.doctor === "object"
                            ? (appointment.doctor as Doctor).name?.toLowerCase()
                            : "";

                        return patientName.includes(term) || doctorName.includes(term);
                    })
                    .map((appointment: Appointment) => {
                        const patientObj = appointment.patient as Patient;
                        const doctorObj = appointment.doctor as Doctor;

                        return (
                            <tr key={appointment._id} className="border-t hover:bg-slate-50 transition-colors">
                                {/* Patient Name */}
                                <td className="p-3 text-center text-slate-800 font-medium">
                                    {typeof appointment.patient === "object" ? patientObj.name : "Unknown Patient"}
                                </td>

                                {/* DoctorModel Name */}
                                <td className="p-3 text-center text-blue-700 font-medium">
                                    {typeof appointment.doctor === "object" ? `Dr. ${doctorObj.name}` : "Unknown DoctorModel"}
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
                                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded-md text-xs font-semibold shadow-xs transition active:scale-95"
                                    >
                                        Complete
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </>
    );
};

export default AppointmentTable;