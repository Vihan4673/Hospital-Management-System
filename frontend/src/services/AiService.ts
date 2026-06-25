import axios from "axios";

const API_URL = "https://hospital-management-system-production-77e5.up.railway.app/api/ai";

export const getAiRecommendation = async (symptoms: string, availableSpecialties: string[]) => {
    const response = await axios.post(`${API_URL}/analyze`, {
        symptoms,
        availableSpecialties,
    });
    return response.data;
};