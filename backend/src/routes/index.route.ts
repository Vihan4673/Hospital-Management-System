import { Router } from "express";
import readerRouter from "./PatientRoutes";
import authRouter from "./auth.route";
import bookRouter from "./Doctorroutes";
import lendingRouter from "./AppointmentRoute";
import overdueRouter from "./overdue.route";
import notifyRouter from "./notification.route";

const rootRouter = Router();

rootRouter.use("/reader", readerRouter)
rootRouter.use("/book", bookRouter)
rootRouter.use("/lendings", lendingRouter)
rootRouter.use("/overdue", overdueRouter)
rootRouter.use("/overdue", lendingRouter)
rootRouter.use("/notify", notifyRouter)

rootRouter.use("/auth", authRouter)


export default rootRouter