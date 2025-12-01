import axios from "axios";

// Địa chỉ của Backend Server
// const API_URL = "http://localhost:5000/api/wardrobe";
const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/wardrobe`;

// 1. Hàm lấy danh sách đồ
export const getWardrobeItems = async (userId) => {
  if (!userId) return [];
  try {
    // Gửi userId lên URL: /api/wardrobe?userId=...
    const response = await axios.get(API_URL, { params: { userId } });
    return response.data;
  } catch (error) {
    console.error("Lỗi lấy tủ đồ:", error);
    return [];
  }
};

// 2. Hàm thêm món đồ mới
export const createWardrobeItem = async (itemData) => {
  try {
    const response = await axios.post(API_URL, itemData);
    return response.data;
  } catch (error) {
    console.error("Lỗi thêm món đồ:", error);
    throw error;
  }
};
