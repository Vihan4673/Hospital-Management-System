import { NextFunction, Request, Response } from 'express';
import { PatientModel } from '../models/Patient';
import mongoose from 'mongoose';
import { APIError } from '../errors/APIError';

const generatePatientId = async (): Promise<string> => {
    try {
        const lastPatient = await PatientModel.findOne().sort({ createdAt: -1 }).exec();

        if (!lastPatient || !lastPatient.patientId) {
            return 'PAT001';
        }

        const lastIdNumber = parseInt(lastPatient.patientId.substring(3));
        const newIdNumber = isNaN(lastIdNumber) ? 1 : lastIdNumber + 1;
        const padded = String(newIdNumber).padStart(3, '0');

        return `PAT${padded}`;
    } catch (err) {
        return 'PAT001'; // 💡 Error එකක් ආවොත් සර්වර් එක ක්‍රෑෂ් නොවී default ID එකක් දීම
    }
};

export const createPatient = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const patientId = await generatePatientId();
        const { name, email, phone, age, gender, address } = req.body;

        const newPatient = new PatientModel({
            patientId,
            name,
            email,
            phone,
            age,
            gender,
            address
        });

        const savedPatient = await newPatient.save();
        return res.status(201).json(savedPatient);
    } catch (error: any) {
        console.error("🔥 PATIENT CREATE ERROR:", error);
        if (error instanceof mongoose.Error.ValidationError) {
            const errors = Object.values(error.errors).map((e) => e.message);
            return next(new APIError(400, "Validation failed", errors));
        }
        next(new APIError(500, "Internal server Error", error.message));
    }
};

export const getPatientById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const patient = await PatientModel.findOne({ patientId: req.params.id }).lean();
        if (!patient) {
            return next(new APIError(404, "Patient not found"));
        }
        res.status(200).json(patient);
    } catch (error: any) {
        next(new APIError(500, "Internal server Error", error.message));
    }
};

export const getAllPatients = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const patients = await PatientModel.find().lean();
        res.status(200).json(patients);
    } catch (error: any) {
        console.error("🔥 GET ALL PATIENTS ERROR:", error);
        next(new APIError(500, "Internal server Error", error.message));
    }
};

export const updatePatient = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const updated = await PatientModel.findOneAndUpdate(
            { patientId: req.params.id },
            req.body,
            { new: true, runValidators: true }
        ).lean();

        if (!updated) return next(new APIError(404, "Patient not found"));
        res.status(200).json(updated);
    } catch (err: any) {
        if (err instanceof mongoose.Error.ValidationError) {
            const errors = Object.values(err.errors).map(e => e.message);
            next(new APIError(400, "Validation failed", errors));
        } else {
            next(new APIError(500, "Internal Server Error", err.message));
        }
    }
};

export const deletePatient = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const deleted = await PatientModel.findOneAndDelete({ patientId: req.params.id });
        if (!deleted) return next(new APIError(404, "Patient not found"));
        res.status(200).json({ message: "Patient deleted successfully" });
    } catch (err: any) {
        next(new APIError(500, "Internal Server Error", err.message));
    }
};