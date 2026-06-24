import { useEffect, useState } from "react"
import { setHeader } from "../services/apiClient"
import { AuthContext } from "./AuthContext"

interface AuthProviderProps {
    children: React.ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false)
    const [accessToken, setAccessToken] = useState<string>("")
    const [isAuthenticating, setIsAuthenticating] = useState<boolean>(true)

    const login = (token: string) => {
        setIsLoggedIn(true)
        setAccessToken(token)
    }

    const logout = () => {
        setIsLoggedIn(false)
        setAccessToken("")
    }

    useEffect(() => {
        setHeader(accessToken)
    }, [accessToken])

    useEffect(() => {
        setAccessToken("")
        setIsLoggedIn(false)
        setIsAuthenticating(false)
    }, [])

    return (
        <AuthContext.Provider value={{ isLoggedIn, login, logout, isAuthenticating }}>
            {children}
        </AuthContext.Provider>
    )
}