import type { Doctor } from "../types/Doctor";
import apiClient from "./apiClient";

export const getAllDoctors = async (): Promise<Doctor[]> => {
    const response = await apiClient.get("/doctor");
    return response.data;
};

export const deleteDoctor = async (id: string): Promise<void> => {
    await apiClient.delete(`/doctor/${id}`);
};

export const addDoctor = async (
    doctorData: Omit<Doctor, "createdAt" | "updatedAt">
): Promise<Doctor> => {
    const { _id, ...cleanData } = doctorData as any;

    const response = await apiClient.post("/doctor", cleanData);
    return response.data;
};

export const updateDoctor = async (
    id: string,
    doctorData: Omit<Doctor, "createdAt" | "updatedAt">
): Promise<Doctor> => {
    const { _id, ...cleanData } = doctorData as any;

    const response = await apiClient.put(`/doctor/${id}`, cleanData);
    return response.data;
};