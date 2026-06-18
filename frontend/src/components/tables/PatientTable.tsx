import React from "react";
import type { Patient } from "../../types/Patient.ts";

interface PatientTableProps {
    patients: Patient[];
    search: string;
    onView: (id: string) => void;
    onDelete: (id: string) => void;
}

const PatientTable: React.FC<PatientTableProps> = ({
                                                       patients,
                                                       search,
                                                       onView,
                                                       onDelete
                                                   }) => {
    return (
        <>
            <thead className="bg-slate-100 text-slate-800 font-semibold border-b">
            <tr>
                <th className="px-4 py-3 text-center">Patient ID</th>
                <th className="px-4 py-3 text-center">Name</th>
                <th className="px-4 py-3 text-center">Age</th>
                <th className="px-4 py-3 text-center">Gender</th>
                <th className="px-4 py-3 text-center">Email</th>
                <th className="px-4 py-3 text-center">Phone</th>
                <th className="px-4 py-3 text-center">Actions</th>
            </tr>
            </thead>

            <tbody>
            {patients
                .filter((patient) => {
                    const term = search.toLowerCase();
                    const targetId = patient.patientId || "";
                    return (
                        term === "" ||
                        patient.name.toLowerCase().includes(term) ||
                        patient.email.toLowerCase().includes(term) ||
                        patient.phone.includes(term) ||
                        targetId.toLowerCase().includes(term)
                    );
                })
                .map((patient) => {
                    const targetId = patient.patientId || patient._id || "";
                    return (
                        <tr
                            key={targetId}
                            className="border-t hover:bg-teal-50/40 transition-colors"
                        >
                            <td className="px-4 py-3 text-center font-medium text-slate-700">{patient.patientId}</td>
                            <td className="px-4 py-3 text-center text-slate-800 font-medium">{patient.name}</td>
                            <td className="px-4 py-3 text-center text-slate-600">{patient.age}</td>
                            <td className="px-4 py-3 text-center text-slate-600">{patient.gender}</td>
                            <td className="px-4 py-3 text-center text-slate-600">{patient.email}</td>
                            <td className="px-4 py-3 text-center text-slate-600">{patient.phone}</td>
                            <td className="px-4 py-3 text-center">
                                <div className="flex justify-center gap-2 flex-wrap">
                                    <button
                                        className="bg-teal-600 hover:bg-teal-500 text-white px-3 py-1 rounded-md text-sm font-medium transition shadow-sm active:scale-95"
                                        onClick={() => onView(targetId)}
                                    >
                                        View
                                    </button>
                                    <button
                                        className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded-md text-sm font-medium transition shadow-sm active:scale-95"
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
        </>
    );
};

export default PatientTable;