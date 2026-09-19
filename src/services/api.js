import axios from "axios";
import { API_BASE_URL } from "../utils/constants";

/**
 * Reusable Axios instance configured for the Nepal Engineering License Prep Backend.
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

/**
 * Request Interceptor: Automatically attach JWT token to all outgoing requests
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token") || localStorage.getItem("nec_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response Interceptor: Handle errors gracefully
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if expired or invalid
      localStorage.removeItem("token");
      localStorage.removeItem("nec_token");
    }
    return Promise.reject(error);
  }
);

// Auth Service Endpoints
export const authService = {
  login: async (credentials) => {
    const response = await api.post("/api/auth/login", credentials);
    return response.data;
  },
  register: async (userData) => {
    const response = await api.post("/api/auth/register", userData);
    return response.data;
  },
  getCurrentUser: async () => {
    const response = await api.get("/api/auth/me");
    return response.data;
  },
};

export default api;
