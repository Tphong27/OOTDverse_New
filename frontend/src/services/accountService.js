// frontend/src/services/accountService.js
import axios from "axios";

const API_URL = "http://localhost:5000/api/users";

// ============================================
// QUẢN LÝ TÀI KHOẢN (ADMIN)
// ============================================

// 1. Lấy danh sách users
export async function getAllUsers(params = {}) {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      role = "all",
      status = "all",
    } = params;

    const response = await axios.get(`${API_URL}/all`, {
      params: { page, limit, search, role, status },
    });

    return response.data;
  } catch (error) {
    console.error("Error in getAllUsers:", error);
    throw error.response?.data || error;
  }
}

// 2. Lấy chi tiết user
export async function getUserById(userId) {
  try {
    const response = await axios.get(`${API_URL}/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error in getUserById:", error);
    throw error.response?.data || error;
  }
}

// 3. Cập nhật role
export async function updateUserRole(userId, roleName) {
  try {
    const response = await axios.put(`${API_URL}/${userId}/role`, {
      roleName,
    });
    return response.data;
  } catch (error) {
    console.error("Error in updateUserRole:", error);
    throw error.response?.data || error;
  }
}

// 4. Cập nhật status
export async function updateUserStatus(userId, status) {
  try {
    const response = await axios.put(`${API_URL}/${userId}/status`, {
      status,
    });
    return response.data;
  } catch (error) {
    console.error("Error in updateUserStatus:", error);
    throw error.response?.data || error;
  }
}

// 5. Xóa user
export async function deleteUser(userId) {
  try {
    const response = await axios.delete(`${API_URL}/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error in deleteUser:", error);
    throw error.response?.data || error;
  }
}

// 6. Cập nhật thông tin
export async function updateUserInfo(userId, data) {
  try {
    const response = await axios.put(`${API_URL}/${userId}/info`, data);
    return response.data;
  } catch (error) {
    console.error("Error in updateUserInfo:", error);
    throw error.response?.data || error;
  }
}

// 7. Toggle status
export async function toggleUserStatus(userId, currentStatus) {
  try {
    const newStatus = currentStatus === "Active" ? "Inactive" : "Active";
    return await updateUserStatus(userId, newStatus);
  } catch (error) {
    console.error("Error in toggleUserStatus:", error);
    throw error.response?.data || error;
  }
}

// 8. Lấy thống kê
export async function getUserStats() {
  try {
    const response = await axios.get(`${API_URL}/all`, {
      params: { limit: 10000 }
    });

    const { users, total } = response.data;

    const stats = {
      total,
      active: users.filter(u => u.status === "Active").length,
      inactive: users.filter(u => u.status === "Inactive").length,
      admins: users.filter(u => u.role?.name === "Admin").length,
      customers: users.filter(u => u.role?.name === "Customer").length,
      googleUsers: users.filter(u => u.authType === "google").length,
      localUsers: users.filter(u => u.authType === "local").length,
    };

    return stats;
  } catch (error) {
    console.error("Error in getUserStats:", error);
    throw error.response?.data || error;
  }
}