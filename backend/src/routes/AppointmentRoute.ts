import { Router } from "express";
import {
  createAppointment,
  completeAppointment,
  cancelAppointment,
  getActiveAppointments,
  getAppointmentsByDoctor,
  getAppointmentsByPatient,
} from "../controllers/Appointmentcontroller";

const appointmentRouter = Router();

appointmentRouter.post("/", createAppointment);
appointmentRouter.put("/complete/:id", completeAppointment);
appointmentRouter.put("/cancel/:id", cancelAppointment);
appointmentRouter.get("/active", getActiveAppointments);
appointmentRouter.get("/doctor/:doctorId", getAppointmentsByDoctor);
appointmentRouter.get("/patient/:patientId", getAppointmentsByPatient);

export default appointmentRouter;