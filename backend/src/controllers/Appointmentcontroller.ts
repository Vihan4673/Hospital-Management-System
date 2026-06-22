import { Request, Response, NextFunction } from "express";
import { AppointmentModel } from "../models/Appointment";
import mongoose from "mongoose";
import { APIError } from "../errors/APIError";
import { DoctorModel } from '../models/DoctorModel';
import { sendEmail } from "../utils/sendEmail";

export const createAppointment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { doctor, patient, appointmentDate, roomNumber, doctorFee } = req.body;

    if (!doctor || !patient || !appointmentDate) {
      return next(new APIError(400, "Doctor, Patient, and Appointment Date are required"));
    }

    if (!mongoose.Types.ObjectId.isValid(patient)) {
      return next(new APIError(400, "Invalid Patient ID format"));
    }

    let foundDoctor = null;
    if (mongoose.Types.ObjectId.isValid(doctor)) {
      foundDoctor = await DoctorModel.findById(doctor);
    }
    if (!foundDoctor) {
      foundDoctor = await DoctorModel.findOne({ doctorId: doctor });
    }

    if (!foundDoctor) {
      return next(new APIError(404, "Doctor profile not found in system"));
    }

    const targetDate = new Date(appointmentDate);
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const lastAppointment = await AppointmentModel.findOne({
      doctor: foundDoctor._id,
      appointmentDate: { $gte: startOfDay, $lte: endOfDay }
    }).sort({ tokenNumber: -1 });

    const nextTokenNumber = lastAppointment && lastAppointment.tokenNumber
        ? lastAppointment.tokenNumber + 1
        : 1;

    const appointment = new AppointmentModel({
      doctor: foundDoctor._id,
      patient: new mongoose.Types.ObjectId(patient),
      appointmentDate: appointmentDate,
      tokenNumber: nextTokenNumber, // ⚡ Token එක save කිරීම
      roomNumber: roomNumber || foundDoctor.roomNumber || "Room A",
      doctorFee: doctorFee !== undefined ? Number(doctorFee) : (foundDoctor.doctorFee || foundDoctor.fee || 0),
      status: "pending"
    });

    const savedAppointment = await appointment.save();

    const populatedAppointment = await AppointmentModel.findById(savedAppointment._id)
        .populate("patient")
        .populate("doctor")
        .lean();

    const patientObj = populatedAppointment?.patient as any;
    const doctorObj = populatedAppointment?.doctor as any;

    if (patientObj?.email) {
      try {
        const patientEmail = patientObj.email;
        const patientName = patientObj.name || "Patient";
        const doctorName = doctorObj?.name || "Doctor";
        const formattedDate = new Date(appointmentDate).toLocaleString();

        const emailHtml = `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #4CAF50; border-bottom: 2px solid #4CAF50; padding-bottom: 10px;">Appointment Confirmed!</h2>
            <p>Dear <strong>${patientName}</strong>,</p>
            <p>Your appointment has been successfully scheduled. Here are your booking details:</p>
            
            <div style="background-color: #e8f5e9; border: 1px dashed #4CAF50; padding: 15px; text-align: center; border-radius: 8px; margin: 15px 0;">
                <span style="font-size: 14px; color: #2e7d32; text-transform: uppercase; font-weight: bold; display: block; margin-bottom: 5px;">Your Queue Token Number</span>
                <span style="font-size: 36px; font-weight: bold; color: #1b5e20;">#${nextTokenNumber}</span>
            </div>

            <table style="width: 100%; border-collapse: collapse; margin-top: 15px; background-color: #f9f9f9;">
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold; width: 30%;">Doctor:</td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">Dr. ${doctorName}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">Date & Time:</td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">${formattedDate}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">Room Number:</td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">${populatedAppointment?.roomNumber || "Room A"}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">Doctor Fee:</td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd; color: #2e7d32; font-weight: bold;">LKR ${populatedAppointment?.doctorFee}</td>
              </tr>
            </table>
            <p style="margin-top: 20px; font-size: 13px; color: #666;">If you need to reschedule or cancel, please contact hospital management.</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;"/>
            <p style="font-size: 12px; color: #999; text-align: center;">Thank you for using our service!</p>
          </div>
        `;

        sendEmail({
          to: patientEmail,
          subject: `🏥 Appointment Confirmed - Token #${nextTokenNumber}`,
          text: `Hi ${patientName}, your appointment with Dr. ${doctorName} is confirmed. Your Token number is #${nextTokenNumber}.`,
          html: emailHtml
        }).catch(err => console.error("Email sending failed:", err));

      } catch (emailErr) {
        console.error("Email processing error:", emailErr);
      }
    }

    res.status(201).json(savedAppointment);
  } catch (err: any) {
    console.error("🔥 ACTUAL BACKEND ERROR (Create):", err);
    next(new APIError(500, "Error creating appointment", err.message));
  }
};

export const completeAppointment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
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

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
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

// 4️⃣ GET ACTIVE APPOINTMENTS
export const getActiveAppointments = async (req: Request, res: Response, next: NextFunction) => {
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

// 5️⃣ GET APPOINTMENTS BY DOCTOR
export const getAppointmentsByDoctor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { doctorId } = req.params;

    if (!doctorId) return next(new APIError(400, "Doctor ID parameter is required"));

    const query = mongoose.Types.ObjectId.isValid(doctorId)
        ? { doctor: new mongoose.Types.ObjectId(doctorId) }
        : { doctor: doctorId };

    const history = await AppointmentModel.find(query).populate("patient");
    res.status(200).json(history);
  } catch (err: any) {
    next(new APIError(500, "Error fetching doctor appointments", err.message));
  }
};

// 6️⃣ GET APPOINTMENTS BY PATIENT
export const getAppointmentsByPatient = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { patientId } = req.params;

    if (!patientId) return next(new APIError(400, "Patient ID parameter is required"));

    const query = mongoose.Types.ObjectId.isValid(patientId)
        ? { patient: new mongoose.Types.ObjectId(patientId) }
        : { patient: patientId };

    const history = await AppointmentModel.find(query).populate("doctor");
    res.status(200).json(history);
  } catch (err: any) {
    next(new APIError(500, "Error fetching patient appointments", err.message));
  }
};