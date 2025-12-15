// frontend/src/services/orderService.js
import api from "./api";

const BASE_URL = "/api/marketplace/orders";

// ========================================
// 1. CREATE ORDER (Protected)
// ========================================
export const createOrder = async (orderData) => {
  try {
    const response = await api.post(BASE_URL, orderData);
    return response;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};

// ========================================
// 2. GET ORDER BY ID (Protected)
// ========================================
export const getOrderById = async (id) => {
  try {
    const response = await api.get(`${BASE_URL}/${id}`);
    return response;
  } catch (error) {
    console.error("Error fetching order:", error);
    throw error;
  }
};

// ========================================
// 3. GET USER'S ORDERS (Protected)
// ========================================
export const getUserOrders = async (userId, filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.role) params.append("role", filters.role); // buyer | seller
    if (filters.status) params.append("status", filters.status);
    if (filters.page) params.append("page", filters.page);
    if (filters.limit) params.append("limit", filters.limit);
    
    const response = await api.get(`${BASE_URL}/user/${userId}?${params.toString()}`);
    return response;
  } catch (error) {
    console.error("Error fetching user orders:", error);
    throw error;
  }
};

// ========================================
// 4. GET ORDER STATISTICS (Protected)
// ========================================
export const getOrderStats = async (userId, role = "buyer") => {
  try {
    const response = await api.get(`${BASE_URL}/${userId}/stats?role=${role}`);
    return response;
  } catch (error) {
    console.error("Error fetching order stats:", error);
    throw error;
  }
};

// ========================================
// 5. UPDATE ORDER STATUS (Protected)
// ========================================
export const updateOrderStatus = async (id, status, trackingNumber = null) => {
  try {
    const data = { status };
    if (trackingNumber) data.tracking_number = trackingNumber;
    
    const response = await api.put(`${BASE_URL}/${id}/status`, data);
    return response;
  } catch (error) {
    console.error("Error updating order status:", error);
    throw error;
  }
};

// ========================================
// 6. UPDATE PAYMENT STATUS (Protected)
// ========================================
export const updatePaymentStatus = async (id, paymentStatus, transactionId = null) => {
  try {
    const data = { payment_status: paymentStatus };
    if (transactionId) data.transaction_id = transactionId;
    
    const response = await api.put(`${BASE_URL}/${id}/payment`, data);
    return response;
  } catch (error) {
    console.error("Error updating payment status:", error);
    throw error;
  }
};

// ========================================
// 7. CANCEL ORDER (Protected)
// ========================================
export const cancelOrder = async (id, reason, cancelledBy) => {
  try {
    const response = await api.post(`${BASE_URL}/${id}/cancel`, {
      reason,
      cancelled_by: cancelledBy,
    });
    return response;
  } catch (error) {
    console.error("Error cancelling order:", error);
    throw error;
  }
};

// ========================================
// 8. RATE SELLER (Protected - Buyer only)
// ========================================
export const rateSeller = async (id, rating, review = null) => {
  try {
    const data = { rating };
    if (review) data.review = review;
    
    const response = await api.post(`${BASE_URL}/${id}/rate-seller`, data);
    return response;
  } catch (error) {
    console.error("Error rating seller:", error);
    throw error;
  }
};

// ========================================
// 9. RATE BUYER (Protected - Seller only)
// ========================================
export const rateBuyer = async (id, rating, review = null) => {
  try {
    const data = { rating };
    if (review) data.review = review;
    
    const response = await api.post(`${BASE_URL}/${id}/rate-buyer`, data);
    return response;
  } catch (error) {
    console.error("Error rating buyer:", error);
    throw error;
  }
};

// ========================================
// 10. HELPER: Get order status label
// ========================================
export const getOrderStatusLabel = (status) => {
  const statusLabels = {
    pending_payment: "Chờ thanh toán",
    paid: "Đã thanh toán",
    preparing: "Đang chuẩn bị",
    shipping: "Đang vận chuyển",
    delivered: "Đã giao hàng",
    completed: "Hoàn thành",
    cancelled: "Đã hủy",
    refunded: "Đã hoàn tiền",
  };
  return statusLabels[status] || status;
};

// ========================================
// 11. HELPER: Get payment status label
// ========================================
export const getPaymentStatusLabel = (status) => {
  const statusLabels = {
    pending: "Chờ thanh toán",
    paid: "Đã thanh toán",
    failed: "Thanh toán thất bại",
    refunded: "Đã hoàn tiền",
  };
  return statusLabels[status] || status;
};

// ========================================
// 12. HELPER: Check if can cancel order
// ========================================
export const canCancelOrder = (orderStatus) => {
  return ["pending_payment", "paid", "preparing"].includes(orderStatus);
};

// ========================================
// 13. HELPER: Check if can rate
// ========================================
export const canRate = (orderStatus) => {
  return orderStatus === "completed";
};