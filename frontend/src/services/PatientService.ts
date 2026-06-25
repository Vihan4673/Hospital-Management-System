import type { Patient } from "../types/Patient";
import apiClient from "./apiClient";

export const getAllPatients = async (): Promise<Patient[]> => {
    const response = await apiClient.get("/patient");
    return response.data;
};

export const deletePatient = async (id: string): Promise<void> => {
    const response = await apiClient.delete(`/patient/${id}`);
    return response.data;
};

export const addPatient = async (
    patientData: Omit<Patient, "_id" | "patientId" | "createdAt" | "updatedAt">
): Promise<Patient> => {
    const response = await apiClient.post("/patient", patientData);
    return response.data;
};

export const updatePatient = async (
    patientId: string,
    patientData: Omit<Patient, "_id" | "patientId" | "createdAt" | "updatedAt">
): Promise<Patient> => {
    const response = await apiClient.put(`/patient/${patientId}`, patientData);
    return response.data;
};