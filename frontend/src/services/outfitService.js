import axios from "axios";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/outfits`;
const OUTFIT_ITEMS_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/outfit-items`;

// ========================================
// OUTFIT CRUD OPERATIONS
// ========================================

// 1. Lấy danh sách outfits (có filters)
export const getOutfits = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.user_id) params.append("user_id", filters.user_id);
    if (filters.style_id) params.append("style_id", filters.style_id);
    if (filters.occasion_id) params.append("occasion_id", filters.occasion_id);
    if (filters.season_id) params.append("season_id", filters.season_id);
    if (filters.weather_id) params.append("weather_id", filters.weather_id);
    if (filters.is_public !== undefined) params.append("is_public", filters.is_public);
    if (filters.is_featured !== undefined) params.append("is_featured", filters.is_featured);
    if (filters.ai_suggested !== undefined) params.append("ai_suggested", filters.ai_suggested);
    if (filters.min_rating) params.append("min_rating", filters.min_rating);
    if (filters.sort_by) params.append("sort_by", filters.sort_by);
    if (filters.page) params.append("page", filters.page);
    if (filters.limit) params.append("limit", filters.limit);

    const response = await axios.get(`${API_URL}?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy outfits:", error);
    throw error;
  }
};

// 2. Lấy chi tiết 1 outfit
export const getOutfitById = async (id, incrementView = false) => {
  try {
    const params = new URLSearchParams();
    if (incrementView) params.append("increment_view", "true");

    const response = await axios.get(`${API_URL}/${id}?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy outfit:", error);
    throw error;
  }
};

// 3. Tạo outfit mới
export const createOutfit = async (outfitData) => {
  try {
    const response = await axios.post(API_URL, outfitData);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tạo outfit:", error);
    throw error;
  }
};

// 4. Cập nhật outfit
export const updateOutfit = async (id, outfitData) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, outfitData);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi cập nhật outfit:", error);
    throw error;
  }
};

// 5. Xóa outfit
export const deleteOutfit = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi xóa outfit:", error);
    throw error;
  }
};

// ========================================
// OUTFIT INTERACTIONS
// ========================================

// 6. Toggle like outfit
export const toggleLike = async (id, increment = true) => {
  try {
    const response = await axios.post(`${API_URL}/${id}/like`, { increment });
    return response.data;
  } catch (error) {
    console.error("Lỗi toggle like:", error);
    throw error;
  }
};

// 7. Toggle save outfit
export const toggleSave = async (id, increment = true) => {
  try {
    const response = await axios.post(`${API_URL}/${id}/save`, { increment });
    return response.data;
  } catch (error) {
    console.error("Lỗi toggle save:", error);
    throw error;
  }
};

// 8. Ghi nhận mặc outfit
export const recordWear = async (id) => {
  try {
    const response = await axios.post(`${API_URL}/${id}/wear`);
    return response.data;
  } catch (error) {
    console.error("Lỗi record wear:", error);
    throw error;
  }
};

// 9. Cập nhật rating
export const updateRating = async (id, rating) => {
  try {
    const response = await axios.post(`${API_URL}/${id}/rating`, { rating });
    return response.data;
  } catch (error) {
    console.error("Lỗi update rating:", error);
    throw error;
  }
};

// ========================================
// USER'S OUTFITS
// ========================================

// 10. Lấy outfits của user
export const getUserOutfits = async (userId, filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.is_public !== undefined) params.append("is_public", filters.is_public);
    if (filters.page) params.append("page", filters.page);
    if (filters.limit) params.append("limit", filters.limit);

    const response = await axios.get(`${API_URL}/user/${userId}?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy outfits của user:", error);
    throw error;
  }
};

// 11. Lấy outfits chứa item cụ thể
export const getOutfitsByItem = async (itemId) => {
  try {
    const response = await axios.get(`${API_URL}/item/${itemId}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi lấy outfits chứa item:", error);
    throw error;
  }
};

// 12. Lấy thống kê outfits của user
export const getOutfitStats = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/stats/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi lấy thống kê outfit:", error);
    throw error;
  }
};

// ========================================
// OUTFIT ITEMS MANAGEMENT
// ========================================

// 13. Lấy items của outfit
export const getOutfitItems = async (outfitId) => {
  try {
    const response = await axios.get(`${OUTFIT_ITEMS_URL}/outfit/${outfitId}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi lấy outfit items:", error);
    throw error;
  }
};

// 14. Thêm item vào outfit
export const addItemToOutfit = async (outfitId, itemData) => {
  try {
    const response = await axios.post(`${OUTFIT_ITEMS_URL}/outfit/${outfitId}`, itemData);
    return response.data;
  } catch (error) {
    console.error("Lỗi thêm item vào outfit:", error);
    throw error;
  }
};

// 15. Thêm nhiều items vào outfit
export const bulkAddItems = async (outfitId, items) => {
  try {
    const response = await axios.post(`${OUTFIT_ITEMS_URL}/outfit/${outfitId}/bulk`, { items });
    return response.data;
  } catch (error) {
    console.error("Lỗi bulk add items:", error);
    throw error;
  }
};

// 16. Xóa item khỏi outfit
export const removeItemFromOutfit = async (outfitId, itemId) => {
  try {
    const response = await axios.delete(`${OUTFIT_ITEMS_URL}/outfit/${outfitId}/item/${itemId}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi xóa item khỏi outfit:", error);
    throw error;
  }
};

// 17. Cập nhật outfit item
export const updateOutfitItem = async (id, itemData) => {
  try {
    const response = await axios.put(`${OUTFIT_ITEMS_URL}/${id}`, itemData);
    return response.data;
  } catch (error) {
    console.error("Lỗi cập nhật outfit item:", error);
    throw error;
  }
};

// 18. Sắp xếp lại items
export const reorderOutfitItems = async (outfitId, items) => {
  try {
    const response = await axios.put(`${OUTFIT_ITEMS_URL}/outfit/${outfitId}/reorder`, { items });
    return response.data;
  } catch (error) {
    console.error("Lỗi sắp xếp lại items:", error);
    throw error;
  }
};

// 19. Toggle optional status
export const toggleOptional = async (id) => {
  try {
    const response = await axios.post(`${OUTFIT_ITEMS_URL}/${id}/toggle-optional`);
    return response.data;
  } catch (error) {
    console.error("Lỗi toggle optional:", error);
    throw error;
  }
};

// ========================================
// HELPER FUNCTIONS
// ========================================

// 20. Group items theo category value (vị trí)
export const groupItemsByPosition = (items) => {
  const grouped = {
    top: [],
    bottom: [],
    shoes: [],
    outerwear: [],
    accessories: [],
    headwear: [],
    bags: [],
    other: [],
  };

  items.forEach((outfitItem) => {
    const categoryValue = outfitItem.item_id?.category_id?.value;
    
    if (categoryValue && grouped[categoryValue]) {
      grouped[categoryValue].push(outfitItem);
    } else {
      grouped.other.push(outfitItem);
    }
  });

  return grouped;
};

// 21. Validate outfit data trước khi submit
export const validateOutfitData = (outfitData) => {
  const errors = {};

  // Validate outfit name
  if (!outfitData.outfit_name || outfitData.outfit_name.trim().length < 2) {
    errors.outfit_name = "Tên outfit phải có ít nhất 2 ký tự";
  }

  if (outfitData.outfit_name && outfitData.outfit_name.length > 150) {
    errors.outfit_name = "Tên outfit không được quá 150 ký tự";
  }

  // Validate items
  if (!outfitData.items || outfitData.items.length < 2) {
    errors.items = "Outfit phải có ít nhất 2 items";
  }

  if (outfitData.items && outfitData.items.length > 15) {
    errors.items = "Outfit không được vượt quá 15 items";
  }

  // Validate description
  if (outfitData.description && outfitData.description.length > 1000) {
    errors.description = "Mô tả không được quá 1000 ký tự";
  }

  // Validate notes
  if (outfitData.notes && outfitData.notes.length > 1000) {
    errors.notes = "Ghi chú không được quá 1000 ký tự";
  }

  // Validate tags
  if (outfitData.tags && outfitData.tags.length > 20) {
    errors.tags = "Không được thêm quá 20 tags";
  }

  // Validate rating
  if (outfitData.user_rating && (outfitData.user_rating < 1 || outfitData.user_rating > 5)) {
    errors.user_rating = "Rating phải từ 1-5";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// 22. Format outfit data để hiển thị
export const formatOutfitForDisplay = (outfit) => {
  return {
    ...outfit,
    created_date_formatted: new Date(outfit.created_date).toLocaleDateString("vi-VN"),
    last_worn_formatted: outfit.last_worn_date 
      ? new Date(outfit.last_worn_date).toLocaleDateString("vi-VN")
      : "Chưa mặc",
    style_name: outfit.style_id?.name || "Không xác định",
    occasion_name: outfit.occasion_id?.name || "Không xác định",
    season_name: outfit.season_id?.name || "Không xác định",
    weather_name: outfit.weather_id?.name || "Không xác định",
  };
};

// 23. Get position label từ category value
export const getPositionLabel = (value) => {
  const labels = {
    top: "Áo trên",
    bottom: "Quần/Váy dưới",
    shoes: "Giày dép",
    outerwear: "Áo khoác ngoài",
    accessories: "Phụ kiện",
    headwear: "Mũ/Nón",
    bags: "Túi xách",
  };

  return labels[value] || "Khác";
};

// 24. Sort outfits by criteria
export const sortOutfits = (outfits, sortBy = "newest") => {
  const sorted = [...outfits];

  switch (sortBy) {
    case "newest":
      return sorted.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    
    case "oldest":
      return sorted.sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
    
    case "popular":
      return sorted.sort((a, b) => {
        const scoreA = (a.view_count || 0) + (a.like_count || 0) * 2;
        const scoreB = (b.view_count || 0) + (b.like_count || 0) * 2;
        return scoreB - scoreA;
      });
    
    case "rating":
      return sorted.sort((a, b) => (b.user_rating || 0) - (a.user_rating || 0));
    
    case "most_worn":
      return sorted.sort((a, b) => (b.wear_count || 0) - (a.wear_count || 0));
    
    case "recent_worn":
      return sorted.sort((a, b) => {
        if (!a.last_worn_date) return 1;
        if (!b.last_worn_date) return -1;
        return new Date(b.last_worn_date) - new Date(a.last_worn_date);
      });
    
    default:
      return sorted;
  }
};

// 25. Calculate outfit completeness score
export const calculateOutfitScore = (outfit) => {
  let score = 0;
  const maxScore = 100;

  // Basic info (20 points)
  if (outfit.outfit_name) score += 10;
  if (outfit.description) score += 10;

  // Settings (20 points)
  if (outfit.style_id) score += 5;
  if (outfit.occasion_id) score += 5;
  if (outfit.season_id) score += 5;
  if (outfit.weather_id) score += 5;

  // Images (20 points)
  if (outfit.thumbnail_url) score += 10;
  if (outfit.full_image_url) score += 10;

  // Items (20 points)
  if (outfit.items && outfit.items.length >= 2) {
    score += Math.min(outfit.items.length * 2, 20);
  }

  // Tags (10 points)
  if (outfit.tags && outfit.tags.length > 0) {
    score += Math.min(outfit.tags.length * 2, 10);
  }

  // User rating (10 points)
  if (outfit.user_rating) {
    score += (outfit.user_rating / 5) * 10;
  }

  return Math.min(Math.round(score), maxScore);
};