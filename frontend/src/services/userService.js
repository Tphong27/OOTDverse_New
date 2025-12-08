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
