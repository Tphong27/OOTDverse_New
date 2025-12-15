// frontend/src/services/swapRequestService.js
import api from "./api";

const BASE_URL = "/api/marketplace/swap-requests";

// ========================================
// 1. CREATE SWAP REQUEST (Protected)
// ========================================
export const createSwapRequest = async (swapData) => {
  try {
    const response = await api.post(BASE_URL, swapData);
    return response;
  } catch (error) {
    console.error("Error creating swap request:", error);
    throw error;
  }
};

// ========================================
// 2. GET SWAP REQUEST BY ID (Protected)
// ========================================
export const getSwapRequestById = async (id) => {
  try {
    const response = await api.get(`${BASE_URL}/${id}`);
    return response;
  } catch (error) {
    console.error("Error fetching swap request:", error);
    throw error;
  }
};

// ========================================
// 3. GET USER'S SWAP REQUESTS (Protected)
// ========================================
export const getUserSwapRequests = async (userId, filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.role) params.append("role", filters.role); // requester | receiver
    if (filters.status) params.append("status", filters.status);
    if (filters.page) params.append("page", filters.page);
    if (filters.limit) params.append("limit", filters.limit);
    
    const response = await api.get(`${BASE_URL}/user/${userId}?${params.toString()}`);
    return response;
  } catch (error) {
    console.error("Error fetching user swap requests:", error);
    throw error;
  }
};

// ========================================
// 4. GET SWAP STATISTICS (Protected)
// ========================================
export const getSwapStats = async (userId) => {
  try {
    const response = await api.get(`${BASE_URL}/${userId}/stats`);
    return response;
  } catch (error) {
    console.error("Error fetching swap stats:", error);
    throw error;
  }
};

// ========================================
// 5. ACCEPT SWAP REQUEST (Protected - Receiver only)
// ========================================
export const acceptSwapRequest = async (id, receiverMessage = null, receiverAddress) => {
  try {
    const data = { receiver_address: receiverAddress };
    if (receiverMessage) data.receiver_message = receiverMessage;
    
    const response = await api.post(`${BASE_URL}/${id}/accept`, data);
    return response;
  } catch (error) {
    console.error("Error accepting swap request:", error);
    throw error;
  }
};

// ========================================
// 6. REJECT SWAP REQUEST (Protected - Receiver only)
// ========================================
export const rejectSwapRequest = async (id, rejectionReason) => {
  try {
    const response = await api.post(`${BASE_URL}/${id}/reject`, {
      rejection_reason: rejectionReason,
    });
    return response;
  } catch (error) {
    console.error("Error rejecting swap request:", error);
    throw error;
  }
};

// ========================================
// 7. CANCEL SWAP REQUEST (Protected - Requester only)
// ========================================
export const cancelSwapRequest = async (id) => {
  try {
    const response = await api.post(`${BASE_URL}/${id}/cancel`);
    return response;
  } catch (error) {
    console.error("Error cancelling swap request:", error);
    throw error;
  }
};

// ========================================
// 8. UPDATE SHIPPING INFO (Protected)
// ========================================
export const updateShipping = async (id, party, shippingMethod, trackingNumber = null) => {
  try {
    const data = {
      party, // requester | receiver
      shipping_method: shippingMethod,
    };
    if (trackingNumber) data.tracking_number = trackingNumber;
    
    const response = await api.put(`${BASE_URL}/${id}/shipping`, data);
    return response;
  } catch (error) {
    console.error("Error updating shipping:", error);
    throw error;
  }
};

// ========================================
// 9. MARK AS DELIVERED (Protected)
// ========================================
export const markDelivered = async (id, party) => {
  try {
    const response = await api.post(`${BASE_URL}/${id}/delivered`, { party });
    return response;
  } catch (error) {
    console.error("Error marking delivered:", error);
    throw error;
  }
};

// ========================================
// 10. RATE SWAP PARTNER (Protected)
// ========================================
export const rateSwapPartner = async (id, party, rating, review = null) => {
  try {
    const data = { party, rating };
    if (review) data.review = review;
    
    const response = await api.post(`${BASE_URL}/${id}/rate`, data);
    return response;
  } catch (error) {
    console.error("Error rating swap partner:", error);
    throw error;
  }
};

// ========================================
// 11. HELPER: Get swap status label
// ========================================
export const getSwapStatusLabel = (status) => {
  const statusLabels = {
    pending: "Chờ phản hồi",
    accepted: "Đã chấp nhận",
    in_progress: "Đang thực hiện",
    completed: "Hoàn thành",
    rejected: "Đã từ chối",
    cancelled: "Đã hủy",
    expired: "Đã hết hạn",
  };
  return statusLabels[status] || status;
};

// ========================================
// 12. HELPER: Check if can accept/reject
// ========================================
export const canRespond = (status) => {
  return status === "pending";
};

// ========================================
// 13. HELPER: Check if can cancel
// ========================================
export const canCancel = (status) => {
  return ["pending", "accepted"].includes(status);
};

// ========================================
// 14. HELPER: Check if can update shipping
// ========================================
export const canUpdateShipping = (status) => {
  return ["accepted", "in_progress"].includes(status);
};

// ========================================
// 15. HELPER: Check if can rate
// ========================================
export const canRate = (status) => {
  return status === "completed";
};