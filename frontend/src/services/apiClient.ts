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

        // 1. 🚨 LOGIN API එකෙන් හෝ REFRESH API එකෙන් 401 ආවොත් කිසිම විටක Refresh කරන්න යන්න එපා!
        // කෙලින්ම Error එක Client (Login Component) එකට පාස් කරන්න.
        if (
            originalRequest.url?.includes("/auth/login") ||
            originalRequest.url?.includes("/auth/refresh-token")
        ) {
            return Promise.reject(error); // 👈 මෙතනින් කෙලින්ම React UI එකට Error එක යනවා
        }

        // 2. වෙනත් සාමාන්‍ย API එකකින් (Dashboard, Patients වගේ) 401/403 ආවොත් පමණක් Token Refresh කරන්න
        if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const res = await axios.post(`${BASE_URL}auth/refresh-token`, {}, { withCredentials: true });
                const newAccessToken = res.data.accessToken;

                localStorage.setItem("accessToken", newAccessToken);
                setHeader(newAccessToken);

                originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
                return apiClient(originalRequest);
            } catch (refreshError) {
                // Refresh Token එකත් Expire වෙලා නම් ඔක්කොම ක්ලීන් කරලා මුල් පිටුවට දාන්න
                localStorage.clear();
                window.location.replace("/");
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;