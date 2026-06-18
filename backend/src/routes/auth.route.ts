import { Router } from "express"
import { signup, getAllUsers, login, refreshToken, logout } from "../controllers/auth.controller"
import { authenticateToken } from "../middleware/authenticateToken"

const authRouter = Router()

authRouter.post("/signup", signup) // POST /api/auth/signup
authRouter.get("/getAll",authenticateToken, getAllUsers)
authRouter.post("/login", login)
authRouter.post("/refresh-token", refreshToken)
authRouter.post("/logout", logout)

export default authRouter
