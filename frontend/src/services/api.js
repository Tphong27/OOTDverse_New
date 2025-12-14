// frontend/src/services/api.js
import axios from "axios";

// Tạo axios instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 seconds
});

// REQUEST INTERCEPTOR - Tự động gắn token
api.interceptors.request.use(
  (config) => {
    // Lấy token từ localStorage
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
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ========================================
// RESPONSE INTERCEPTOR - Xử lý errors
// ========================================
api.interceptors.response.use(
  (response) => {
    // Trả về data trực tiếp
    return response.data;
  },
  (error) => {
    // Xử lý các loại lỗi
    if (error.response) {
      const { status, data } = error.response;
      
      // 401 - Unauthorized (Token hết hạn hoặc không hợp lệ)
      if (status === 401) {
        console.error("Unauthorized - Redirecting to login");
        localStorage.removeItem("currentUser");
        
        // Redirect to login nếu đang ở browser
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
      
      // 403 - Forbidden (Không có quyền)
      if (status === 403) {
        console.error("Forbidden:", data.error);
      }
      
      // 404 - Not Found
      if (status === 404) {
        console.error("Not Found:", data.error);
      }
      
      // 400 - Validation Error
      if (status === 400) {
        console.error("Validation Error:", data.error, data.details);
      }
      
      // 500 - Server Error
      if (status === 500) {
        console.error("Server Error:", data.error);
      }
      
      return Promise.reject(data);
    } else if (error.request) {
      // Request được gửi nhưng không nhận được response
      console.error("No response from server");
      return Promise.reject({
        success: false,
        error: "Không thể kết nối đến server. Vui lòng kiểm tra mạng.",
      });
    } else {
      // Lỗi khác
      console.error("Request error:", error.message);
      return Promise.reject({
        success: false,
        error: error.message,
      });
    }
  }
);

export default api;