import { createContext } from "react"

export interface AuthContextType {
  isLoggedIn: boolean
  login: (accessToken: string) => void
  logout: () => void
  accessToken?: string
  isAuthenticating: boolean
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)