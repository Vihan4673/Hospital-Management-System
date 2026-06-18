import { useEffect, useState } from "react"
import apiClient, { setHeader } from "../services/apiClient"
import router from "../router"
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
        setHeader(null) // Header එකත් clear කරන්න
        router.navigate("/login") // Logout වුණාම කෙලින්ම login එකට යවන්න
    }

    useEffect(() => {
        setHeader(accessToken)
    }, [accessToken])

    // This is what allows the user to stay logged in even after a page reload.
    useEffect(() => {
        const tryRefresh = async () => {
            try {
                const result = await apiClient.post("/auth/refresh-token")
                console.log(result)
                setAccessToken(result.data.accessToken)
                setIsLoggedIn(true)

                const currentPath = window.location.pathname
                console.log(`current path ${currentPath}`)
                if (currentPath === "/login" || currentPath === "/signup") {
                    console.log("currentPath", currentPath)
                    router.navigate("/dashboard")
                }

            } catch (error) {
                console.warn("Refresh token invalid/expired. Redirecting to login.")
                setAccessToken("")
                setIsLoggedIn(false)

                // 🛑 FIX: Refresh එක 401 වෙලා fail වුණොත් userව /login පේජ් එකට navigate කරන්න
                const currentPath = window.location.pathname
                if (currentPath !== "/login" && currentPath !== "/signup") {
                    router.navigate("/login")
                }
            } finally {
                setIsAuthenticating(false)
            }
        }

        tryRefresh()
    }, [])

    return (
        <AuthContext.Provider value={{ isLoggedIn, login, logout, isAuthenticating }}>
            {children}
        </AuthContext.Provider>
    )
}