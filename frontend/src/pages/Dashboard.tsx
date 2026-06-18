import React, { useEffect, useState } from 'react';
import { getAllDoctors } from '../services/doctorService.ts';
import { getAllReaders as getAllPatients } from '../services/readerService'; // Renamed service alias
import { getActiveLendings as getActiveAppointments } from '../services/lendingService'; // Renamed service alias
import type { Doctor } from "../types/Doctor.ts";
import type { Reader as Patient } from "../types/Reader";

// Extended/Mapped Local Type to keep backend data structure safe but semantics medical
interface Appointment {
  _id?: string;
  patient?: Patient | { name: string }; // maps to reader
  doctor?: Doctor | { name: string; title?: string }; // maps to book
  appointmentDate: string; // maps to lentDate
  scheduledTime?: string;
  status: 'CheckedIn' | 'Discharged' | 'Pending'; // maps to returned logic
  // Fallbacks for library backend properties if needed:
  lentDate?: string;
  dueDate?: string;
  returned?: boolean;
  reader?: Patient;
  book?: Doctor & { title?: string };
}

const Dashboard = () => {
  // Converted state names completely to medical context
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [admissionsToday, setAdmissionsToday] = useState<Appointment[]>([]);
  const [dischargedToday, setDischargedToday] = useState<Appointment[]>([]);
  const [pendingAppointments, setPendingAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    const fetchHospitalData = async () => {
      try {
        const doctorData = await getAllDoctors();
        const patientData = await getAllPatients();
        const rawAppointmentData = await getActiveAppointments();

        setDoctors(doctorData);
        setPatients(patientData);

        // Normalize any mixed backend properties safely
        const normalizedAppointments: Appointment[] = rawAppointmentData.map((item: any) => ({
          ...item,
          appointmentDate: item.appointmentDate || item.lentDate,
          scheduledTime: item.scheduledTime || item.dueDate
        }));

        setAppointments(normalizedAppointments);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // 1. Filter Check-ins / Admissions Today
        const todayCheckedIn = normalizedAppointments.filter(app => {
          const checkInDate = new Date(app.appointmentDate || app.lentDate || '');
          return checkInDate.getTime() >= today.getTime();
        });
        setAdmissionsToday(todayCheckedIn);

        // 2. Filter Discharged Today
        const todayDischarged = normalizedAppointments.filter(app => app.returned || app.status === 'Discharged');
        setDischargedToday(todayDischarged);

        // 3. Filter Pending / Overdue Appointments
        const pending = normalizedAppointments.filter(app => {
          const isNotCleared = !app.returned && app.status !== 'Discharged';
          const targetTime = new Date(app.scheduledTime || app.dueDate || '').getTime();
          return isNotCleared && targetTime < new Date().getTime();
        });
        setPendingAppointments(pending);

      } catch (error) {
        console.error("Error updating live dashboard states:", error);
      }
    };

    fetchHospitalData();
    const liveInterval = setInterval(fetchHospitalData, 5000); // 5s live refresh
    return () => clearInterval(liveInterval);
  }, []);

  return (
      <div className="p-2 bg-slate-50/30 min-h-full">
        {/* Title with Hospital Aesthetics */}
        <div className="mb-6 bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <span className="text-teal-600 animate-pulse">🏥</span> Clinical Live Dashboard
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Real-time monitoring of clinical stats, patient admissions, and scheduled consultants.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-700 bg-teal-50 px-3 py-1.5 rounded-full border border-teal-100 self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping"></span>
            LIVE MONITORING ACTIVE
          </div>
        </div>

        {/* Grid converted into Medical Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard title="👨‍⚕️ Available Doctors" value={doctors.length} color="border-l-4 border-teal-500 bg-white" textColor="text-teal-700" />
          <StatCard title="👥 Registered Patients" value={patients.length} color="border-l-4 border-blue-500 bg-white" textColor="text-blue-700" />
          <StatCard title="📅 Admissions Today" value={admissionsToday.length} color="border-l-4 border-amber-500 bg-white" textColor="text-amber-700" />
          <StatCard title="⚠️ Pending / Delayed" value={pendingAppointments.length} color="border-l-4 border-rose-500 bg-white" textColor="text-rose-700" />
          <StatCard title="✅ Discharged Today" value={dischargedToday.length} color="border-l-4 border-emerald-500 bg-white" textColor="text-emerald-700" />
          <StatCard title="📋 Total Consultations" value={appointments.length} color="border-l-4 border-slate-500 bg-white" textColor="text-slate-700" />
        </div>

        {/* Activity Log converted into a Clinical Check-In Queue */}
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse"></span>
            <h2 className="text-xl font-semibold text-slate-800">📌 Live Patient Outpatient (OPD) Admissions Queue</h2>
          </div>

          <div className="bg-white border border-slate-100 shadow-sm p-5 rounded-xl max-h-80 overflow-y-auto divide-y divide-slate-100">
            {admissionsToday.length === 0 ? (
                <p className="text-slate-400 text-sm py-4 text-center">No active patient check-ins recorded for today.</p>
            ) : (
                admissionsToday.map((appointment, index) => {
                  const patientName = appointment.patient?.name || appointment.reader?.name || "Unknown PatientModel";
                  const doctorName = appointment.doctor?.name || appointment.book?.name || appointment.book?.title || "General Physician";
                  const recordTime = appointment.appointmentDate || appointment.lentDate || new Date().toISOString();

                  return (
                      <div key={index} className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 hover:bg-slate-50/50 px-2 rounded-lg transition-colors">
                        <div>
                          <p className="text-slate-700 font-medium text-sm">
                            Patient: <span className="text-slate-900 font-semibold">{patientName}</span>
                          </p>
                          <p className="text-xs text-teal-600 font-medium mt-0.5 flex items-center gap-1">
                            <span>🩺</span> Assigned Specialist: {doctorName}
                          </p>
                        </div>
                        <div className="text-left sm:text-right bg-slate-50 sm:bg-transparent p-2 sm:p-0 rounded-md">
                          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Admission Timestamp</p>
                          <p className="text-xs text-slate-600 font-medium mt-0.5">{new Date(recordTime).toLocaleString()}</p>
                        </div>
                      </div>
                  );
                })
            )}
          </div>
        </div>
      </div>
  );
};

// Clean, modern Medical StatCard design
const StatCard = ({
                    title,
                    value,
                    color,
                    textColor
                  }: {
  title: string;
  value: number;
  color: string;
  textColor: string;
}) => (
    <div className={`p-6 rounded-xl shadow-sm border border-slate-100/80 transition-all hover:shadow-md hover:-translate-y-0.5 ${color}`}>
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
      <h2 className={`text-3xl font-bold mt-2 ${textColor}`}>{value}</h2>
    </div>
);

export default Dashboard;