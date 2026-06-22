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

    // ⚡ FIX: Page එක reload කරද්දී auto-login වීම සම්පූර්ණයෙන්ම ඉවත් කර ඇත.
    useEffect(() => {
        // දැන් පිටුව refresh කරද්දී auto backend එකට කතා කරලා token refresh කරන්නේ නැත.
        setAccessToken("")
        setIsLoggedIn(false)
        setIsAuthenticating(false) // Authentication check එක ඉවර බව දැනුම් දෙයි
    }, [])

    return (
        <AuthContext.Provider value={{ isLoggedIn, login, logout, isAuthenticating }}>
            {children}
        </AuthContext.Provider>
    )
}