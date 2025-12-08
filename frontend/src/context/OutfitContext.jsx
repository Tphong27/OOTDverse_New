// frontend/src/context/OutfitContext.js
"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext"; // Import AuthContext để lấy user
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
  getOutfitItems,
  addItemToOutfit,
  bulkAddItems,
  removeItemFromOutfit,
  updateOutfitItem,
  reorderOutfitItems,
  toggleOptional,
  validateOutfitData,
  formatOutfitForDisplay,
  groupItemsByPosition,
  getPositionLabel,
  sortOutfits,
  calculateOutfitScore,
} from "@/services/outfitService"; // Import tất cả services từ outfitService.js

const OutfitContext = createContext();

export function OutfitProvider({ children }) {
  const { user } = useAuth(); // Lấy user từ AuthContext
  const [outfits, setOutfits] = useState([]); // Danh sách outfits
  const [currentOutfit, setCurrentOutfit] = useState(null); // Outfit đang xem/ chỉnh sửa
  const [outfitItems, setOutfitItems] = useState([]); // Items của currentOutfit
  const [stats, setStats] = useState(null); // Thống kê outfits
  const [loading, setLoading] = useState(false); // Trạng thái loading chung
  const [error, setError] = useState(null); // Lỗi chung

  // Load outfits của user khi mount (nếu có user)
  useEffect(() => {
    if (user?._id) {
      fetchUserOutfits();
      fetchOutfitStats();
    }
  }, [user]);

  // 1. Lấy outfits của user
  const fetchUserOutfits = async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getUserOutfits(user._id, filters);
      if (response.success) {
        // Format và sort outfits
        const formattedOutfits = response.data.data.map(formatOutfitForDisplay);
        const sortedOutfits = sortOutfits(formattedOutfits, filters.sort_by || "newest");
        setOutfits(sortedOutfits);
      } else {
        throw new Error(response.error || "Lỗi lấy outfits");
      }
    } catch (err) {
      setError(err.message);
      console.error("Lỗi fetch user outfits:", err);
    } finally {
      setLoading(false);
    }
  };

  // 2. Lấy chi tiết 1 outfit
  const fetchOutfitById = async (id, incrementView = true) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getOutfitById(id, incrementView);
      if (response.success) {
        const formattedOutfit = formatOutfitForDisplay(response.data.data);
        formattedOutfit.score = calculateOutfitScore(formattedOutfit);
        formattedOutfit.groupedItems = groupItemsByPosition(formattedOutfit.items || []);
        setCurrentOutfit(formattedOutfit);
      } else {
        throw new Error(response.error || "Lỗi lấy outfit");
      }
    } catch (err) {
      setError(err.message);
      console.error("Lỗi fetch outfit:", err);
    } finally {
      setLoading(false);
    }
  };

  // 3. Lấy items của outfit (nếu cần riêng)
  const fetchOutfitItems = async (outfitId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getOutfitItems(outfitId);
      if (response.success) {
        setOutfitItems(response.data.data);
        return response.data.data;
      } else {
        throw new Error(response.error || "Lỗi lấy items");
      }
    } catch (err) {
      setError(err.message);
      console.error("Lỗi fetch outfit items:", err);
    } finally {
      setLoading(false);
    }
  };

  // 4. Tạo outfit mới
  const handleCreateOutfit = async (outfitData) => {
    setLoading(true);
    setError(null);
    try {
      // Validate trước khi gửi
      const validation = validateOutfitData(outfitData);
      if (!validation.isValid) {
        throw new Error(Object.values(validation.errors)[0]);
      }

      const response = await createOutfit({
        ...outfitData,
        user_id: user._id,
      });
      if (response.success) {
        await fetchUserOutfits(); // Refresh list
        return response.data.data;
      } else {
        throw new Error(response.error || "Lỗi tạo outfit");
      }
    } catch (err) {
      setError(err.message);
      console.error("Lỗi create outfit:", err);
    } finally {
      setLoading(false);
    }
  };

  // 5. Cập nhật outfit
  const handleUpdateOutfit = async (id, outfitData) => {
    setLoading(true);
    setError(null);
    try {
      // Validate (tùy chọn items)
      if (outfitData.items) {
        const validation = validateOutfitData(outfitData);
        if (!validation.isValid) {
          throw new Error(Object.values(validation.errors)[0]);
        }
      }

      const response = await updateOutfit(id, outfitData);
      if (response.success) {
        await fetchUserOutfits(); // Refresh list
        if (currentOutfit?._id === id) {
          await fetchOutfitById(id, false); // Refresh current
        }
        return response.data.data;
      } else {
        throw new Error(response.error || "Lỗi cập nhật outfit");
      }
    } catch (err) {
      setError(err.message);
      console.error("Lỗi update outfit:", err);
    } finally {
      setLoading(false);
    }
  };

  // 6. Xóa outfit
  const handleDeleteOutfit = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await deleteOutfit(id);
      if (response.success) {
        await fetchUserOutfits(); // Refresh list
        if (currentOutfit?._id === id) {
          setCurrentOutfit(null);
        }
        return true;
      } else {
        throw new Error(response.error || "Lỗi xóa outfit");
      }
    } catch (err) {
      setError(err.message);
      console.error("Lỗi delete outfit:", err);
    } finally {
      setLoading(false);
    }
  };

  // 7. Toggle like
  const handleToggleLike = async (id, increment) => {
    try {
      const response = await toggleLike(id, increment);
      if (response.success) {
        // Update local state
        setOutfits((prev) =>
          prev.map((o) => o._id === id ? { ...o, like_count: response.data.data.like_count } : o)
        );
        if (currentOutfit?._id === id) {
          setCurrentOutfit((prev) => ({ ...prev, like_count: response.data.data.like_count }));
        }
      }
    } catch (err) {
      console.error("Lỗi toggle like:", err);
    }
  };

  // 8. Toggle save
  const handleToggleSave = async (id, increment) => {
    try {
      const response = await toggleSave(id, increment);
      if (response.success) {
        // Update local state
        setOutfits((prev) =>
          prev.map((o) => o._id === id ? { ...o, save_count: response.data.data.save_count } : o)
        );
        if (currentOutfit?._id === id) {
          setCurrentOutfit((prev) => ({ ...prev, save_count: response.data.data.save_count }));
        }
      }
    } catch (err) {
      console.error("Lỗi toggle save:", err);
    }
  };

  // 9. Record wear
  const handleRecordWear = async (id) => {
    try {
      const response = await recordWear(id);
      if (response.success) {
        // Update local state
        setOutfits((prev) =>
          prev.map((o) => o._id === id ? { ...o, wear_count: response.data.data.wear_count, last_worn_date: response.data.data.last_worn_date } : o)
        );
        if (currentOutfit?._id === id) {
          setCurrentOutfit((prev) => ({ ...prev, wear_count: response.data.data.wear_count, last_worn_date: response.data.data.last_worn_date }));
        }
      }
    } catch (err) {
      console.error("Lỗi record wear:", err);
    }
  };

  // 10. Update rating
  const handleUpdateRating = async (id, rating) => {
    try {
      const response = await updateRating(id, rating);
      if (response.success) {
        // Update local state
        setOutfits((prev) =>
          prev.map((o) => o._id === id ? { ...o, user_rating: response.data.data.user_rating } : o)
        );
        if (currentOutfit?._id === id) {
          setCurrentOutfit((prev) => ({ ...prev, user_rating: response.data.data.user_rating }));
        }
      }
    } catch (err) {
      console.error("Lỗi update rating:", err);
    }
  };

  // 11. Lấy outfits chứa item
  const fetchOutfitsByItem = async (itemId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getOutfitsByItem(itemId);
      if (response.success) {
        return response.data.data;
      } else {
        throw new Error(response.error || "Lỗi lấy outfits chứa item");
      }
    } catch (err) {
      setError(err.message);
      console.error("Lỗi fetch outfits by item:", err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // 12. Lấy thống kê outfits
  const fetchOutfitStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getOutfitStats(user._id);
      if (response.success) {
        setStats(response.data.data);
      } else {
        throw new Error(response.error || "Lỗi lấy stats");
      }
    } catch (err) {
      setError(err.message);
      console.error("Lỗi fetch stats:", err);
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // OUTFIT ITEMS MANAGEMENT FUNCTIONS
  // ========================================

  // 13. Thêm item vào outfit
  const handleAddItemToOutfit = async (outfitId, itemData) => {
    try {
      const response = await addItemToOutfit(outfitId, itemData);
      if (response.success) {
        // Refresh items nếu đang xem outfit này
        if (currentOutfit?._id === outfitId) {
          await fetchOutfitItems(outfitId);
        }
        return response.data.data;
      }
    } catch (err) {
      console.error("Lỗi add item:", err);
    }
  };

  // 14. Thêm nhiều items
  const handleBulkAddItems = async (outfitId, items) => {
    try {
      const response = await bulkAddItems(outfitId, items);
      if (response.success) {
        // Refresh items
        if (currentOutfit?._id === outfitId) {
          await fetchOutfitItems(outfitId);
        }
        return response.data.data;
      }
    } catch (err) {
      console.error("Lỗi bulk add:", err);
    }
  };

  // 15. Xóa item khỏi outfit
  const handleRemoveItemFromOutfit = async (outfitId, itemId) => {
    try {
      const response = await removeItemFromOutfit(outfitId, itemId);
      if (response.success) {
        // Refresh items
        if (currentOutfit?._id === outfitId) {
          await fetchOutfitItems(outfitId);
        }
        return true;
      }
    } catch (err) {
      console.error("Lỗi remove item:", err);
    }
  };

  // 16. Cập nhật outfit item
  const handleUpdateOutfitItem = async (id, itemData) => {
    try {
      const response = await updateOutfitItem(id, itemData);
      if (response.success) {
        // Refresh items nếu có currentOutfit
        if (currentOutfit) {
          await fetchOutfitItems(currentOutfit._id);
        }
        return response.data.data;
      }
    } catch (err) {
      console.error("Lỗi update item:", err);
    }
  };

  // 17. Sắp xếp lại items
  const handleReorderOutfitItems = async (outfitId, items) => {
    try {
      const response = await reorderOutfitItems(outfitId, items);
      if (response.success) {
        // Refresh items
        if (currentOutfit?._id === outfitId) {
          await fetchOutfitItems(outfitId);
        }
        return response.data.data;
      }
    } catch (err) {
      console.error("Lỗi reorder items:", err);
    }
  };

  // 18. Toggle optional
  const handleToggleOptional = async (id) => {
    try {
      const response = await toggleOptional(id);
      if (response.success) {
        // Refresh items nếu có currentOutfit
        if (currentOutfit) {
          await fetchOutfitItems(currentOutfit._id);
        }
        return response.data.data;
      }
    } catch (err) {
      console.error("Lỗi toggle optional:", err);
    }
  };

  return (
    <OutfitContext.Provider
      value={{
        outfits,
        currentOutfit,
        outfitItems,
        stats,
        loading,
        error,
        fetchUserOutfits,
        fetchOutfitById,
        fetchOutfitItems,
        handleCreateOutfit,
        handleUpdateOutfit,
        handleDeleteOutfit,
        handleToggleLike,
        handleToggleSave,
        handleRecordWear,
        handleUpdateRating,
        fetchOutfitsByItem,
        fetchOutfitStats,
        handleAddItemToOutfit,
        handleBulkAddItems,
        handleRemoveItemFromOutfit,
        handleUpdateOutfitItem,
        handleReorderOutfitItems,
        handleToggleOptional,
        validateOutfitData,
        formatOutfitForDisplay,
        groupItemsByPosition,
        getPositionLabel,
        sortOutfits,
        calculateOutfitScore,
      }}
    >
      {children}
    </OutfitContext.Provider>
  );
}

export function useOutfit() {
  return useContext(OutfitContext);
}