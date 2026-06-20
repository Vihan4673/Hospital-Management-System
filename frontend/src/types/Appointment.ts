import type { Doctor } from "./Doctor.ts";
import type { Patient } from "./Patient.ts";

export type Appointment = {
  _id: string;
  doctor: Doctor | string;
  patient: Patient | string;
  appointmentDate: string;
  roomNumber?: string;
  notes?: string | null;
  isCompleted: boolean;
  status: 'pending' | 'completed' | 'cancelled';
};