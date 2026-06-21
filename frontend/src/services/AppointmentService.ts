import type { Appointment } from "../types/Appointment";
import apiClient from "./apiClient";

// 1. GET ALL ACTIVE APPOINTMENTS (WAITING / NOT COMPLETED)
export const getActiveAppointments = async (): Promise<Appointment[]> => {
  const response = await apiClient.get("/appointments/active");
  return response.data;
};

// 2. GET APPOINTMENT HISTORY FOR A SPECIFIC DOCTOR
export const getAppointmentHistoryByDoctor = async (doctorId: string): Promise<Appointment[]> => {
  const response = await apiClient.get(`/appointments/doctor/${doctorId}`);
  return response.data;
};

// 3. GET APPOINTMENT HISTORY FOR A SPECIFIC PATIENT
export const getAppointmentHistoryByPatient = async (patientId: string): Promise<Appointment[]> => {
  const response = await apiClient.get(`/appointments/patient/${patientId}`);
  return response.data;
};

// 4. CREATE A NEW APPOINTMENT (Fixed: Added roomNumber properly)
export const createAppointment = async (
    doctorId: string,
    patientId: string,
    appointmentDate: string,
    roomNumber: string
): Promise<Appointment> => {
  const response = await apiClient.post("/appointments", {
    doctor: doctorId,
    patient: patientId,
    appointmentDate,
    roomNumber
  });
  return response.data;
};

// 5. MARK APPOINTMENT AS COMPLETED
export const completeAppointment = async (appointmentId: string): Promise<Appointment> => {
  const response = await apiClient.put(`/appointments/complete/${appointmentId}`);
  return response.data;
};