import type { Appointment } from "../types/Appointment";
import apiClient from "./apiClient";

// GET ALL ACTIVE APPOINTMENTS (WAITING / NOT COMPLETED)
export const getActiveAppointments = async (): Promise<Appointment[]> => {
  const response = await apiClient.get("/appointments/active"); // /lendings/active -> /appointments/active
  return response.data;
};

// GET APPOINTMENT HISTORY FOR A SPECIFIC DOCTOR
export const getAppointmentHistoryByDoctor = async (doctorId: string): Promise<Appointment[]> => {
  const response = await apiClient.get(`/appointments/doctor/${doctorId}`);
  return response.data;
};

// GET APPOINTMENT HISTORY FOR A SPECIFIC PATIENT
export const getAppointmentHistoryByPatient = async (patientId: string): Promise<Appointment[]> => {
  const response = await apiClient.get(`/appointments/patient/${patientId}`);
  return response.data;
};

// CREATE A NEW APPOINTMENT (Lend Book -> Create Appointment)
export const createAppointment = async (
    doctorId: string,
    patientId: string,
    appointmentDate: string
): Promise<Appointment> => {
  const response = await apiClient.post("/appointments", {
    doctor: doctorId,
    patient: patientId,
    appointmentDate
  });
  return response.data;
};

// MARK APPOINTMENT AS COMPLETED (Return Book -> Complete Appointment)
export const completeAppointment = async (appointmentId: string): Promise<Appointment> => {
  const response = await apiClient.put(`/appointments/complete/${appointmentId}`);
  return response.data;
};