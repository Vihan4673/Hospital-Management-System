import type { Doctor } from "./Doctor";
import type { Patient } from "./Patient";

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