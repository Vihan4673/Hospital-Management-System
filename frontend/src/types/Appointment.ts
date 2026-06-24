import type { Doctor } from "./Doctor.ts";
import type { Patient } from "./Patient.ts";

export type Appointment = {
  date: string;
  _id: string;
  appointmentId?: string;
  doctor: Doctor;
  patient: Patient;
  appointmentDate: string;
  roomNumber: string;
  doctorFee: number;
  notes?: string | null;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt?: string;
  updatedAt?: string;
};