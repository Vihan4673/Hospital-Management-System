import type { Doctor } from "./Doctor.ts";
import type { Patient } from "./Patient.ts";

export type Appointment = {
  date: string;
  _id: string;
  appointmentId?: string; // 👈 Auto-generated readable ID එකක් තියෙනවා නම් (Optional)

  doctor: Doctor;
  patient: Patient;

  appointmentDate: string;
  roomNumber: string;

  // ⚡ FIX: Doctor's Fee එක Appointment type එකට එකතු කළා
  doctorFee: number;

  notes?: string | null;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt?: string;
  updatedAt?: string;
};