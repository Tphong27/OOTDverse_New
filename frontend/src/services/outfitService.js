// frontend/src/services/outfitService.js
import axios from "axios";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/outfits`;
const OUTFIT_ITEMS_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/outfit-items`;

// ========================================
// OUTFIT CRUD OPERATIONS
// ========================================

export const getOutfits = async (filters = {}) => {
  try {
    const response = await axios.get(API_URL, { params: filters });
    return response.data;
  } catch (error) {
    console.error("Error fetching outfits:", error);
    throw error.response?.data || error;
  }
};

export const getOutfitById = async (id, incrementView = false) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`, {
      params: { increment_view: incrementView }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching outfit:", error);
    throw error.response?.data || error;
  }
};

export const createOutfit = async (outfitData) => {
  try {
    const response = await axios.post(API_URL, outfitData);
    return response.data;
  } catch (error) {
    console.error("Error creating outfit:", error);
    throw error.response?.data || error;
  }
};

export const updateOutfit = async (id, outfitData) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, outfitData);
    return response.data;
  } catch (error) {
    console.error("Error updating outfit:", error);
    throw error.response?.data || error;
  }
};

export const deleteOutfit = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting outfit:", error);
    throw error.response?.data || error;
  }
};

// ========================================
// OUTFIT INTERACTIONS
// ========================================

export const toggleLike = async (id, increment = true) => {
  try {
    const response = await axios.post(`${API_URL}/${id}/like`, { increment });
    return response.data;
  } catch (error) {
    console.error("Error toggling like:", error);
    throw error.response?.data || error;
  }
};

export const toggleSave = async (id, increment = true) => {
  try {
    const response = await axios.post(`${API_URL}/${id}/save`, { increment });
    return response.data;
  } catch (error) {
    console.error("Error toggling save:", error);
    throw error.response?.data || error;
  }
};

export const recordWear = async (id) => {
  try {
    const response = await axios.post(`${API_URL}/${id}/wear`);
    return response.data;
  } catch (error) {
    console.error("Error recording wear:", error);
    throw error.response?.data || error;
  }
};

export const updateRating = async (id, rating) => {
  try {
    const response = await axios.post(`${API_URL}/${id}/rating`, { rating });
    return response.data;
  } catch (error) {
    console.error("Error updating rating:", error);
    throw error.response?.data || error;
  }
};

// ========================================
// USER OUTFITS & STATS
// ========================================

export const getUserOutfits = async (userId, filters = {}) => {
  try {
    const response = await axios.get(`${API_URL}/user/${userId}`, { params: filters });
    return response.data;
  } catch (error) {
    console.error("Error fetching user outfits:", error);
    throw error.response?.data || error;
  }
};

export const getOutfitsByItem = async (itemId) => {
  try {
    const response = await axios.get(`${API_URL}/item/${itemId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching outfits by item:", error);
    throw error.response?.data || error;
  }
};

export const getOutfitStats = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/stats/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching outfit stats:", error);
    throw error.response?.data || error;
  }
};

export const aiSuggest = async (suggestionData) => {
  try {
    const response = await axios.post(`${API_URL}/ai-suggest`, suggestionData);
    return response.data;
  } catch (error) {
    console.error("Error getting AI suggestions:", error);
    throw error.response?.data || error;
  }
};

// ========================================
// OUTFIT ITEMS MANAGEMENT
// ========================================

export const getOutfitItems = async (outfitId) => {
  try {
    const response = await axios.get(`${OUTFIT_ITEMS_URL}/outfit/${outfitId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching outfit items:", error);
    throw error.response?.data || error;
  }
};

export const addItemToOutfit = async (outfitId, itemData) => {
  try {
    const response = await axios.post(`${OUTFIT_ITEMS_URL}/outfit/${outfitId}`, itemData);
    return response.data;
  } catch (error) {
    console.error("Error adding item to outfit:", error);
    throw error.response?.data || error;
  }
};

export const removeItemFromOutfit = async (outfitId, itemId) => {
  try {
    const response = await axios.delete(`${OUTFIT_ITEMS_URL}/outfit/${outfitId}/item/${itemId}`);
    return response.data;
  } catch (error) {
    console.error("Error removing item from outfit:", error);
    throw error.response?.data || error;
  }
};

export const updateOutfitItem = async (id, itemData) => {
  try {
    const response = await axios.put(`${OUTFIT_ITEMS_URL}/${id}`, itemData);
    return response.data;
  } catch (error) {
    console.error("Error updating outfit item:", error);
    throw error.response?.data || error;
  }
};

export const reorderOutfitItems = async (outfitId, items) => {
  try {
    const response = await axios.put(`${OUTFIT_ITEMS_URL}/outfit/${outfitId}/reorder`, { items });
    return response.data;
  } catch (error) {
    console.error("Error reordering items:", error);
    throw error.response?.data || error;
  }
};

export const bulkAddItems = async (outfitId, items) => {
  try {
    const response = await axios.post(`${OUTFIT_ITEMS_URL}/outfit/${outfitId}/bulk`, { items });
    return response.data;
  } catch (error) {
    console.error("Error bulk adding items:", error);
    throw error.response?.data || error;
  }
};

export const toggleOptional = async (id) => {
  try {
    const response = await axios.post(`${OUTFIT_ITEMS_URL}/${id}/toggle-optional`);
    return response.data;
  } catch (error) {
    console.error("Error toggling optional:", error);
    throw error.response?.data || error;
  }
};

// ========================================
// HELPER FUNCTIONS
// ========================================

// Group items theo body position
export const groupItemsByPosition = (items) => {
  const grouped = {
    head: [],
    top: [],
    bottom: [],
    footwear: [],
    accessories: [],
    other: []
  };

  items.forEach(item => {
    const category = item.item_id?.category_id;
    if (!category) {
      grouped.other.push(item);
      return;
    }

    const categoryName = category.name?.toLowerCase() || '';
    
    if (categoryName.includes('mũ') || categoryName.includes('nón')) {
      grouped.head.push(item);
    } else if (categoryName.includes('áo') || categoryName.includes('jacket')) {
      grouped.top.push(item);
    } else if (categoryName.includes('quần') || categoryName.includes('váy')) {
      grouped.bottom.push(item);
    } else if (categoryName.includes('giày') || categoryName.includes('dép')) {
      grouped.footwear.push(item);
    } else if (categoryName.includes('phụ kiện') || categoryName.includes('túi') || categoryName.includes('kính')) {
      grouped.accessories.push(item);
    } else {
      grouped.other.push(item);
    }
  });

  return grouped;
};

// Validate outfit data trước khi submit
export const validateOutfitData = (data) => {
  const errors = [];

  if (!data.outfit_name || data.outfit_name.trim().length < 2) {
    errors.push("Tên outfit phải có ít nhất 2 ký tự");
  }

  if (!data.items || data.items.length < 2) {
    errors.push("Outfit phải có ít nhất 2 items");
  }

  if (data.items && data.items.length > 15) {
    errors.push("Outfit không được vượt quá 15 items");
  }

  if (data.user_rating && (data.user_rating < 1 || data.user_rating > 5)) {
    errors.push("Rating phải từ 1-5");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Sort outfits
export const sortOutfits = (outfits, sortBy) => {
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
    
    default:
      return sorted;
  }
};

// Calculate outfit score (for recommendations)
export const calculateOutfitScore = (outfit) => {
  let score = 0;

  // View score
  score += (outfit.view_count || 0) * 0.5;

  // Like score
  score += (outfit.like_count || 0) * 2;

  // Save score
  score += (outfit.save_count || 0) * 3;

  // Rating score
  score += (outfit.user_rating || 0) * 10;

  // Wear score
  score += (outfit.wear_count || 0) * 1.5;

  // AI confidence score
  if (outfit.ai_suggested && outfit.ai_confidence_score) {
    score += outfit.ai_confidence_score * 20;
  }

  return Math.round(score);
};