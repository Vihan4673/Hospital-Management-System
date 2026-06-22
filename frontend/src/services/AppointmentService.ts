import type { Appointment } from "../types/Appointment";
import apiClient from "./apiClient";

export const getActiveAppointments = async (): Promise<Appointment[]> => {
  const response = await apiClient.get("/appointments/active");
  return response.data;
};

export const getAppointmentHistoryByDoctor = async (doctorId: string): Promise<Appointment[]> => {
  const response = await apiClient.get(`/appointments/doctor/${doctorId}`);
  return response.data;
};

export const getAppointmentHistoryByPatient = async (patientId: string): Promise<Appointment[]> => {
  const response = await apiClient.get(`/appointments/patient/${patientId}`);
  return response.data;
};

export const createAppointment = async (
    doctorId: string,
    patientId: string,
    appointmentDate: string,
    roomNumber: string,
    doctorFee: number
): Promise<Appointment> => {
  const response = await apiClient.post("/appointments", {
    doctor: doctorId,
    patient: patientId,
    appointmentDate,
    roomNumber,
    doctorFee
  });
  return response.data;
};

export const completeAppointment = async (appointmentId: string): Promise<Appointment> => {
  const response = await apiClient.put(`/appointments/complete/${appointmentId}`);
  return response.data;
};