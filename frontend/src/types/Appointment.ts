import type { Doctor } from "./Doctor.ts";
import type { Patient } from "./Patient.ts";

export type Appointment = {
  _id: string;

  doctor: Doctor;

  patient: Patient;

  appointmentDate: string;
  roomNumber: string;
  notes?: string | null;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt?: string;
  updatedAt?: string;
};