import mongoose, { Schema } from "mongoose";

export type Doctor = {
    doctorId: string;
    name: string;
    email: string;
    phone: string;
    specialty: string;
    channellingPrice: number;
    availableDays: string[];
    createdAt: Date;
    updatedAt: Date;
}

const DoctorSchema: Schema = new Schema<Doctor>(
    {
        doctorId: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        phone: {
            type: String,
            required: true,
            trim: true,
        },
        specialty: {
            type: String,
            required: true,
            trim: true,
        },
        channellingPrice: {
            type: Number,
            required: true,
            min: 0,
        },
        availableDays: {
            type: [String],
            required: true,
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

export const DoctorModel = mongoose.model<Doctor>("Doctor", DoctorSchema);