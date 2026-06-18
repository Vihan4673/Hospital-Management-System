import type { Reader } from "../types/Reader"
import apiClient from "./apiClient"


export const getAllReaders = async (): Promise<Reader[]> => {
    const response = await apiClient.get("/reader")
    return response.data
}

export const deleteReader = async (id: string): Promise<void>  => {
    const response = await apiClient.delete(`/reader/${id}`)
    return response.data
}

export const addReader = async (readerData: Omit<Reader, "_id"| "readerId" | "createdAt" | "updatedAt">) => {
    const response = await apiClient.post("/reader", readerData)
    return response.data
}

export const updateReader = async (readerId: string, readerData:Omit<Reader,"_id"| "readerId" | "createdAt" | "updatedAt"> ) => {
    const response = await apiClient.put(`/reader/${readerId}`, readerData)
    return response.data
}