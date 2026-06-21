import { Router } from "express";
import patientRouter from "./PatientRoutes";
import authRouter from "./auth.route";
import doctorRouter from "./Doctorroutes";
import appointmentRouter from "./AppointmentRoute";
import notifyRouter from "./notification.route";

const rootRouter = Router();

rootRouter.use("/patient", patientRouter);

rootRouter.use("/doctor", doctorRouter);

rootRouter.use("/appointments", appointmentRouter);

rootRouter.use("/notify", notifyRouter);

rootRouter.use("/auth", authRouter);

export default rootRouter;