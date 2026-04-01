import axios from "axios";

// Base URL for the API
const API_BASE_URL = "http://localhost:5000/api";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

// Request interceptor - Attach token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized - Token expired or invalid
    if (error.response && error.response.status === 401) {
      console.warn("⚠️ Unauthorized access - Token may be expired");
      
      // Clear invalid token
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      
      // Optionally redirect to login
      // window.location.href = "/login";
    }
    
    return Promise.reject(error);
  }
);

// Export the configured axios instance and the base URL
export { api, API_BASE_URL };
export default api;