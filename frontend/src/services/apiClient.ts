import axios, { AxiosError } from "axios";

// Backend එක run වෙන්නේ port 5000 එකේ නිසා URL එක 5000 ට වෙනස් කර ඇත.
const BASE_URL = "http://localhost:3000/api/";

const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        "content-type": "application/json"
    },
    withCredentials: true,
});

export const setHeader = (token: string | null) => {
    if (token) {
        apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`; // Set Authorization header if token exists
    } else {
        delete apiClient.defaults.headers.common["Authorization"]; // Remove Authorization header if no token
    }
};

// response interceptor
apiClient.interceptors.response.use(
    (response) => response, // Pass through successful responses
    async (error) => {
        const originalRequest = error.config; // Save the original request config
        if (error.response?.status === 403 && !originalRequest._retry) {
            // If 403 error and not retried yet
            originalRequest._retry = true; // Mark request as retried
            try {
                const res = await apiClient.post("/auth/refresh-token");
                // Attempt to refresh token
                const newAccessToken = res.data.accessToken;
                // Get new access token from response
                setHeader(newAccessToken);
                // Set new token in headers
                originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
                // Update request header
                return apiClient(originalRequest);
                // Retry original request with new token
            } catch (refreshError) {
                if (refreshError instanceof AxiosError) {
                    if (refreshError.response?.status === 401) { // If refresh also fails (401)
                        window.location.href = "/"; // Redirect to home (logout)
                    }
                }
            }
        }
        return Promise.reject(error); // Reject promise if not handled above
    }
);

export default apiClient;