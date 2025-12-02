"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  getWardrobeItems,
  getWardrobeItemById,
  createWardrobeItem,
  updateWardrobeItem,
  deleteWardrobeItem,
  toggleFavoriteItem,
  incrementWearCount,
  getWardrobeStatistics,
  filterWardrobeItems,
} from "@/services/wardrobeService";

import { useAuth } from "@/context/AuthContext";

const WardrobeContext = createContext();

export function WardrobeProvider({ children }) {
  // ===== STATE MANAGEMENT =====
  const { user } = useAuth();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statistics, setStatistics] = useState(null);

  // State cho filters
  const [filters, setFilters] = useState({
    category: "all",
    brand: null,
    color: [],
    season: [],
    favorite: false,
    search: "",
  });

  // ===== LOAD INITIAL DATA =====
  const loadItems = useCallback(async () => {
    // Nếu chưa đăng nhập (user là null), reset dữ liệu
    if (!user) {
      setItems([]);
      setStatistics(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Sử dụng trực tiếp user._id từ AuthContext
      // Không cần đọc lại từ localStorage nữa
      const data = await getWardrobeItems(user._id);

      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading wardrobe:", err);
      setError(err.message || "Lỗi tải dữ liệu");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [user]); // QUAN TRỌNG: Chạy lại khi 'user' thay đổi

  // Load statistics
  const loadStatistics = useCallback(async () => {
    try {
      const stats = await getWardrobeStatistics();
      setStatistics(stats);
    } catch (err) {
      console.error("Error loading statistics:", err);
    }
  }, [user]);

  // ===== INITIAL LOAD =====
  useEffect(() => {
    loadItems();
    loadStatistics();
  }, [loadItems, loadStatistics]);

  // ===== FILTERED ITEMS =====
  const filteredItems = filterWardrobeItems(items, filters);

  // ===== CRUD OPERATIONS =====

  // 1. ADD ITEM
  const addItem = async (itemData) => {
    try {
      setError(null);
      const savedItem = await createWardrobeItem(itemData);

      // Thêm vào đầu danh sách
      setItems((prev) => [savedItem, ...prev]);

      // Reload statistics
      loadStatistics();

      return { success: true, data: savedItem };
    } catch (err) {
      console.error("Error adding item:", err);
      setError(err.message || "Thêm món đồ thất bại");
      return { success: false, error: err.message };
    }
  };

  // 2. UPDATE ITEM
  const updateItem = async (itemId, updateData) => {
    try {
      setError(null);
      const updatedItem = await updateWardrobeItem(itemId, updateData);

      // Cập nhật trong danh sách
      setItems((prev) =>
        prev.map((item) => (item._id === itemId ? updatedItem : item))
      );

      // Reload statistics nếu cần
      loadStatistics();

      return { success: true, data: updatedItem };
    } catch (err) {
      console.error("Error updating item:", err);
      setError(err.message || "Cập nhật thất bại");
      return { success: false, error: err.message };
    }
  };

  // 3. DELETE ITEM
  const deleteItem = async (itemId) => {
    try {
      setError(null);
      await deleteWardrobeItem(itemId);

      // Xóa khỏi danh sách
      setItems((prev) => prev.filter((item) => item._id !== itemId));

      // Reload statistics
      loadStatistics();

      return { success: true };
    } catch (err) {
      console.error("Error deleting item:", err);
      setError(err.message || "Xóa thất bại");
      return { success: false, error: err.message };
    }
  };

  // 4. TOGGLE FAVORITE
  const toggleFavorite = async (itemId) => {
    try {
      setError(null);
      const updatedItem = await toggleFavoriteItem(itemId);

      // Cập nhật UI ngay lập tức
      setItems((prev) =>
        prev.map((item) =>
          item._id === itemId
            ? { ...item, is_favorite: updatedItem.is_favorite }
            : item
        )
      );

      // Reload statistics
      loadStatistics();

      return { success: true, data: updatedItem };
    } catch (err) {
      console.error("Error toggling favorite:", err);
      setError(err.message || "Toggle favorite thất bại");
      return { success: false, error: err.message };
    }
  };

  // 5. INCREMENT WEAR COUNT
  const recordWear = async (itemId) => {
    try {
      setError(null);
      const result = await incrementWearCount(itemId);

      // Cập nhật wear count và last_worn_date
      setItems((prev) =>
        prev.map((item) =>
          item._id === itemId
            ? {
                ...item,
                wear_count: result.wear_count,
                last_worn_date: result.last_worn_date,
              }
            : item
        )
      );

      return { success: true, data: result };
    } catch (err) {
      console.error("Error recording wear:", err);
      setError(err.message || "Cập nhật wear count thất bại");
      return { success: false, error: err.message };
    }
  };

  // 6. GET SINGLE ITEM
  const getItemDetails = async (itemId) => {
    try {
      setError(null);
      const item = await getWardrobeItemById(itemId);
      return { success: true, data: item };
    } catch (err) {
      console.error("Error getting item details:", err);
      setError(err.message || "Lỗi tải chi tiết món đồ");
      return { success: false, error: err.message };
    }
  };

  // ===== FILTER FUNCTIONS =====

  // Update filters
  const updateFilters = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      category: "all",
      brand: null,
      color: [],
      season: [],
      favorite: false,
      search: "",
    });
  };

  // ===== UTILITY FUNCTIONS =====

  // Get items by category
  const getItemsByCategory = (categoryId) => {
    return items.filter(
      (item) =>
        item.category_id?._id === categoryId || item.category_id === categoryId
    );
  };

  // Get favorite items
  const getFavoriteItems = () => {
    return items.filter((item) => item.is_favorite);
  };

  // Get recently added items
  const getRecentItems = (limit = 10) => {
    return [...items]
      .sort((a, b) => new Date(b.added_date) - new Date(a.added_date))
      .slice(0, limit);
  };

  // Get most worn items
  const getMostWornItems = (limit = 10) => {
    return [...items]
      .sort((a, b) => (b.wear_count || 0) - (a.wear_count || 0))
      .slice(0, limit);
  };

  // Search items
  const searchItems = (query) => {
    if (!query) return items;

    const searchLower = query.toLowerCase();
    return items.filter(
      (item) =>
        item.item_name?.toLowerCase().includes(searchLower) ||
        item.brand_id?.name?.toLowerCase().includes(searchLower) ||
        item.notes?.toLowerCase().includes(searchLower) ||
        item.style_tags?.some((tag) => tag.toLowerCase().includes(searchLower))
    );
  };

  // ===== CONTEXT VALUE =====
  const contextValue = {
    // State
    items,
    filteredItems,
    loading,
    error,
    statistics,
    filters,

    // CRUD Operations
    addItem,
    updateItem,
    deleteItem,
    toggleFavorite,
    recordWear,
    getItemDetails,
    loadItems,
    loadStatistics,

    // Filter Operations
    updateFilters,
    resetFilters,

    // Utility Functions
    getItemsByCategory,
    getFavoriteItems,
    getRecentItems,
    getMostWornItems,
    searchItems,

    // Computed Values
    totalItems: items.length,
    favoriteCount: items.filter((i) => i.is_favorite).length,
    totalValue: items.reduce((sum, item) => sum + (item.price || 0), 0),
    categoryCount: new Set(
      items.map((i) => i.category_id?._id || i.category_id)
    ).size,
  };

  return (
    <WardrobeContext.Provider value={contextValue}>
      {children}
    </WardrobeContext.Provider>
  );
}

// ===== CUSTOM HOOK =====
export function useWardrobe() {
  const context = useContext(WardrobeContext);
  if (!context) {
    throw new Error("useWardrobe must be used within WardrobeProvider");
  }
  return context;
}

// ===== EXPORT CONTEXT (for advanced usage) =====
export { WardrobeContext };
