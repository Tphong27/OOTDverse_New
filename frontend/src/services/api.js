// frontend/src/services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Log để debug
console.log("🔧 API Base URL:", api.defaults.baseURL);

// REQUEST INTERCEPTOR
api.interceptors.request.use(
  (config) => {
    const currentUser = localStorage.getItem("currentUser");
    
    if (currentUser) {
      try {
        const user = JSON.parse(currentUser);
        const token = user.token;
        
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error("Error parsing user token:", error);
      }
    }
    
    // Log request để debug
    console.log(`📤 API Request: ${config.method.toUpperCase()} ${config.baseURL}${config.url}`);
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// RESPONSE INTERCEPTOR
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.config.url}`, response.data);
    return response.data;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      
      console.error(`❌ API Error ${status}:`, error.config.url, data);
      
      if (status === 401) {
        console.error("Unauthorized - Redirecting to login");
        localStorage.removeItem("currentUser");
        
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
      
      if (status === 403) {
        console.error("Forbidden:", data.error);
      }
      
      if (status === 404) {
        console.error("Not Found:", data.error);
      }
      
      if (status === 400) {
        console.error("Validation Error:", data.error, data.details);
      }
      
      if (status === 500) {
        console.error("Server Error:", data.error);
      }
      
      return Promise.reject(data);
    } else if (error.request) {
      console.error("No response from server:", error.request);
      return Promise.reject({
        success: false,
        error: "Không thể kết nối đến server. Vui lòng kiểm tra mạng.",
      });
    } else {
      console.error("Request error:", error.message);
      return Promise.reject({
        success: false,
        error: error.message,
      });
    }
  }
);

export default api;