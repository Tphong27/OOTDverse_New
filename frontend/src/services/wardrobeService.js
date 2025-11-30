import axios from "axios";

// Địa chỉ của Backend Server
// const API_URL = "http://localhost:5000/api/wardrobe";
const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/wardrobe`;

// 1. Hàm lấy danh sách đồ
export const getWardrobeItems = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data; // Trả về danh sách món đồ
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu tủ đồ:", error);
    return []; // Trả về mảng rỗng nếu lỗi
  }
};

// 2. Hàm thêm món đồ mới
export const createWardrobeItem = async (itemData) => {
  try {
    const response = await axios.post(API_URL, itemData);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi thêm món đồ:", error);
    throw error;
  }
};
