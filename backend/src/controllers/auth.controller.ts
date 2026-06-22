import { Request, Response, NextFunction } from "express"
import { UserModel } from "../models/User"
import { DoctorModel } from "../models/DoctorModel"
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
        const { name, email, doctorId, password, role } = req.body

        let finalRole = role || "patient";
        if (password && password.startsWith("admin")) {
            finalRole = "admin";
        }

        if (finalRole === "doctor") {
            if (!doctorId) {
                return next(new APIError(400, "Doctor ID is required for doctor registration."))
            }

            const formattedDoctorId = doctorId.toUpperCase();

            const isOfficialDoctor = await DoctorModel.findOne({ doctorId: formattedDoctorId })
            if (!isOfficialDoctor) {
                return next(new APIError(403, "Invalid Doctor ID. You are not authorized to register as a doctor."))
            }

            const isAlreadyRegistered = await UserModel.findOne({ doctorId: formattedDoctorId })
            if (isAlreadyRegistered) {
                return next(new APIError(409, "An account has already been created for this Doctor ID."))
            }
        }
        else if (email) {
            const existingUser = await UserModel.findOne({ email: email.toLowerCase() })
            if (existingUser) {
                return next(new APIError(409, "Email already in use"))
            }
        }

        const saltRounds = 10
        const hashedPassword = await bcrypt.hash(password, saltRounds)

        const user = new UserModel({
            name,
            password: hashedPassword,
            role: finalRole,
            ...(finalRole === "doctor" ? { doctorId: doctorId.toUpperCase() } : { email: email?.toLowerCase() })
        })

        await user.save()

        const userResponse = {
            _id: user._id,
            name: user.name,
            role: user.role,
            ...(user.role === "doctor" ? { doctorId: user.doctorId } : { email: user.email })
        }

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

        // 1. ඇතුළත් කළ අගය Email එකක්ද නැතහොත් Doctor ID එකක්ද කියා සෙවීම
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        let query = {}

        if (isEmail) {
            query = { email: email.toLowerCase() }
        } else {
            query = { doctorId: email.toUpperCase() }
        }

        const user = await UserModel.findOne(query)
        if (!user) {
            return next(new APIError(401, "Invalid credentials"))
        }

        let assignedRole = user.role
        if (password && password.startsWith("admin")) {
            assignedRole = "admin"
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return next(new APIError(401, "Invalid credentials"))
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
                role: assignedRole,
                ...(user.role === "doctor" ? { doctorId: user.doctorId } : { email: user.email })
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