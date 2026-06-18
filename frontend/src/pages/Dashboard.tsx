import React, { useEffect, useState } from 'react';
import { getAllDoctors } from '../services/DoctorService.ts';
import { getAllPatients } from '../services/PatientService.ts'; // getAllReaders -> getAllPatients
import { getActiveAppointments } from '../services/AppointmentService.ts'; // getActiveLendings -> getActiveAppointments
import type { Doctor } from "../types/Doctor.ts";
import type { Patient } from "../types/Patient.ts";
import type { Appointment } from "../types/Appointment.ts";

const Dashboard = () => {
  // States hospital domain එකට ගැලපෙන ලෙස මාරු කරා
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [completedToday, setCompletedToday] = useState<Appointment[]>([]);
  const [pendingAppointments, setPendingAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const doctorData = await getAllDoctors();
        const patientData = await getAllPatients();
        const appointmentData = await getActiveAppointments();

        setDoctors(doctorData);
        setPatients(patientData);
        setAppointments(appointmentData);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // අද දිනට නියමිත ඇපොයින්ට්මන්ට් (Appointments scheduled for today)
        const todayApp = appointmentData.filter(a => new Date(a.appointmentDate).getTime() >= today.getTime());
        setTodayAppointments(todayApp);

        // අද දින අවසන් කරන ලද ඇපොයින්ට්මන්ට් (Completed today)
        const todayDone = appointmentData.filter(a => a.isCompleted || a.status === 'completed');
        setCompletedToday(todayDone);

        // තවමත් නොපැමිණි / පොරොත්තු ලේඛනයේ ඇති ඇපොයින්ට්මන්ට් (Pending / Waiting)
        const pending = appointmentData.filter(a => !a.isCompleted && a.status !== 'completed');
        setPendingAppointments(pending);
      } catch (error) {
        console.error("Dashboard data fetching error:", error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000); // සෑම තත්පර 5කට වරක් auto-refresh වේ
    return () => clearInterval(interval);
  }, []);

  return (
      <div className="p-6 bg-slate-50 min-h-screen text-slate-800">
        <h1 className="text-2xl font-bold mb-6 text-blue-900 flex items-center gap-2">
          📊 Medicare Live Dashboard
        </h1>

        {/* Hospital Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard title="👨‍⚕️ Total Doctors" value={doctors.length} color="bg-blue-100 text-blue-950 border border-blue-200" />
          <StatCard title="👤 Total Patients" value={patients.length} color="bg-emerald-100 text-emerald-950 border border-emerald-200" />
          <StatCard title="📅 Scheduled Today" value={todayAppointments.length} color="bg-amber-100 text-amber-950 border border-amber-200" />
          <StatCard title="⏳ Pending Consultations" value={pendingAppointments.length} color="bg-rose-100 text-rose-950 border border-rose-200" />
          <StatCard title="✅ Completed Today" value={completedToday.length} color="bg-indigo-100 text-indigo-950 border border-indigo-200" />
          <StatCard title="📦 Total Appointments" value={appointments.length} color="bg-slate-200 text-slate-900 border border-slate-300" />
        </div>

        {/* Live Activity Log */}
        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-4 text-slate-700">📌 Today's Appointment Queue</h2>
          <div className="bg-white shadow-xs border border-slate-200 p-4 rounded-xl max-h-64 overflow-y-auto">
            {todayAppointments.length === 0 ? (
                <p className="text-gray-400 text-center py-4">No appointments scheduled for today.</p>
            ) : (
                todayAppointments.map((appointment, index) => {
                  const patientObj = appointment.patient as Patient;
                  const doctorObj = appointment.doctor as Doctor;

                  return (
                      <div key={index} className="mb-3 p-3 bg-slate-50 rounded-lg border border-slate-100 flex justify-between items-center">
                        <div>
                          <p className="font-medium text-slate-800">
                            Patient: <span className="text-emerald-700">{typeof appointment.patient === 'object' ? patientObj.name : "Unknown"}</span>
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Consulting: <span className="text-blue-600 font-medium">Dr. {typeof appointment.doctor === 'object' ? doctorObj.name : "Unknown"}</span>
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500 font-medium">
                            {appointment.appointmentDate ? new Date(appointment.appointmentDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "N/A"}
                          </p>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${appointment.isCompleted ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {appointment.isCompleted ? 'Completed' : 'Waiting'}
                    </span>
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

const StatCard = ({
                    title,
                    value,
                    color
                  }: {
  title: string;
  value: number;
  color: string;
}) => (
    <div className={`p-6 rounded-xl shadow-xs transition-all hover:translate-y-[-2px] ${color}`}>
      <p className="text-xs font-semibold uppercase tracking-wider opacity-75">{title}</p>
      <h2 className="text-3xl font-extrabold mt-1">{value}</h2>
    </div>
);

export default Dashboard;