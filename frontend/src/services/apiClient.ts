import axios from "axios";

const getBaseUrl = () => {
    const rawUrl = import.meta.env.VITE_API_BASE_URL;

    if (rawUrl) {
        const cleanUrl = rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl;
        return cleanUrl.endsWith('/api') ? `${cleanUrl}/` : `${cleanUrl}/api/`;
    }

    return "http://localhost:5000/api/";
};

const BASE_URL = getBaseUrl();

const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        "content-type": "application/json"
    },
    withCredentials: true,
});

// ... ඉතිරි කේතය (Interceptors සහ setHeader) කලින් තිබූ පරිදිම තබන්න ...
export default apiClient;