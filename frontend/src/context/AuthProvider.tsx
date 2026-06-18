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

    const logout = () => setIsLoggedIn(false)

    useEffect(() => {
        setHeader(accessToken)
    }, [accessToken])

    //This is what allows the user to stay logged in even after a page reload.
    useEffect(() => {
        const tryRefresh = async () => {
            try {
                const result = await apiClient.post("/auth/refresh-token")
                console.log(result)
                setAccessToken(result.data.accessToken)
                setIsLoggedIn(true)

                const currentPath = window.location.pathname
                console.log(`current path ${currentPath}`)
                if (currentPath === "/login" || currentPath === "/signup" || currentPath === "/dashboard/readers") {
                    console.log("currentPath", currentPath)
                    router.navigate("/dashboard")
                }

                // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (error) {
                setAccessToken("")
                setIsLoggedIn(false)
            } finally {
                setIsAuthenticating(false)
            }
        }

        tryRefresh()
    }, [])

    return <AuthContext.Provider value={{ isLoggedIn, login, logout, isAuthenticating }}>{children}</AuthContext.Provider>

}