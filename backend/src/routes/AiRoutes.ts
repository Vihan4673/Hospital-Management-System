import { Router } from "express";
import { analyzeSymptomsResponse } from "../controllers/AiController"; // ඔයාගේ file path එක දාන්න

const router = Router();

// POST /api/ai/analyze
router.post("/analyze", analyzeSymptomsResponse);

export default router;