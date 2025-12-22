// frontend/src/services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Simple interceptor to add token from localStorage
api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
  if (user.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

// REQUEST INTERCEPTOR
api.interceptors.request.use(
  (config) => {
    try {
      const currentUser = localStorage.getItem("currentUser");

      if (currentUser) {
        const user = JSON.parse(currentUser);
        const token = user.token;
        
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log("✅ Token added to request");
        } else {
          console.warn("⚠️ No token found in currentUser");
        }
      } else {
        console.warn("⚠️ No currentUser in localStorage");
      }
    } catch (error) {
      console.error("❌ Error in request interceptor:", error);
    }

    console.log(
      `📤 API Request: ${config.method.toUpperCase()} ${config.baseURL}${config.url}`
    );

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
        console.error("🚫 Unauthorized - Token invalid or missing");
        console.error("Response:", data);
        
        // Xóa user và redirect
        localStorage.removeItem("currentUser");
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }

      return Promise.reject(data);
    }
    
    return Promise.reject({
      success: false,
      error: "Không thể kết nối đến server",
    });
  }
);

export default api;