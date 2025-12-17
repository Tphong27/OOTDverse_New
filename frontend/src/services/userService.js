// frontend/src/services/userService.js
import axios from "axios";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/users`;

export const registerUser = async (userData) => {
  const response = await axios.post(`${API_URL}/register`, userData);
  return response.data;
};

export const loginUser = async (credentials) => {
  const response = await axios.post(`${API_URL}/login`, credentials);
  return response.data;
};

export const updateUserProfile = async (profileData) => {
  const response = await axios.post(`${API_URL}/profile`, profileData);
  return response.data;
};

export const getUserProfile = async (userId) => {
  const response = await axios.get(`${API_URL}/profile`, {
    params: { userId },
  });
  return response.data;
};

export const googleLoginUser = async (token) => {
  // Gửi token Google về backend để verify
  const response = await axios.post(`${API_URL}/google-login`, { token });
  return response.data;
};

export const verifyEmail = async (email, code, authType = null) => {
  const response = await axios.post(`${API_URL}/verify-email`, { email, code, authType });
  return response.data;
};

export const resendVerificationCode = async (email) => {
  const response = await axios.post(`${API_URL}/resend-verification`, { email });
  return response.data;
};

// Forgot password functions
export const forgotPassword = async (email) => {
  const response = await axios.post(`${API_URL}/forgot-password`, { email });
  return response.data;
};

export const verifyResetCode = async (email, code) => {
  const response = await axios.post(`${API_URL}/verify-reset-code`, { email, code });
  return response.data;
};

export const resetPassword = async (email, code, newPassword) => {
  const response = await axios.post(`${API_URL}/reset-password`, { email, code, newPassword });
  return response.data;
};

// Avatar upload
export const uploadAvatar = async (userId, base64Image) => {
  const response = await axios.post(`${API_URL}/upload-avatar`, { 
    userId, 
    image: base64Image 
  });
  return response.data;
};
