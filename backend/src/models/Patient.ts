import mongoose, { Schema } from "mongoose";

export type Patient = {
  patientId: string;
  name: string;
  email: string;
  phone: string;
  age: number;
  gender: string;
  address: string;
  createdAt: Date;
  updatedAt: Date;
};

const patientSchema: Schema = new Schema<Patient>(
    {
      patientId: {
        type: String,
        unique: true,
        required: true,
        trim: true,
      },
      name: {
        type: String,
        required: true,
        trim: true,
      },
      email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
      },
      phone: {
        type: String,
        required: true,
        trim: true,
      },
      age: {
        type: Number,
        required: true,
        min: 1,
      },
      gender: {
        type: String,
        required: true,
        trim: true,
      },
      address: {
        type: String,
        required: true,
        trim: true,
      },
    },
    { timestamps: true }
);

export const PatientModel = mongoose.model<Patient>('Patient', patientSchema);