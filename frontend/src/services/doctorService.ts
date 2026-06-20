import type { Doctor } from "../types/Doctor.ts";
import apiClient from "./apiClient";

export const getAllDoctors = async (): Promise<Doctor[]> => {
    const response = await apiClient.get("/doctor");
    return response.data;
};

export const deleteDoctor = async (id: string): Promise<void> => {
    const response = await apiClient.delete(`/doctor/${id}`);
    return response.data;
};

export const addDoctor = async (
    doctorData: Omit<Doctor, "createdAt" | "updatedAt">
): Promise<Doctor> => {
    const response = await apiClient.post("/doctor", doctorData);
    return response.data;
};

export const updateDoctor = async (
    id: string,
    doctorData: Omit<Doctor, "createdAt" | "updatedAt">
): Promise<Doctor> => {
    const response = await apiClient.put(`/doctor/${id}`, doctorData);
    return response.data;
};