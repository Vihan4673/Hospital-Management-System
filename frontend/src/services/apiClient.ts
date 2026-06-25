import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL
    ? `${import.meta.env.VITE_API_BASE_URL}/api/`
    : "http://localhost:5000/api/";

const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        "content-type": "application/json"
    },
    withCredentials: true,
});

export const setHeader = (token: string | null) => {
    if (token) {
        apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
        delete apiClient.defaults.headers.common["Authorization"];
    }
};

// Request Interceptor
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
        if (token && !config.headers["Authorization"]) {
            config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // 1. 🚨 refresh-token URL එකෙන්ම 401 ආවොත්, කිසිම දෙයක් නොකර එතනින්ම Reject කරන්න (Loop block)
        if (originalRequest.url?.includes("/auth/refresh-token")) {
            return Promise.reject(error);
        }

        // 2. වෙනත් API එකකින් 401/403 ආවොත් පමණක් Token එක Refresh කරන්න ට්‍රයි කිරීම
        if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // apiClient වෙනුවට සාමාන්‍ය axios එකෙන් රික්වෙස්ට් එක යැවීම
                const res = await axios.post(`${BASE_URL}auth/refresh-token`, {}, { withCredentials: true });
                const newAccessToken = res.data.accessToken;

                localStorage.setItem("accessToken", newAccessToken);
                setHeader(newAccessToken);

                originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
                return apiClient(originalRequest);
            } catch (refreshError) {
                // 3. 🛡️ Refresh එක Fail වුණොත්, ඊළඟට එන හැම එකක්ම Block වෙන්න tokens ක්ලීන් කරන්න
                localStorage.clear(); // Token ඔක්කොම අයින් කරනවා

                // පිටුව මාරු වනතුරු ඉතිරි රික්වෙස්ට් ලූප් වීම වැලැක්වීමට බලෙන්ම පේජ් එක Reload කරනවා
                window.location.replace("/");

                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;