import type { Doctor } from "./Doctor.ts";
import type { Patient } from "./Patient.ts";

export type Appointment = {
  _id: string;
  doctor: Doctor | string;       // book -> doctor (DoctorModel object එකක් හෝ ID එකක් විය හැක)
  patient: Patient | string;     // reader -> patient (Patient object එකක් හෝ ID එකක් විය හැක)
  appointmentDate: string;       // lentDate -> appointmentDate (චැනලින් එක තියෙන දවස සහ වෙලාව)
  notes?: string;                // රෝගියාගේ අසනීප තත්ත්වය පිළිබඳ කෙටි සටහනක් (Optional)
  isCompleted: boolean;          // returned -> isCompleted (ඩොක්ටර් රෝගියාව පරීක්ෂා කර අවසන් ද යන්න)
  status: 'pending' | 'completed' | 'cancelled'; // Appointment එකේ වත්මන් තත්ත්වය
};