// frontend/src/services/paymentService.js
import api from "./api";

const BASE_URL = "/api/marketplace/payment";

// ========================================
// 1. CREATE PAYMENT (Protected)
// ========================================
export const createPayment = async (paymentData) => {
  try {
    const response = await api.post(`${BASE_URL}/create`, paymentData);
    return response;
  } catch (error) {
    console.error("Error creating payment:", error);
    throw error;
  }
};

// ========================================
// 2. VERIFY PAYMENT (Protected)
// ========================================
export const verifyPayment = async (verificationData) => {
  try {
    const response = await api.post(`${BASE_URL}/verify`, verificationData);
    return response;
  } catch (error) {
    console.error("Error verifying payment:", error);
    throw error;
  }
};

// ========================================
// 3. VNPAY: Create Payment URL
// ========================================
export const createVNPayPayment = async (orderData) => {
  try {
    const response = await api.post(`${BASE_URL}/vnpay/create`, orderData);
    return response;
  } catch (error) {
    console.error("Error creating VNPay payment:", error);
    throw error;
  }
};

// ========================================
// 4. VNPAY: Handle Return
// ========================================
export const handleVNPayReturn = async (queryParams) => {
  try {
    const response = await api.get(`${BASE_URL}/vnpay/return`, {
      params: queryParams,
    });
    return response;
  } catch (error) {
    console.error("Error handling VNPay return:", error);
    throw error;
  }
};

// ========================================
// 5. MOMO: Create Payment
// ========================================
export const createMoMoPayment = async (orderData) => {
  try {
    const response = await api.post(`${BASE_URL}/momo/create`, orderData);
    return response;
  } catch (error) {
    console.error("Error creating MoMo payment:", error);
    throw error;
  }
};

// ========================================
// 6. MOMO: Handle Return
// ========================================
export const handleMoMoReturn = async (queryParams) => {
  try {
    const response = await api.get(`${BASE_URL}/momo/return`, {
      params: queryParams,
    });
    return response;
  } catch (error) {
    console.error("Error handling MoMo return:", error);
    throw error;
  }
};

// ========================================
// 7. BANK TRANSFER: Upload Proof
// ========================================
export const uploadTransferProof = async (orderId, proofData) => {
  try {
    const formData = new FormData();
    formData.append("image", proofData.image);
    formData.append("note", proofData.note || "");

    const response = await api.post(
      `${BASE_URL}/bank-transfer/${orderId}/proof`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response;
  } catch (error) {
    console.error("Error uploading transfer proof:", error);
    throw error;
  }
};

// ========================================
// 8. GET PAYMENT BY ORDER ID (Protected)
// ========================================
export const getPaymentByOrderId = async (orderId) => {
  try {
    const response = await api.get(`${BASE_URL}/order/${orderId}`);
    return response;
  } catch (error) {
    console.error("Error getting payment:", error);
    throw error;
  }
};

// ========================================
// 9. CONFIRM COD PAYMENT (Protected)
// ========================================
export const confirmCODPayment = async (orderId) => {
  try {
    const response = await api.post(`${BASE_URL}/cod/${orderId}/confirm`);
    return response;
  } catch (error) {
    console.error("Error confirming COD:", error);
    throw error;
  }
};

// ========================================
// 10. HELPERS: Get payment status label
// ========================================
export const getPaymentStatusLabel = (status) => {
  const statusLabels = {
    pending: "Chờ thanh toán",
    processing: "Đang xử lý",
    paid: "Đã thanh toán",
    failed: "Thanh toán thất bại",
    refunded: "Đã hoàn tiền",
    cancelled: "Đã hủy",
  };
  return statusLabels[status] || status;
};

// ========================================
// 10. HELPERS: Get payment method label
// ========================================
export const getPaymentMethodLabel = (method) => {
  const methodLabels = {
    vnpay: "VNPay",
    momo: "MoMo",
    cod: "Thanh toán khi nhận hàng",
    bank_transfer: "Chuyển khoản ngân hàng",
  };
  return methodLabels[method] || method;
};

// ========================================
// 11. HELPERS: Format payment amount
// ========================================
export const formatPaymentAmount = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};