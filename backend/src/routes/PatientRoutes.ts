import { Router } from "express";
import {
    createPatient,
    deletePatient,
    getAllPatients,
    getPatientById,
    updatePatient,
} from "../controllers/Patientcontroller";
import { authenticateToken } from "../middleware/authenticateToken";

const patientRouter = Router();

patientRouter.use(authenticateToken);
patientRouter.get("/", getAllPatients);
patientRouter.get("/:id", getPatientById);
patientRouter.post("/", createPatient);
patientRouter.put("/:id", updatePatient);
patientRouter.delete("/:id", deletePatient);

export default patientRouter;