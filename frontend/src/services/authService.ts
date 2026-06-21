// src/services/authService.ts

import type { User } from "../types/User"
import apiClient from "./apiClient"

export interface SignUpResponse {
  _id: string
  name: string
  email: string
  role: "patient" | "admin"
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

// Sign up a new user
export const signUp = async (userData: Omit<User, "_id" | "role">): Promise<SignUpResponse> => {
  const response = await apiClient.post("/auth/signup", userData)
  return response.data
}

// Log in an existing user
export const login = async (loginData: Omit<User, "name" | "role" | "_id">): Promise<LoginResponse> => {
  const response = await apiClient.post("/auth/login", loginData)
  return response.data
}

// Log out the current user
export const logout = async (): Promise<LogoutResponse> => {
  const response = await apiClient.post("/auth/logout")
  return response.data
}

// Refresh the access token
export const refreshToken = async (): Promise<RefreshTokenResponse> => {
  const response = await apiClient.post("/auth/refresh-token")
  return response.data
}