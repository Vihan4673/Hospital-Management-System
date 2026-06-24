import { PatientModel } from '../models/Patient';
import mongoose from 'mongoose';

export const generatePatientId = async (): Promise<string> => {
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
        return 'PAT001';
    }
};

export const createPatientService = async (patientData: any) => {
    const patientId = await generatePatientId();
    const { name, email, phone, age, gender, address } = patientData;

    const newPatient = new PatientModel({
        patientId,
        name,
        email,
        phone,
        age,
        gender,
        address
    });

    return await newPatient.save();
};

export const getPatientByIdService = async (id: string) => {
    return await PatientModel.findOne({ patientId: id }).lean();
};

export const getAllPatientsService = async () => {
    return await PatientModel.find().lean();
};

export const updatePatientService = async (id: string, updateData: any) => {
    return await PatientModel.findOneAndUpdate(
        { patientId: id },
        updateData,
        { new: true, runValidators: true }
    ).lean();
};

export const deletePatientService = async (id: string) => {
    return await PatientModel.findOneAndDelete({ patientId: id });
};