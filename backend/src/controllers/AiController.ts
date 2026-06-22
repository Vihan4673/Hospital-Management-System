import { Request, Response } from "express";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

// 💡 FIX: Groq API එක සඳහා OpenAI client එක configure කිරීම
const openai = new OpenAI({
    apiKey: process.env.GROQ_API_KEY || "",
    baseURL: "https://api.groq.com/openai/v1", // 👈 Groq හි නිල Base URL එක
});

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

        const systemPrompt = `
      You are an expert medical triage assistant for a hospital appointment system.
      The patient describes their symptoms as: "${symptoms}".
      
      The available hospital medical specialties are: ${JSON.stringify(availableSpecialties)}.

      Task:
      1. Analyze the symptoms and match them to the single best fitting specialty from the provided list.
      2. If no clear match exists in the list, default to "General Physician".
      3. Provide a short, empathetic explanation (max 2 sentences) for the patient in English.
      4. Provide a confidence level between 0 and 100.

      Respond ONLY with a valid JSON object matching this structure:
      {
        "recommendedSpecialty": "Exact Specialty Name from the list",
        "confidence": 95,
        "explanation": "Brief explanation here."
      }
    `;

        const response = await openai.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: systemPrompt }],
            temperature: 0.1,
            response_format: { type: "json_object" }
        });

        const responseText = response.choices[0].message?.content?.trim();

        if (!responseText) {
            throw new Error("No response received from Groq AI");
        }

        console.log("--- Groq Raw Response ---", responseText);

        const aiAnalysis = JSON.parse(responseText);
        return res.json(aiAnalysis);

    } catch (error: any) {
        console.error("Groq API Error Details:", error.response?.data || error.message || error);

        return res.status(500).json({
            message: "AI Analysis failed using Groq.",
            error: error.message
        });
    }
};