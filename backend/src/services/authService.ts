import { UserModel } from "../models/User"
import { DoctorModel } from "../models/DoctorModel"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const ACCESS_TOKEN_EXPIRATION = "15m"
const REFRESH_TOKEN_EXPIRATION = "7d"

export const createAccessToken = (userId: string, role: string) => {
    return jwt.sign({ userId, role },
        process.env.ACCESS_TOKEN_SECRET!, { expiresIn: ACCESS_TOKEN_EXPIRATION })
}

export const createRefreshToken = (userId: string, role: string) => {
    return jwt.sign({ userId, role },
        process.env.REFRESH_TOKEN_SECRET!, { expiresIn: REFRESH_TOKEN_EXPIRATION })
}

export const findOfficialDoctor = async (doctorId: string) => {
    return await DoctorModel.findOne({ doctorId });
};

export const findUserByDoctorId = async (doctorId: string) => {
    return await UserModel.findOne({ doctorId });
};

export const findUserByEmail = async (email: string) => {
    return await UserModel.findOne({ email });
};

export const hashPassword = async (password: string) => {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
};

export const createUser = async (userData: any) => {
    const user = new UserModel(userData);
    return await user.save();
};

export const getAllUsersService = async () => {
    return await UserModel.find().select("-password");
};

export const findUserByQuery = async (query: any) => {
    return await UserModel.findOne(query);
};

export const comparePassword = async (password: string, hash: string) => {
    return await bcrypt.compare(password, hash);
};

export const findUserById = async (id: string) => {
    return await UserModel.findById(id);
};