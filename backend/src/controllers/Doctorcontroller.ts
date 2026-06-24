import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { APIError } from '../errors/APIError';
import {
  checkExistingDoctorByEmail,
  checkRoomConflict,
  createDoctorService,
  getAllDoctorsService,
  getDoctorByIdService,
  updateDoctorService,
  deleteDoctorService
} from '../services/doctorService'; // Path එක ඔයාගේ project එකට අනුව adjust කරගන්න

export const createDoctor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, roomNumber, availableDays, startTime, endTime } = req.body;

    const existingDoctor = await checkExistingDoctorByEmail(email);
    if (existingDoctor) {
      return next(new APIError(400, 'Doctor with this email already exists'));
    }

    const hasRoomConflict = await checkRoomConflict(roomNumber, availableDays, startTime, endTime);
    if (hasRoomConflict) {
      return next(new APIError(400, 'The assigned room is already reserved by another doctor for the selected schedule.'));
    }

    const savedDoctor = await createDoctorService(req.body);
    return res.status(201).json(savedDoctor);
  } catch (err: any) {
    console.error("Create Doctor Error Details:", err);
    if (err instanceof mongoose.Error.ValidationError) {
      const errors = Object.values(err.errors).map(e => e.message);
      return next(new APIError(400, 'Validation failed', errors));
    }
    return next(new APIError(500, 'Internal Server Error', err.message));
  }
};

export const getAllDoctor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doctors = await getAllDoctorsService();
    return res.status(200).json(doctors);
  } catch (err: any) {
    return next(new APIError(500, 'Internal Server Error', err.message));
  }
};

export const getDoctorById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cleanId = req.params.id.trim().replace(':', '');

    const doctor = await getDoctorByIdService(cleanId);
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

    if (updateData.roomNumber && updateData.availableDays && updateData.startTime && updateData.endTime) {
      const hasRoomConflict = await checkRoomConflict(
          updateData.roomNumber,
          updateData.availableDays,
          updateData.startTime,
          updateData.endTime,
          cleanId
      );

      if (hasRoomConflict) {
        return next(new APIError(400, 'The updated room allocation conflicts with another existing doctor schedule.'));
      }
    }

    const updatedDoctor = await updateDoctorService(cleanId, updateData);
    if (!updatedDoctor) return next(new APIError(404, 'Doctor not found'));
    return res.status(200).json(updatedDoctor);
  } catch (err: any) {
    console.error("Update Doctor Error Details:", err);
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

    const deletedDoctor = await deleteDoctorService(cleanId);
    if (!deletedDoctor) return next(new APIError(404, 'Doctor not found'));

    return res.status(200).json({ message: 'Doctor deleted successfully' });
  } catch (err: any) {
    return next(new APIError(500, 'Internal Server Error', err.message));
  }
};