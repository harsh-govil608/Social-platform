import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

export const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

// Default export for backward compatibility
export default axiosInstance;