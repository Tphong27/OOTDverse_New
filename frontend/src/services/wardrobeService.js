// services/wardrobeService.js
import axios from "axios";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/wardrobe`;

// Helper function để lấy userId từ localStorage
const getUserId = () => {
  if (typeof window === "undefined") return null;
  const storedUser = localStorage.getItem("currentUser");
  if (!storedUser) return null;
  try {
    const user = JSON.parse(storedUser);
    return user._id;
  } catch (error) {
    console.error("Error parsing user:", error);
    return null;
  }
};

// ===== 1. GET ALL ITEMS - Lấy danh sách món đồ =====
export const getWardrobeItems = async (userId = null) => {
  try {
    const uid = userId || getUserId();
    if (!uid) {
      console.warn("No userId found");
      return [];
    }

    const response = await axios.get(API_URL, {
      params: { userId: uid }
    });

    if (response.data.success) {
      return response.data.data;
    }
    return [];
  } catch (error) {
    console.error("Error fetching wardrobe items:", error);
    return [];
  }
};

// ===== 2. GET SINGLE ITEM - Lấy chi tiết 1 món đồ =====
export const getWardrobeItemById = async (itemId) => {
  try {
    const userId = getUserId();
    if (!userId) throw new Error("User not logged in");

    const response = await axios.get(`${API_URL}/${itemId}`, {
      params: { userId }
    });

    if (response.data.success) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error("Error fetching item:", error);
    throw error;
  }
};

// ===== 3. CREATE ITEM - Thêm món đồ mới =====
export const createWardrobeItem = async (itemData) => {
  try {
    const userId = getUserId();
    if (!userId) throw new Error("User not logged in");

    // Map dữ liệu từ form sang format của backend
    const payload = {
      userId,
      item_name: itemData.item_name || itemData.name,
      category_id: itemData.category_id,
      brand_id: itemData.brand_id || null,
      color_id: itemData.color_id || [],
      season_id: itemData.season_id || [],
      material_id: itemData.material_id || null,
      size: itemData.size || null,
      purchase_date: itemData.purchase_date || null,
      price: itemData.price || null,
      image_url: itemData.image_url || itemData.imageUrl,
      additional_images: itemData.additional_images || [],
      style_tags: itemData.style_tags || [],
      notes: itemData.notes || "",
      is_favorite: itemData.is_favorite || false
    };

    const response = await axios.post(API_URL, payload);

    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || "Thêm món đồ thất bại");
  } catch (error) {
    console.error("Error creating item:", error);
    throw error;
  }
};

// ===== 4. UPDATE ITEM - Cập nhật món đồ =====
export const updateWardrobeItem = async (itemId, updateData) => {
  try {
    const userId = getUserId();
    if (!userId) throw new Error("User not logged in");

    const payload = {
      userId,
      ...updateData
    };

    const response = await axios.put(`${API_URL}/${itemId}`, payload);

    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || "Cập nhật thất bại");
  } catch (error) {
    console.error("Error updating item:", error);
    throw error;
  }
};

// ===== 5. DELETE ITEM - Xóa món đồ =====
export const deleteWardrobeItem = async (itemId) => {
  try {
    const userId = getUserId();
    if (!userId) throw new Error("User not logged in");

    const response = await axios.delete(`${API_URL}/${itemId}`, {
      params: { userId }
    });

    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || "Xóa thất bại");
  } catch (error) {
    console.error("Error deleting item:", error);
    throw error;
  }
};

// ===== 6. TOGGLE FAVORITE - Đánh dấu yêu thích =====
export const toggleFavoriteItem = async (itemId) => {
  try {
    const userId = getUserId();
    if (!userId) throw new Error("User not logged in");

    const response = await axios.patch(`${API_URL}/${itemId}/favorite`, {
      userId
    });

    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || "Toggle favorite thất bại");
  } catch (error) {
    console.error("Error toggling favorite:", error);
    throw error;
  }
};

// ===== 7. INCREMENT WEAR COUNT - Tăng số lần mặc =====
export const incrementWearCount = async (itemId) => {
  try {
    const userId = getUserId();
    if (!userId) throw new Error("User not logged in");

    const response = await axios.patch(`${API_URL}/${itemId}/wear`, {
      userId
    });

    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || "Cập nhật wear count thất bại");
  } catch (error) {
    console.error("Error incrementing wear count:", error);
    throw error;
  }
};

// ===== 8. GET STATISTICS - Lấy thống kê =====
export const getWardrobeStatistics = async () => {
  try {
    const userId = getUserId();
    if (!userId) throw new Error("User not logged in");

    const response = await axios.get(`${API_URL}/statistics`, {
      params: { userId }
    });

    if (response.data.success) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error("Error fetching statistics:", error);
    return null;
  }
};

// ===== 9. FILTER ITEMS - Lọc món đồ theo điều kiện =====
export const filterWardrobeItems = (items, filters) => {
  let filtered = [...items];

  // Filter by category
  if (filters.category && filters.category !== "all") {
    filtered = filtered.filter(item => 
      item.category_id?.name === filters.category || 
      item.category_id?._id === filters.category
    );
  }

  // Filter by brand
  if (filters.brand) {
    filtered = filtered.filter(item => 
      item.brand_id?._id === filters.brand
    );
  }

  // Filter by color
  if (filters.color && filters.color.length > 0) {
    filtered = filtered.filter(item =>
      item.color_id?.some(color => filters.color.includes(color._id))
    );
  }

  // Filter by season
  if (filters.season && filters.season.length > 0) {
    filtered = filtered.filter(item =>
      item.season_id?.some(season => filters.season.includes(season._id))
    );
  }

  // Filter by favorite
  if (filters.favorite) {
    filtered = filtered.filter(item => item.is_favorite);
  }

  // Search by name or brand
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(item =>
      item.item_name?.toLowerCase().includes(searchLower) ||
      item.brand_id?.name?.toLowerCase().includes(searchLower)
    );
  }

  return filtered;
};