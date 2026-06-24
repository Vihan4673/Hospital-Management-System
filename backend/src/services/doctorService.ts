import mongoose from 'mongoose';
import { DoctorModel } from '../models/DoctorModel';

export const generateNextDoctorId = async (): Promise<string> => {
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

export const checkRoomConflict = async (
    roomNumber: string,
    availableDays: string[],
    startTime: string,
    endTime: string,
    excludeDoctorId?: string
): Promise<boolean> => {
    if (!roomNumber || !availableDays || !startTime || !endTime) return false;

    const query: any = {
        roomNumber: { $regex: new RegExp(`^${roomNumber.trim()}$`, 'i') },
        availableDays: { $in: availableDays },
        $and: [
            { startTime: { $lt: endTime } },
            { endTime: { $gt: startTime } }
        ]
    };

    if (excludeDoctorId) {
        query._id = { $ne: new mongoose.Types.ObjectId(excludeDoctorId) };
    }

    const conflictingDoctor = await DoctorModel.findOne(query);
    return !!conflictingDoctor;
};

export const createDoctorService = async (doctorData: any) => {
    const { name, email, phone, specialty, roomNumber, channellingPrice, availableDays, startTime, endTime } = doctorData;
    const doctorId = await generateNextDoctorId();

    const newDoctor = new DoctorModel({
        doctorId,
        name,
        email,
        phone,
        specialty,
        roomNumber,
        channellingPrice,
        availableDays,
        startTime,
        endTime,
    });

    return await newDoctor.save();
};

export const checkExistingDoctorByEmail = async (email: string) => {
    return await DoctorModel.findOne({ email });
};

export const getAllDoctorsService = async () => {
    return await DoctorModel.find().sort({ createdAt: -1 });
};

export const getDoctorByIdService = async (cleanId: string) => {
    const query = mongoose.Types.ObjectId.isValid(cleanId)
        ? { _id: cleanId }
        : { doctorId: cleanId };

    return await DoctorModel.findOne(query);
};

export const updateDoctorService = async (cleanId: string, updateData: any) => {
    return await DoctorModel.findOneAndUpdate(
        { _id: cleanId },
        updateData,
        { new: true, runValidators: false }
    );
};

export const deleteDoctorService = async (cleanId: string) => {
    return await DoctorModel.findOneAndDelete({ _id: cleanId });
};