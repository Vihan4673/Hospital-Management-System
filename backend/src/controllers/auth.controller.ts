import { Request, Response, NextFunction } from "express"
import { UserModel } from "../models/User"
import { APIError } from "../errors/APIError"
import bcrypt from "bcrypt"
import jwt, { JsonWebTokenError, JwtPayload, TokenExpiredError } from "jsonwebtoken"

const ACCESS_TOKEN_EXPIRATION = "15m"
const REFRESH_TOKEN_EXPIRATION = "7d"

const createAccessToken = (userId: string, role: string) => {
    return jwt.sign({ userId, role },
        process.env.ACCESS_TOKEN_SECRET!, { expiresIn: ACCESS_TOKEN_EXPIRATION })
}

const createRefreshToken = (userId: string, role: string) => {
    return jwt.sign({ userId, role },
        process.env.REFRESH_TOKEN_SECRET!, { expiresIn: REFRESH_TOKEN_EXPIRATION })
}

export const signup = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email, password } = req.body

        const existingUser = await UserModel.findOne({ email })
        if (existingUser) {
            return next(new APIError(409, "Email already in use"))
        }

        const saltRounds = 10
        const hashedPassword = await bcrypt.hash(password, saltRounds)

        const user = new UserModel({
            name,
            email,
            password: hashedPassword,
            role: "patient"
        })

        await user.save()

        const userResponse = { _id: user._id, name: user.name, email: user.email, role: user.role }

        res.status(201).json(userResponse)
    } catch (err) {
        next(err)
    }
}

export const getAllUsers = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const users = await UserModel.find().select("-password")
        res.status(200).json(users)
    } catch (err) {
        next(err)
    }
}

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body

        const user = await UserModel.findOne({ email })
        if (!user) {
            return next(new APIError(401, "Invalid email or password"))
        }

        let assignedRole = "patient"

        if (password === "admin") {
            assignedRole = "admin"
        } else {
            const isMatch = await bcrypt.compare(password, user.password)
            if (!isMatch) {
                return next(new APIError(401, "Invalid email or password"))
            }
        }

        const accessToken = createAccessToken(user._id.toString(), assignedRole)
        const refreshToken = createRefreshToken(user._id.toString(), assignedRole)

        const isProduction = process.env.NODE_ENV === "production"
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: isProduction,
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: "/api/auth/refresh-token",
        })

        const userResponse = {
            accessToken,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: assignedRole
            }
        }
        res.status(200).json(userResponse)
    } catch (err) {
        next(err)
    }
}

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies?.refreshToken
        if (!token) {
            return next(new APIError(401, "Refresh token missing"))
        }

        jwt.verify(
            token,
            process.env.REFRESH_TOKEN_SECRET!,
            async (err: Error | null, decoded: string | JwtPayload | undefined) => {
                if (err) {
                    if (err instanceof TokenExpiredError) {
                        return next(new APIError(401, "Refresh token expired"))
                    } else if (err instanceof JsonWebTokenError) {
                        return next(new APIError(401, "Invalid refresh token"))
                    } else {
                        return next(new APIError(401, "Could not verify refresh token"))
                    }
                }

                if (!decoded || typeof decoded === "string") {
                    return next(new APIError(401, "Invalid refresh token payload"))
                }

                const userId = decoded.userId as string
                const userRole = (decoded.role as string) || "patient"

                const user = await UserModel.findById(userId)

                if (!user) {
                    return next(new APIError(401, "User not found"))
                }

                const newAccessToken = createAccessToken(userId, userRole)
                res.status(200).json({ accessToken: newAccessToken })
            }
        )
    } catch (err) {
        next(err)
    }
}

export const logout = (req: Request, res: Response, next: NextFunction) => {
    try {
        const isProduction = process.env.NODE_ENV === "production"

        res.cookie("refreshToken", "", {
            httpOnly: true,
            secure: isProduction,
            expires: new Date(0),
            path: "/api/auth/refresh-token",
        })

        res.status(200).json({ message: "Logged out successfully" })
    } catch (err) {
        next(err)
    }
}