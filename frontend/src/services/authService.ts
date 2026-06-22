
import type { User } from "../types/User"
import apiClient from "./apiClient"

export interface SignUpResponse {
  _id: string
  name: string
  email?: string
  doctorId?: string
  role: "patient" | "admin" | "doctor"
}

export interface LoginResponse {
  accessToken: string
  user: User
}

export interface LogoutResponse {
  message: string
}

export interface RefreshTokenResponse {
  accessToken: string
}

interface SignUpData {
  name: string
  password: string
  role: string
  email?: string
  doctorId?: string
}

export const signUp = async (userData: SignUpData): Promise<SignUpResponse> => {
  const response = await apiClient.post("/auth/signup", userData)
  return response.data
}

export const login = async (loginData: { identifier?: string; password: string; role: string }): Promise<LoginResponse> => {
  const response = await apiClient.post("/auth/login", loginData)
  return response.data
}

export const logout = async (): Promise<LogoutResponse> => {
  const response = await apiClient.post("/auth/logout")
  return response.data
}

export const refreshToken = async (): Promise<RefreshTokenResponse> => {
  const response = await apiClient.post("/auth/refresh-token")
  return response.data
}