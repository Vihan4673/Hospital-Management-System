import mongoose, { Schema } from "mongoose";

export type Appointment = {
    doctor: mongoose.Types.ObjectId | string;
    patient: mongoose.Types.ObjectId | string;
    appointmentDate: string;
    roomNumber: string;
    doctorFee: number;

    tokenNumber: number;

    status: "pending" | "cancelled" | "completed";
    createdAt: Date;
    updatedAt: Date;
};

const AppointmentSchema: Schema = new Schema<Appointment>(
    {
        doctor: {
            type: Schema.Types.ObjectId,
            ref: "Doctor",
            required: true
        },
        patient: {
            type: Schema.Types.ObjectId,
            ref: "Patient",
            required: true
        },
        appointmentDate: {
            type: String,
            required: true
        },
        roomNumber: {
            type: String,
            required: true,
            trim: true
        },
        doctorFee: {
            type: Number,
            required: true,
            default: 0
        },

        tokenNumber: {
            type: Number,
            required: true
        },

        status: {
            type: String,
            enum: ["pending", "cancelled", "completed"],
            default: "pending"
        },
    },
    { timestamps: true }
);

export const AppointmentModel = mongoose.model<Appointment>("Appointment", AppointmentSchema);