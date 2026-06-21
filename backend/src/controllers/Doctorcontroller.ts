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
    return 'DOC001';
  }
};

// 💡 ─── ROOM AVAILABILITY CHECK HELPER FUNCTION ───
// එකම කාමරය, එකම දවස්වල, එකම වෙලාවක ගැටෙනවාදැයි පරීක්ෂා කිරීම
const checkRoomConflict = async (
    roomNumber: string,
    availableDays: string[],
    startTime: string,
    endTime: string,
    excludeDoctorId?: string
): Promise<boolean> => {
  if (!roomNumber || !availableDays || !startTime || !endTime) return false;

  // Query සකස් කිරීම
  const query: any = {
    roomNumber: { $regex: new RegExp(`^${roomNumber.trim()}$`, 'i') }, // Case-insensitive check
    availableDays: { $in: availableDays }, // තෝරාගත් දවස් වලින් එකක් හෝ තිබේදැයි බැලීම
    $and: [
      { startTime: { $lt: endTime } },  // පවතින startTime එක අලුත් endTime එකට වඩා අඩු විය යුතුය
      { endTime: { $gt: startTime } }   // පවතින endTime එක අලුත් startTime එකට වඩා වැඩි විය යුතුය
    ]
  };

  // Update එකකදී තමන්ගේම පරණ රෙකෝඩ් එක මඟ හැරීමට (Exclude current doctor)
  if (excludeDoctorId) {
    query._id = { $ne: new mongoose.Types.ObjectId(excludeDoctorId) };
  }

  const conflictingDoctor = await DoctorModel.findOne(query);
  return !!conflictingDoctor; // තිබේ නම් true, නැත්නම් false
};

export const createDoctor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 💡 roomNumber එක req.body එකෙන් ලබා ගැනීම
    const { name, email, phone, specialty, roomNumber, channellingPrice, availableDays, startTime, endTime } = req.body;

    const existingDoctor = await DoctorModel.findOne({ email });
    if (existingDoctor) {
      return next(new APIError(400, 'Doctor with this email already exists'));
    }

    // 💡 1. Backend Room Conflict Validation
    const hasRoomConflict = await checkRoomConflict(roomNumber, availableDays, startTime, endTime);
    if (hasRoomConflict) {
      return next(new APIError(400, 'The assigned room is already reserved by another doctor for the selected schedule.'));
    }

    const doctorId = await generateNextDoctorId();

    const newDoctor = new DoctorModel({
      doctorId,
      name,
      email,
      phone,
      specialty,
      roomNumber, // 💡 Save කිරීම
      channellingPrice,
      availableDays,
      startTime,
      endTime,
    });

    const savedDoctor = await newDoctor.save();
    return res.status(201).json(savedDoctor);
  } catch (err: any) {
    console.error("🔴 Create Doctor Error Details:", err);
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

    // 💡 2. Update කරන වෙලාවටත් Room එක වෙනත් අයෙක් බුක් කරලාදැයි බැලීම (තමන්ගේ පරණ ID එක හැර)
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

    const updatedDoctor = await DoctorModel.findOneAndUpdate(
        { _id: cleanId },
        updateData,
        { new: true, runValidators: false }
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