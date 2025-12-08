import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import {
  getOutfits,
  getOutfitById,
  createOutfit,
  updateOutfit,
  deleteOutfit,
  toggleLike,
  toggleSave,
  recordWear,
  updateRating,
  getUserOutfits,
  getOutfitsByItem,
  getOutfitStats,
  addItemToOutfit,
  removeItemFromOutfit,
  updateOutfitItem,
  reorderOutfitItems,
  bulkAddItems,
  toggleOptional,
  groupItemsByPosition,
  validateOutfitData,
  sortOutfits,
  calculateOutfitScore,
} from "../services/outfitService";
import { useAuth } from "./AuthContext";

const OutfitContext = createContext();

export const useOutfit = () => {
  const context = useContext(OutfitContext);
  if (!context) {
    throw new Error("useOutfit must be used within OutfitProvider");
  }
  return context;
};

export const OutfitProvider = ({ children }) => {
  const { user } = useAuth();
  
  // ========================================
  // STATE MANAGEMENT
  // ========================================
  const [outfits, setOutfits] = useState([]);
  const [currentOutfit, setCurrentOutfit] = useState(null);
  const [userOutfits, setUserOutfits] = useState([]);
  const [outfitStats, setOutfitStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    style_id: null,
    occasion_id: null,
    season_id: null,
    weather_id: null,
    is_public: true,
    sort_by: "newest",
    page: 1,
    limit: 20,
  });

  // ========================================
  // OUTFIT CRUD OPERATIONS
  // ========================================

  // Lấy danh sách outfits với filters
  const fetchOutfits = useCallback(async (customFilters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const mergedFilters = { ...filters, ...customFilters };
      const response = await getOutfits(mergedFilters);
      
      if (response.success) {
        setOutfits(response.data);
        return response;
      }
    } catch (err) {
      setError(err.message || "Lỗi khi tải outfits");
      console.error("Fetch outfits error:", err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Lấy chi tiết outfit
  const fetchOutfitById = useCallback(async (id, incrementView = false) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getOutfitById(id, incrementView);
      
      if (response.success) {
        setCurrentOutfit(response.data);
        return response.data;
      }
    } catch (err) {
      setError(err.message || "Lỗi khi tải outfit");
      console.error("Fetch outfit error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Tạo outfit mới
  const handleCreateOutfit = useCallback(async (outfitData) => {
    setLoading(true);
    setError(null);
    try {
      // Validate data trước khi submit
      const validation = validateOutfitData(outfitData);
      if (!validation.isValid) {
        setError(validation.errors);
        return { success: false, errors: validation.errors };
      }

      const response = await createOutfit(outfitData);
      
      if (response.success) {
        // Thêm outfit mới vào danh sách
        setOutfits((prev) => [response.data, ...prev]);
        
        // Nếu là outfit của user hiện tại, thêm vào userOutfits
        if (user && outfitData.user_id === user._id) {
          setUserOutfits((prev) => [response.data, ...prev]);
        }
        
        return response;
      }
    } catch (err) {
      setError(err.message || "Lỗi khi tạo outfit");
      console.error("Create outfit error:", err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Cập nhật outfit
  const handleUpdateOutfit = useCallback(async (id, outfitData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await updateOutfit(id, outfitData);
      
      if (response.success) {
        // Update trong danh sách outfits
        setOutfits((prev) =>
          prev.map((outfit) => (outfit._id === id ? response.data : outfit))
        );
        
        // Update userOutfits nếu có
        setUserOutfits((prev) =>
          prev.map((outfit) => (outfit._id === id ? response.data : outfit))
        );
        
        // Update currentOutfit nếu đang xem outfit này
        if (currentOutfit?._id === id) {
          setCurrentOutfit(response.data);
        }
        
        return response;
      }
    } catch (err) {
      setError(err.message || "Lỗi khi cập nhật outfit");
      console.error("Update outfit error:", err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [currentOutfit]);

  // Xóa outfit
  const handleDeleteOutfit = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await deleteOutfit(id);
      
      if (response.success) {
        // Xóa khỏi danh sách
        setOutfits((prev) => prev.filter((outfit) => outfit._id !== id));
        setUserOutfits((prev) => prev.filter((outfit) => outfit._id !== id));
        
        // Clear currentOutfit nếu đang xem outfit bị xóa
        if (currentOutfit?._id === id) {
          setCurrentOutfit(null);
        }
        
        return response;
      }
    } catch (err) {
      setError(err.message || "Lỗi khi xóa outfit");
      console.error("Delete outfit error:", err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [currentOutfit]);

  // ========================================
  // OUTFIT INTERACTIONS
  // ========================================

  const handleToggleLike = useCallback(async (id, increment = true) => {
    try {
      const response = await toggleLike(id, increment);
      
      if (response.success) {
        // Update like count trong state
        const updateLikeCount = (outfit) => {
          if (outfit._id === id) {
            return { ...outfit, like_count: response.data.like_count };
          }
          return outfit;
        };
        
        setOutfits((prev) => prev.map(updateLikeCount));
        setUserOutfits((prev) => prev.map(updateLikeCount));
        
        if (currentOutfit?._id === id) {
          setCurrentOutfit((prev) => ({ ...prev, like_count: response.data.like_count }));
        }
        
        return response;
      }
    } catch (err) {
      console.error("Toggle like error:", err);
    }
  }, [currentOutfit]);

  const handleToggleSave = useCallback(async (id, increment = true) => {
    try {
      const response = await toggleSave(id, increment);
      
      if (response.success) {
        const updateSaveCount = (outfit) => {
          if (outfit._id === id) {
            return { ...outfit, save_count: response.data.save_count };
          }
          return outfit;
        };
        
        setOutfits((prev) => prev.map(updateSaveCount));
        setUserOutfits((prev) => prev.map(updateSaveCount));
        
        if (currentOutfit?._id === id) {
          setCurrentOutfit((prev) => ({ ...prev, save_count: response.data.save_count }));
        }
        
        return response;
      }
    } catch (err) {
      console.error("Toggle save error:", err);
    }
  }, [currentOutfit]);

  const handleRecordWear = useCallback(async (id) => {
    try {
      const response = await recordWear(id);
      
      if (response.success) {
        const updateWearData = (outfit) => {
          if (outfit._id === id) {
            return {
              ...outfit,
              wear_count: response.data.wear_count,
              last_worn_date: response.data.last_worn_date,
            };
          }
          return outfit;
        };
        
        setOutfits((prev) => prev.map(updateWearData));
        setUserOutfits((prev) => prev.map(updateWearData));
        
        if (currentOutfit?._id === id) {
          setCurrentOutfit((prev) => ({
            ...prev,
            wear_count: response.data.wear_count,
            last_worn_date: response.data.last_worn_date,
          }));
        }
        
        return response;
      }
    } catch (err) {
      console.error("Record wear error:", err);
    }
  }, [currentOutfit]);

  const handleUpdateRating = useCallback(async (id, rating) => {
    try {
      const response = await updateRating(id, rating);
      
      if (response.success) {
        const updateRatingData = (outfit) => {
          if (outfit._id === id) {
            return { ...outfit, user_rating: response.data.user_rating };
          }
          return outfit;
        };
        
        setOutfits((prev) => prev.map(updateRatingData));
        setUserOutfits((prev) => prev.map(updateRatingData));
        
        if (currentOutfit?._id === id) {
          setCurrentOutfit((prev) => ({ ...prev, user_rating: response.data.user_rating }));
        }
        
        return response;
      }
    } catch (err) {
      console.error("Update rating error:", err);
    }
  }, [currentOutfit]);

  // ========================================
  // USER OUTFITS & STATS
  // ========================================

  const fetchUserOutfits = useCallback(async (userId, customFilters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getUserOutfits(userId, customFilters);
      
      if (response.success) {
        setUserOutfits(response.data);
        return response;
      }
    } catch (err) {
      setError(err.message || "Lỗi khi tải outfits của user");
      console.error("Fetch user outfits error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUserOutfitStats = useCallback(async (userId) => {
    try {
      const response = await getOutfitStats(userId);
      
      if (response.success) {
        setOutfitStats(response.data);
        return response.data;
      }
    } catch (err) {
      console.error("Fetch stats error:", err);
    }
  }, []);

  // ========================================
  // OUTFIT ITEMS MANAGEMENT
  // ========================================

  const handleAddItemToOutfit = useCallback(async (outfitId, itemData) => {
    try {
      const response = await addItemToOutfit(outfitId, itemData);
      
      if (response.success && currentOutfit?._id === outfitId) {
        // Thêm item vào currentOutfit
        setCurrentOutfit((prev) => ({
          ...prev,
          items: [...(prev.items || []), response.data],
        }));
      }
      
      return response;
    } catch (err) {
      console.error("Add item to outfit error:", err);
      return { success: false, error: err.message };
    }
  }, [currentOutfit]);

  const handleRemoveItemFromOutfit = useCallback(async (outfitId, itemId) => {
    try {
      const response = await removeItemFromOutfit(outfitId, itemId);
      
      if (response.success && currentOutfit?._id === outfitId) {
        // Xóa item khỏi currentOutfit
        setCurrentOutfit((prev) => ({
          ...prev,
          items: prev.items.filter((item) => item.item_id._id !== itemId),
        }));
      }
      
      return response;
    } catch (err) {
      console.error("Remove item from outfit error:", err);
      return { success: false, error: err.message };
    }
  }, [currentOutfit]);

  const handleUpdateOutfitItem = useCallback(async (id, itemData) => {
    try {
      const response = await updateOutfitItem(id, itemData);
      
      if (response.success && currentOutfit) {
        // Update item trong currentOutfit
        setCurrentOutfit((prev) => ({
          ...prev,
          items: prev.items.map((item) => (item._id === id ? response.data : item)),
        }));
      }
      
      return response;
    } catch (err) {
      console.error("Update outfit item error:", err);
      return { success: false, error: err.message };
    }
  }, [currentOutfit]);

  const handleReorderItems = useCallback(async (outfitId, items) => {
    try {
      const response = await reorderOutfitItems(outfitId, items);
      
      if (response.success && currentOutfit?._id === outfitId) {
        setCurrentOutfit((prev) => ({
          ...prev,
          items: response.data,
        }));
      }
      
      return response;
    } catch (err) {
      console.error("Reorder items error:", err);
      return { success: false, error: err.message };
    }
  }, [currentOutfit]);

  const handleBulkAddItems = useCallback(async (outfitId, items) => {
    try {
      const response = await bulkAddItems(outfitId, items);
      
      if (response.success && currentOutfit?._id === outfitId) {
        setCurrentOutfit((prev) => ({
          ...prev,
          items: [...(prev.items || []), ...response.data],
        }));
      }
      
      return response;
    } catch (err) {
      console.error("Bulk add items error:", err);
      return { success: false, error: err.message };
    }
  }, [currentOutfit]);

  // ========================================
  // HELPER FUNCTIONS
  // ========================================

  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      style_id: null,
      occasion_id: null,
      season_id: null,
      weather_id: null,
      is_public: true,
      sort_by: "newest",
      page: 1,
      limit: 20,
    });
  }, []);

  const sortOutfitsLocal = useCallback((sortBy) => {
    setOutfits((prev) => sortOutfits(prev, sortBy));
    setUserOutfits((prev) => sortOutfits(prev, sortBy));
  }, []);

  const groupCurrentOutfitItems = useCallback(() => {
    if (!currentOutfit?.items) return {};
    return groupItemsByPosition(currentOutfit.items);
  }, [currentOutfit]);

  const getOutfitScore = useCallback((outfit) => {
    return calculateOutfitScore(outfit);
  }, []);

  // ========================================
  // CONTEXT VALUE
  // ========================================

  const value = {
    // State
    outfits,
    currentOutfit,
    userOutfits,
    outfitStats,
    loading,
    error,
    filters,

    // CRUD Operations
    fetchOutfits,
    fetchOutfitById,
    createOutfit: handleCreateOutfit,
    updateOutfit: handleUpdateOutfit,
    deleteOutfit: handleDeleteOutfit,

    // Interactions
    toggleLike: handleToggleLike,
    toggleSave: handleToggleSave,
    recordWear: handleRecordWear,
    updateRating: handleUpdateRating,

    // User Outfits
    fetchUserOutfits,
    fetchUserOutfitStats,

    // Outfit Items
    addItemToOutfit: handleAddItemToOutfit,
    removeItemFromOutfit: handleRemoveItemFromOutfit,
    updateOutfitItem: handleUpdateOutfitItem,
    reorderItems: handleReorderItems,
    bulkAddItems: handleBulkAddItems,

    // Helpers
    updateFilters,
    clearFilters,
    sortOutfits: sortOutfitsLocal,
    groupCurrentOutfitItems,
    getOutfitScore,
    setCurrentOutfit,
    setError,
  };

  return <OutfitContext.Provider value={value}>{children}</OutfitContext.Provider>;
};