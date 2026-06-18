import type { Lending } from "../types/Lending";
import apiClient from "./apiClient";

// Get all active lendings (not returned)
export const getActiveLendings = async (): Promise<Lending[]> => {
  const response = await apiClient.get("/lendings/active");
  return response.data;
};

// Get lending history for a specific book
export const getLendingHistoryByBook = async (bookId: string): Promise<Lending[]> => {
  const response = await apiClient.get(`/lendings/book/${bookId}`);
  return response.data;
};

// Get lending history for a specific reader
export const getLendingHistoryByReader = async (readerId: string): Promise<Lending[]> => {
  const response = await apiClient.get(`/lending/reader/${readerId}`);
  return response.data;
};

// Lend a book to a reader
export const lendBook = async (
  bookId: string,
  readerId: string,
  dueDate: string
): Promise<Lending> => {
  const response = await apiClient.post("/lendings", {
    book: bookId,
    reader: readerId,
    dueDate               //changed
  });
  return response.data;
};

// Return a book by lending ID
export const returnBook = async (lendingId: string): Promise<Lending> => {
  const response = await apiClient.put(`/lendings/return/${lendingId}`);
  return response.data;
};
