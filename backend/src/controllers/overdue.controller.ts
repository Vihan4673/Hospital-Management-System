import { Request, Response, NextFunction } from "express";
import { AppointmentModel } from "../models/Appointment";
import { APIError } from "../errors/APIError";
import { Patient } from "../models/Patient";

export const getOverdueReaders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const today = new Date();
    console.log(`today ${today}`);

    const overdueAppointments = await AppointmentModel.find({
      dueDate: { $lt: today },
      status: { $ne: "Completed" },
    })
        .populate("doctor")
        .populate("patient");

    console.log(`Overdue appointments count: ${overdueAppointments.length}`);

    if (overdueAppointments.length === 0) {
      return res.status(200).json({ message: "No overdue appointments found." });
    }

    const overdueByPatient: Record<string, any> = {};
    overdueAppointments.forEach((appointment: any) => {

      const patient = appointment.patient as unknown as Patient;

      const patientId = (patient as any)._id || (patient as any).patientId;

      if (!patientId) return;

      if (!overdueByPatient[patientId]) {
        overdueByPatient[patientId] = {
          patient: appointment.patient,
          overdueAppointments: [],
        };
      }

      overdueByPatient[patientId].overdueAppointments.push({
        doctor: appointment.doctor,
        dueDate: appointment.dueDate,
        appointmentDate: appointment.appointmentDate,
      });
    });

    res.status(200).json(Object.values(overdueByPatient));
  } catch (err: any) {
    next(new APIError(500, "Failed to fetch overdue data", err.message));
  }
};