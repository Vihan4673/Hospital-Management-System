import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { DoctorModel } from '../models/DoctorModel';
import { APIError } from '../errors/APIError';

const generateNextDoctorId = async (): Promise<string> => {
  const lastDoctor = await DoctorModel.findOne({}, {}, { sort: { createdAt: -1 } });

  if (!lastDoctor || !lastDoctor.doctorId) {
    return 'DOC001';
  }

  const lastIdNumber = parseInt(lastDoctor.doctorId.replace('DOC', ''), 10);
  const nextIdNumber = lastIdNumber + 1;

  return `DOC${String(nextIdNumber).padStart(3, '0')}`;
};

export const createDoctor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, phone, specialty, channellingPrice, availableDays } = req.body;

    const existingDoctor = await DoctorModel.findOne({ email });
    if (existingDoctor) {
      return next(new APIError(400, 'DoctorModel with this email already exists'));
    }

    const doctorId = await generateNextDoctorId();

    const newDoctor = new DoctorModel({
      doctorId,
      name,
      email,
      phone,
      specialty,
      channellingPrice,
      availableDays,
    });

    const savedDoctor = await newDoctor.save();
    res.status(201).json(savedDoctor);
  } catch (err: any) {
    if (err instanceof mongoose.Error.ValidationError) {
      const errors = Object.values(err.errors).map(e => e.message);
      next(new APIError(400, 'Validation failed', errors));
    } else {
      next(new APIError(500, 'Internal Server Error', err.message));
    }
  }
};

// GET ALL DOCTORS
export const getAllDoctors = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doctors = await DoctorModel.find().sort({ createdAt: -1 }); // අලුත්ම අය උඩට එන ලෙස sort කර ඇත
    res.status(200).json(doctors);
  } catch (err: any) {
    next(new APIError(500, 'Internal Server Error', err.message));
  }
};

export const getDoctorById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doctor = await DoctorModel.findOne({ doctorId: req.params.id });
    if (!doctor) return next(new APIError(404, 'DoctorModel not found'));
    res.status(200).json(doctor);
  } catch (err: any) {
    next(new APIError(500, 'Internal Server Error', err.message));
  }
};

export const updateDoctor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { doctorId, ...updateData } = req.body;

    const updatedDoctor = await DoctorModel.findOneAndUpdate(
        { doctorId: req.params.id },
        updateData,
        { new: true, runValidators: true }
    );
    if (!updatedDoctor) return next(new APIError(404, 'DoctorModel not found'));
    res.status(200).json(updatedDoctor);
  } catch (err: any) {
    if (err instanceof mongoose.Error.ValidationError) {
      const errors = Object.values(err.errors).map(e => e.message);
      next(new APIError(400, 'Validation failed', errors));
    } else {
      next(new APIError(500, 'Internal Server Error', err.message));
    }
  }
};

export const deleteDoctor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deletedDoctor = await DoctorModel.findOneAndDelete({ doctorId: req.params.id });
    if (!deletedDoctor) return next(new APIError(404, 'DoctorModel not found'));

    res.status(200).json({ message: 'DoctorModel deleted successfully' });
  } catch (err: any) {
    next(new APIError(500, 'Internal Server Error', err.message));
  }
};