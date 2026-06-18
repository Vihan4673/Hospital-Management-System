import type { Doctor } from "../types/Doctor.ts";
import apiClient from "./apiClient";

// Get all doctors from the registry
export const getAllDoctors = async (): Promise<Doctor[]> => {
  const response = await apiClient.get("/doctor");
  return response.data;
};

// Delete a doctor profile by ID (_id or doctorId)
export const deleteDoctor = async (id: string): Promise<void> => {
  const response = await apiClient.delete(`/doctor/${id}`);
  return response.data;
};

// Register a new doctor profile (omit auto-managed fields if necessary)
export const addDoctor = async (
    doctorData: Omit<Doctor, "createdAt" | "updatedAt">
): Promise<Doctor> => {
  const response = await apiClient.post("/doctor", doctorData);
  return response.data;
};

// Update an existing doctor profile by ID
export const updateDoctor = async (
    id: string,
    doctorData: Omit<Doctor, "createdAt" | "updatedAt">
): Promise<Doctor> => {
  const response = await apiClient.put(`/doctor/${id}`, doctorData);
  return response.data;
};