import axios from "axios";

const API_URL = "http://localhost:5000/api/ai";

export const getAiRecommendation = async (symptoms: string, availableSpecialties: string[]) => {
    const response = await axios.post(`${API_URL}/analyze`, {
        symptoms,
        availableSpecialties,
    });
    return response.data;
};