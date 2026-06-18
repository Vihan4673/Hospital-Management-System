import type { Doctor } from "../types/Doctor.ts";
import apiClient from "./apiClient";

// GET ALL DOCTORS
export const getAllDoctors = async (): Promise<Doctor[]> => {
    const response = await apiClient.get("/doctor");
    return response.data;
};

// DELETE DOCTOR BY ID
export const deleteDoctor = async (id: string): Promise<void> => {
    const response = await apiClient.delete(`/doctor/${id}`);
    return response.data;
};

// ADD A NEW DOCTOR
// මෙතනදී Form එකෙන් එන availableDays (Array) සහ channellingPrice (Number) කෙලින්ම backend එකට pass වේ.
export const addDoctor = async (
    doctorData: Omit<Doctor, "createdAt" | "updatedAt">
): Promise<Doctor> => {
    const response = await apiClient.post("/doctor", doctorData);
    return response.data;
};

// UPDATE DOCTOR BY ID
// id එක string එකක් ලෙස අනිවාර්ය කර ඇත (undefined ඉවත් කර ඇත) එවිට update එකක් හරියටම සිදුවේ.
export const updateDoctor = async (
    id: string,
    doctorData: Omit<Doctor, "createdAt" | "updatedAt">
): Promise<Doctor> => {
    const response = await apiClient.put(`/doctor/${id}`, doctorData);
    return response.data;
};