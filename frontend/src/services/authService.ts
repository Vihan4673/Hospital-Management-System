// src/services/authService.ts

import type { User } from "../types/User"
import apiClient from "./apiClient"

export interface SignUpResponse {
  name: string
  email: string
  _id: string
}

export interface LoginResponse {
  user: User
  name: string
  email: string
  accessToken: string
  _id: string
}

export interface LogoutResponse {
  message: string
}

export interface RefreshTokenResponse {
  accessToken: string
}

export const signUp = async (userData: User): Promise<SignUpResponse> => {
  const response = await apiClient.post("/auth/signup", userData)
  return response.data
}

export const login = async (loginData: Omit<User, "name">): Promise<LoginResponse> => {
  const response = await apiClient.post("/auth/login", loginData)
  return response.data
}

export const logout = async (): Promise<LogoutResponse> => {
  const response = await apiClient.post("/auth/logout")
  return response.data
}

// add refresh token
export const refreshToken = async (): Promise<RefreshTokenResponse> => {
  const response = await apiClient.post("/auth/refresh-token")
  return response.data
}























/* import apiClient from "./apiClient"

// Define the types for user and login responses
export type SignupData = {
  name: string
  email: string
  password: string
}

export type LoginData = {
  email: string
  password: string
}

export type AuthResponse = {
  token: string
  user: {
    _id: string
    name: string
    email: string
  }
}

// Sign up a new user
export const signup = async (data: SignupData): Promise<AuthResponse> => {
  const response = await apiClient.post("/auth/signup", data)
  return response.data
}

// Log in an existing user
export const login = async (data: LoginData): Promise<AuthResponse> => {
  const response = await apiClient.post("/auth/login", data)
  return response.data
}

// Optionally, add a logout function (for FE only)
export const logout = () => {
  // Remove token from storage (if used)
  localStorage.removeItem("token")
}
 */