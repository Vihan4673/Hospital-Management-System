import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { DoctorModel } from '../models/DoctorModel';
import { APIError } from '../errors/APIError';

// 🔐 වඩාත් ආරක්ෂිතව ඊළඟ ID එක සාදන ආකාරය
const generateNextDoctorId = async (): Promise<string> => {
  try {
    const lastDoctor = await DoctorModel.findOne({}, {}, { sort: { createdAt: -1 } });

    if (!lastDoctor || !lastDoctor.doctorId || typeof lastDoctor.doctorId !== 'string') {
      return 'DOC001';
    }

    const numericPart = lastDoctor.doctorId.replace('DOC', '').trim();
    const lastIdNumber = parseInt(numericPart, 10);

    if (isNaN(lastIdNumber)) {
      return 'DOC001';
    }

    const nextIdNumber = lastIdNumber + 1;
    return `DOC${String(nextIdNumber).padStart(3, '0')}`;
  } catch (error) {
    return 'DOC001'; // මොකක් හරි අවුලක් වුණොත් crash නොවී බේරෙන්න
  }
};

export const createDoctor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, phone, specialty, channellingPrice, availableDays, startTime, endTime } = req.body;

    const existingDoctor = await DoctorModel.findOne({ email });
    if (existingDoctor) {
      return next(new APIError(400, 'Doctor with this email already exists'));
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
      startTime,
      endTime,
    });

    const savedDoctor = await newDoctor.save();
    return res.status(201).json(savedDoctor);
  } catch (err: any) {
    console.error("🔴 Create Doctor Error Details:", err); // 👈 Backend Terminal එකේ නියම වැරැද්ද බලාගන්න
    if (err instanceof mongoose.Error.ValidationError) {
      const errors = Object.values(err.errors).map(e => e.message);
      return next(new APIError(400, 'Validation failed', errors));
    }
    return next(new APIError(500, 'Internal Server Error', err.message));
  }
};

export const getAllDoctor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doctors = await DoctorModel.find().sort({ createdAt: -1 });
    return res.status(200).json(doctors);
  } catch (err: any) {
    return next(new APIError(500, 'Internal Server Error', err.message));
  }
};

export const getDoctorById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Frontend එකෙන් වැරදීමකින් එන තිත්/colon (:) අයින් කර පිරිසිදු කර ගැනීම
    const cleanId = req.params.id.trim().replace(':', '');

    const query = mongoose.Types.ObjectId.isValid(cleanId)
        ? { _id: cleanId }
        : { doctorId: cleanId };

    const doctor = await DoctorModel.findOne(query);
    if (!doctor) return next(new APIError(404, 'Doctor not found'));
    return res.status(200).json(doctor);
  } catch (err: any) {
    return next(new APIError(500, 'Internal Server Error', err.message));
  }
};

export const updateDoctor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cleanId = req.params.id.trim().replace(':', '');

    if (!mongoose.Types.ObjectId.isValid(cleanId)) {
      return next(new APIError(400, 'Invalid MongoDB Object ID format'));
    }

    const { doctorId, ...updateData } = req.body;

    const updatedDoctor = await DoctorModel.findOneAndUpdate(
        { _id: cleanId },
        updateData,
        { new: true, runValidators: false } // 👈 පරණ දත්ත නිසා crash වෙන එක නවතින්න මේක 'false' කරන්න
    );
    if (!updatedDoctor) return next(new APIError(404, 'Doctor not found'));
    return res.status(200).json(updatedDoctor);
  } catch (err: any) {
    console.error("🔴 Update Doctor Error Details:", err);
    if (err instanceof mongoose.Error.ValidationError) {
      const errors = Object.values(err.errors).map(e => e.message);
      return next(new APIError(400, 'Validation failed', errors));
    }
    return next(new APIError(500, 'Internal Server Error', err.message));
  }
};

export const deleteDoctor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cleanId = req.params.id.trim().replace(':', '');

    if (!mongoose.Types.ObjectId.isValid(cleanId)) {
      return next(new APIError(400, 'Invalid MongoDB Object ID format'));
    }

    const deletedDoctor = await DoctorModel.findOneAndDelete({ _id: cleanId });
    if (!deletedDoctor) return next(new APIError(404, 'Doctor not found'));

    return res.status(200).json({ message: 'Doctor deleted successfully' });
  } catch (err: any) {
    return next(new APIError(500, 'Internal Server Error', err.message));
  }
};