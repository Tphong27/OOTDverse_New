// frontend/src/services/marketplaceService.js
import api from "./api";

const BASE_URL = "/marketplace/listings";

// ========================================
// 1. GET ALL LISTINGS (Public)
// ========================================
export const getListings = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    // Add filters to query params
    if (filters.listing_type) params.append("listing_type", filters.listing_type);
    if (filters.condition) params.append("condition", filters.condition);
    if (filters.status) params.append("status", filters.status);
    if (filters.category_id) params.append("category_id", filters.category_id);
    if (filters.brand_id) params.append("brand_id", filters.brand_id);
    if (filters.color_id) params.append("color_id", filters.color_id);
    if (filters.min_price) params.append("min_price", filters.min_price);
    if (filters.max_price) params.append("max_price", filters.max_price);
    if (filters.seller_id) params.append("seller_id", filters.seller_id);
    if (filters.is_featured !== undefined) params.append("is_featured", filters.is_featured);
    if (filters.search) params.append("search", filters.search);
    if (filters.sort_by) params.append("sort_by", filters.sort_by);
    if (filters.page) params.append("page", filters.page);
    if (filters.limit) params.append("limit", filters.limit);
    
    const response = await api.get(`${BASE_URL}?${params.toString()}`);
    return response;
  } catch (error) {
    console.error("Error fetching listings:", error);
    throw error;
  }
};

// ========================================
// 2. GET LISTING BY ID (Public)
// ========================================
export const getListingById = async (id, incrementView = false) => {
  try {
    const params = incrementView ? "?increment_view=true" : "";
    const response = await api.get(`${BASE_URL}/${id}${params}`);
    return response;
  } catch (error) {
    console.error("Error fetching listing:", error);
    throw error;
  }
};

// ========================================
// 3. SEARCH LISTINGS (Public)
// ========================================
export const searchListings = async (searchParams = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (searchParams.q) params.append("q", searchParams.q);
    if (searchParams.category) params.append("category", searchParams.category);
    if (searchParams.brand) params.append("brand", searchParams.brand);
    if (searchParams.min_price) params.append("min_price", searchParams.min_price);
    if (searchParams.max_price) params.append("max_price", searchParams.max_price);
    if (searchParams.condition) params.append("condition", searchParams.condition);
    if (searchParams.page) params.append("page", searchParams.page);
    if (searchParams.limit) params.append("limit", searchParams.limit);
    
    const response = await api.get(`${BASE_URL}/search?${params.toString()}`);
    return response;
  } catch (error) {
    console.error("Error searching listings:", error);
    throw error;
  }
};

// ========================================
// 4. GET MARKETPLACE STATS (Public)
// ========================================
export const getMarketplaceStats = async () => {
  try {
    const response = await api.get(`${BASE_URL}/stats`);
    return response;
  } catch (error) {
    console.error("Error fetching marketplace stats:", error);
    throw error;
  }
};

// ========================================
// 5. GET USER'S LISTINGS (Public)
// ========================================
export const getUserListings = async (userId, filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.status) params.append("status", filters.status);
    if (filters.listing_type) params.append("listing_type", filters.listing_type);
    if (filters.page) params.append("page", filters.page);
    if (filters.limit) params.append("limit", filters.limit);
    
    const response = await api.get(`${BASE_URL}/user/${userId}?${params.toString()}`);
    return response;
  } catch (error) {
    console.error("Error fetching user listings:", error);
    throw error;
  }
};

// ========================================
// 6. CREATE LISTING (Protected)
// ========================================
export const createListing = async (listingData) => {
  try {
    const response = await api.post(BASE_URL, listingData);
    return response;
  } catch (error) {
    console.error("Error creating listing:", error);
    throw error;
  }
};

// ========================================
// 7. UPDATE LISTING (Protected)
// ========================================
export const updateListing = async (id, listingData) => {
  try {
    const response = await api.put(`${BASE_URL}/${id}`, listingData);
    return response;
  } catch (error) {
    console.error("Error updating listing:", error);
    throw error;
  }
};

// ========================================
// 8. DELETE LISTING (Protected)
// ========================================
export const deleteListing = async (id) => {
  try {
    const response = await api.delete(`${BASE_URL}/${id}`);
    return response;
  } catch (error) {
    console.error("Error deleting listing:", error);
    throw error;
  }
};

// ========================================
// 9. TOGGLE FAVORITE (Protected)
// ========================================
export const toggleFavorite = async (id, increment = true) => {
  try {
    const response = await api.post(`${BASE_URL}/${id}/favorite`, { increment });
    return response;
  } catch (error) {
    console.error("Error toggling favorite:", error);
    throw error;
  }
};

// ========================================
// 10. BOOST LISTING (Protected)
// ========================================
export const boostListing = async (id) => {
  try {
    const response = await api.post(`${BASE_URL}/${id}/boost`);
    return response;
  } catch (error) {
    console.error("Error boosting listing:", error);
    throw error;
  }
};