// frontend/src/services/addressService.js
import api from "./api";

// export const getMyAddresses = () => api.get("/api/addresses");

// export const getDefaultAddress = () => api.get("/api/addresses/default");

// export const createAddress = (data) => api.post("/api/addresses", data);

// export const setDefaultAddress = (id) =>
//   api.put(`/api/addresses/${id}/default`);

const BASE_URL = "/api/addresses";

// Get all addresses of current user
export const getMyAddresses = async () => {
  try {
    const response = await api.get(BASE_URL);
    return response;
  } catch (error) {
    console.error("Error fetching addresses:", error);
    throw error;
  }
};

// Get default address
export const getDefaultAddress = async () => {
  try {
    const response = await api.get(`${BASE_URL}/default`);
    return response;
  } catch (error) {
    console.error("Error fetching default address:", error);
    throw error;
  }
};

// Create new address
export const createAddress = async (addressData) => {
  try {
    const response = await api.post(BASE_URL, addressData);
    return response;
  } catch (error) {
    console.error("Error creating address:", error);
    throw error;
  }
};

// Set address as default
export const setDefaultAddress = async (addressId) => {
  try {
    const response = await api.put(`${BASE_URL}/${addressId}/default`);
    return response;
  } catch (error) {
    console.error("Error setting default address:", error);
    throw error;
  }
};

// Delete address
export const deleteAddress = async (addressId) => {
  try {
    const response = await api.delete(`${BASE_URL}/${addressId}`);
    return response;
  } catch (error) {
    console.error("Error deleting address:", error);
    throw error;
  }
};