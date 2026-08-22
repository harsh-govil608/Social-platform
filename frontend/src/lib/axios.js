import axios from "axios";
import toast from "react-hot-toast";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

export const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

// Global response error interceptor
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const message = error.response?.data?.message;
        const url = error.config?.url || "";

        // 401 — session expired (skip silent auth-check calls)
        if (status === 401) {
            if (!url.includes("/auth/me") && !url.includes("/auth/login")) {
                toast.error("Session expired. Please log in again.", { id: "session-expired" });
                setTimeout(() => { window.location.href = "/login"; }, 1500);
            }
            return Promise.reject(error);
        }

        // 403 — forbidden (let component handle with specific message if it wants)
        if (status === 403) {
            toast.error(message || "You don't have permission to do that.", { id: "forbidden" });
            return Promise.reject(error);
        }

        // 429 — rate limited
        if (status === 429) {
            toast.error("Too many requests. Please slow down.", { id: "rate-limited" });
            return Promise.reject(error);
        }

        // 500+ — server errors (use toast ID to deduplicate rapid failures)
        if (status >= 500) {
            toast.error("Something went wrong on our end. Try again shortly.", { id: "server-error" });
            return Promise.reject(error);
        }

        // Network error (no response at all)
        if (!error.response) {
            toast.error("Connection error. Check your internet.", { id: "network-error" });
            return Promise.reject(error);
        }

        // For all other errors (400, 404, etc.) let each component handle its own toast
        return Promise.reject(error);
    }
);

export default axiosInstance;
