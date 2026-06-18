import { Request, Response, NextFunction } from "express";
import { AppointmentModel } from "../models/Appointment";
import mongoose from "mongoose";
import { APIError } from "../errors/APIError";
import { DoctorModel } from '../models/DoctorModel';

export const createAppointment = async (req: Request, res: Response, next: NextFunction) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { doctorId, patientId, appointmentDate } = req.body;

    const foundDoctor = await DoctorModel.findOne({ doctorId }).session(session);
    if (!foundDoctor) {
      await session.abortTransaction();
      return next(new APIError(404, "Doctor not found"));
    }

    const dateOfAppointment = appointmentDate ? new Date(appointmentDate) : new Date();

    const appointment = new AppointmentModel({
      doctor: foundDoctor._id,
      patient: patientId,
      appointmentDate: dateOfAppointment,
      status: "Scheduled"
    });

    const savedAppointment = await appointment.save({ session });

    await session.commitTransaction();
    res.status(201).json(savedAppointment);
  } catch (err: any) {
    await session.abortTransaction();
    next(new APIError(500, "Error creating appointment", err.message));
  } finally {
    session.endSession();
  }
};

export const cancelAppointment = async (req: Request, res: Response, next: NextFunction) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { id } = req.params;

    const appointment = await AppointmentModel.findById(id).session(session);
    if (!appointment) {
      await session.abortTransaction();
      return next(new APIError(404, "Appointment record not found"));
    }

    if (appointment.status === "Cancelled") {
      await session.abortTransaction();
      return next(new APIError(400, "Appointment has already been cancelled"));
    }

    appointment.status = "Cancelled";
    await appointment.save({ session });

    await session.commitTransaction();
    res.status(200).json({ message: "Appointment cancelled successfully", appointment });
  } catch (err: any) {
    await session.abortTransaction();
    next(new APIError(500, "Error cancelling appointment", err.message));
  } finally {
    session.endSession();
  }
};

export const getActiveAppointments = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const active = await AppointmentModel.find({ status: "Scheduled" }).populate("doctor patient");
    res.status(200).json(active);
  } catch (err: any) {
    next(new APIError(500, "Error fetching active appointments", err.message));
  }
};

export const getAppointmentsByDoctor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { doctorId } = req.params;
    const history = await AppointmentModel.find({ doctor: doctorId }).populate("patient");
    res.status(200).json(history);
  } catch (err: any) {
    next(new APIError(500, "Error fetching doctor appointments", err.message));
  }
};

export const getAppointmentsByPatient = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { patientId } = req.params;
    const history = await AppointmentModel.find({ patient: patientId }).populate("doctor");
    res.status(200).json(history);
  } catch (err: any) {
    next(new APIError(500, "Error fetching patient appointments", err.message));
  }
};