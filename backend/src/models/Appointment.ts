import mongoose, { Schema } from "mongoose";

export type Appointment = {
    doctor: mongoose.Types.ObjectId;
    patient: mongoose.Types.ObjectId;
    appointmentDate: Date;
    status: "Scheduled" | "Cancelled" | "Completed";
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
            type: Date,
            required: true,
            default: Date.now
        },
        status: {
            type: String,
            enum: ["Scheduled", "Cancelled", "Completed"],
            default: "Scheduled"
        },
    },
    { timestamps: true }
);

export const AppointmentModel = mongoose.model<Appointment>("Appointment", AppointmentSchema);