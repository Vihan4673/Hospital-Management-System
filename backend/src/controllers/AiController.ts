import { Request, Response } from "express";
import { analyzeSymptomsService } from "../services/AiService";

interface SymptomRequest {
    symptoms: string;
    availableSpecialties: string[];
}

export const analyzeSymptomsResponse = async (
    req: Request<{}, {}, SymptomRequest>,
    res: Response
): Promise<any> => {
    try {
        const { symptoms, availableSpecialties } = req.body;

        if (!symptoms) {
            return res.status(400).json({ message: "Symptoms are required." });
        }

        const aiAnalysis = await analyzeSymptomsService(symptoms, availableSpecialties);
        return res.json(aiAnalysis);

    } catch (error: any) {
        console.error("Groq API Error Details:", error.response?.data || error.message || error);

        return res.status(500).json({
            message: "AI Analysis failed using Groq.",
            error: error.message
        });
    }
};