import { Router } from "express";
import { authenticateToken } from "../middleware/authenticateToken";
import {
    createDoctor,
    deleteDoctor,
    getAllDoctors,
    getDoctorById,
    updateDoctor,
} from "../controllers/Doctorcontroller";

const doctorRouter = Router();

doctorRouter.use(authenticateToken);
doctorRouter.get("/", getAllDoctors);
doctorRouter.get("/:id", getDoctorById);
doctorRouter.post("/", createDoctor);
doctorRouter.put("/:id", updateDoctor);
doctorRouter.delete("/:id", deleteDoctor);

export default doctorRouter;