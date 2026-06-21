import { Request, Response, NextFunction } from "express";
import { AppointmentModel } from "../models/Appointment";
import mongoose from "mongoose";
import { APIError } from "../errors/APIError";
import { DoctorModel } from '../models/DoctorModel';

export const createAppointment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { doctor, patient, appointmentDate, roomNumber } = req.body;

    if (!doctor || !patient || !appointmentDate) {
      return next(new APIError(400, "Doctor, Patient, and Appointment Date are required"));
    }

    // 💡 FIX 1: Patient ID එක valid ObjectId එකක්දැයි බැලීම
    if (!mongoose.Types.ObjectId.isValid(patient)) {
      return next(new APIError(400, "Invalid Patient ID format"));
    }

    let foundDoctor = null;

    // 💡 FIX 2: සර්වර් එක ක්‍රෑෂ් වීම වැළැක්වීමට 'doctor' string එක valid ObjectId එකක් නම් පමණක් findById කිරීම
    if (mongoose.Types.ObjectId.isValid(doctor)) {
      foundDoctor = await DoctorModel.findById(doctor);
    }

    // Valid ObjectId එකක් නොවේ නම් හෝ findById එකෙන් හමුනොවුනේ නම් custom doctorId එකෙන් සෙවීම
    if (!foundDoctor) {
      foundDoctor = await DoctorModel.findOne({ doctorId: doctor });
    }

    if (!foundDoctor) {
      return next(new APIError(404, "Doctor profile not found in system"));
    }

    // Appointment එක සෑදීම
    const appointment = new AppointmentModel({
      doctor: foundDoctor._id,
      patient: new mongoose.Types.ObjectId(patient),
      appointmentDate: appointmentDate, // ⚡ Schema එක string නිසා කෙලින්ම YYYY-MM-DD ලෙස සුරැකේ
      roomNumber: roomNumber || foundDoctor.roomNumber || "Room A",
      status: "pending"
    });

    const savedAppointment = await appointment.save();
    res.status(201).json(savedAppointment);
  } catch (err: any) {
    // 💡 සැබෑ ගැටලුව කුමක්දැයි Backend Terminal එකේ බලාගැනීමට ලොග් කිරීම
    console.error("🔥 ACTUAL BACKEND ERROR (Create):", err);
    next(new APIError(500, "Error creating appointment", err.message));
  }
};

export const completeAppointment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new APIError(400, "Invalid Appointment ID format"));
    }

    const appointment = await AppointmentModel.findById(id);
    if (!appointment) {
      return next(new APIError(404, "Appointment record not found"));
    }

    appointment.status = "completed";
    await appointment.save();

    res.status(200).json({ message: "Appointment marked as completed successfully", appointment });
  } catch (err: any) {
    console.error("🔥 ACTUAL BACKEND ERROR (Complete):", err);
    next(new APIError(500, "Error completing appointment", err.message));
  }
};

export const cancelAppointment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new APIError(400, "Invalid Appointment ID format"));
    }

    const appointment = await AppointmentModel.findById(id);
    if (!appointment) {
      return next(new APIError(404, "Appointment record not found"));
    }

    if (appointment.status === "cancelled") {
      return next(new APIError(400, "Appointment has already been cancelled"));
    }

    appointment.status = "cancelled";
    await appointment.save();

    res.status(200).json({ message: "Appointment cancelled successfully", appointment });
  } catch (err: any) {
    console.error("🔥 ACTUAL BACKEND ERROR (Cancel):", err);
    next(new APIError(500, "Error cancelling appointment", err.message));
  }
};

export const getActiveAppointments = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const active = await AppointmentModel.find({ status: "pending" })
        .populate("doctor")
        .populate("patient")
        .lean();

    res.status(200).json(active);
  } catch (err: any) {
    next(new APIError(500, "Error fetching active appointments", err.message));
  }
};

export const getAppointmentsByDoctor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { doctorId } = req.params;

    const query = mongoose.Types.ObjectId.isValid(doctorId)
        ? { doctor: new mongoose.Types.ObjectId(doctorId) }
        : { doctor: doctorId };

    const history = await AppointmentModel.find(query).populate("patient");
    res.status(200).json(history);
  } catch (err: any) {
    next(new APIError(500, "Error fetching doctor appointments", err.message));
  }
};

export const getAppointmentsByPatient = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { patientId } = req.params;

    const query = mongoose.Types.ObjectId.isValid(patientId)
        ? { patient: new mongoose.Types.ObjectId(patientId) }
        : { patient: patientId };

    const history = await AppointmentModel.find(query).populate("doctor");
    res.status(200).json(history);
  } catch (err: any) {
    next(new APIError(500, "Error fetching patient appointments", err.message));
  }
};