import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { APIError } from '../errors/APIError';
import {
    createPatientService,
    getPatientByIdService,
    getAllPatientsService,
    updatePatientService,
    deletePatientService
} from '../services/patientService';

export const createPatient = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const savedPatient = await createPatientService(req.body);
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
        const patient = await getPatientByIdService(req.params.id);
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
        const patients = await getAllPatientsService();
        res.status(200).json(patients);
    } catch (error: any) {
        console.error("GET ALL PATIENTS ERROR:", error);
        next(new APIError(500, "Internal server Error", error.message));
    }
};

export const updatePatient = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const updated = await updatePatientService(req.params.id, req.body);

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
        const deleted = await deletePatientService(req.params.id);
        if (!deleted) return next(new APIError(404, "Patient not found"));
        res.status(200).json({ message: "Patient deleted successfully" });
    } catch (err: any) {
        next(new APIError(500, "Internal Server Error", err.message));
    }
};