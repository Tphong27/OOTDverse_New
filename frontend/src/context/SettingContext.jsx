"use client";
import { createContext, useContext, useState, useEffect } from "react";
import {
  getSettings,
  getSettingsByType,
  createSetting,
  updateSetting,
  deleteSetting,
  permanentDeleteSetting,
  getSettingTypes,
  getBrands,
  getColors,
  getSeasons,
  getStyles,
  getOccasions,
  getWeatherTypes,
  getCategories, // ← THÊM
} from "@/services/settingService";

const SettingContext = createContext();

export function SettingProvider({ children }) {
  // State chính: Lưu tất cả settings
  const [settings, setSettings] = useState([]);

  // State phân loại theo type (để truy cập nhanh)
  const [brands, setBrands] = useState([]);
  const [colors, setColors] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [styles, setStyles] = useState([]);
  const [occasions, setOccasions] = useState([]);
  const [weatherTypes, setWeatherTypes] = useState([]);
  const [categories, setCategories] = useState([]); // ← THÊM
  const [roles, setRoles] = useState([]);

  // State loading
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load tất cả settings khi app khởi động
  useEffect(() => {
    loadAllSettings();
  }, []);

  // Hàm load tất cả settings
  const loadAllSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load TẤT CẢ settings
      const allSettings = await getSettings();
      setSettings(allSettings);

      // Phân loại settings theo type
      setBrands(allSettings.filter((s) => s.type === "brand"));
      setColors(allSettings.filter((s) => s.type === "color"));
      setSeasons(allSettings.filter((s) => s.type === "season"));
      setStyles(allSettings.filter((s) => s.type === "style"));
      setOccasions(allSettings.filter((s) => s.type === "occasion"));
      setWeatherTypes(allSettings.filter((s) => s.type === "weather"));
      setCategories(allSettings.filter((s) => s.type === "category")); // ← THÊM
      setRoles(allSettings.filter((s) => s.type === "role"));
    } catch (err) {
      console.error("Lỗi load settings:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Hàm load settings theo type cụ thể
  const loadSettingsByType = async (type) => {
    try {
      const data = await getSettingsByType(type);

      // Cập nhật state tương ứng
      switch (type) {
        case "brand":
          setBrands(data);
          break;
        case "color":
          setColors(data);
          break;
        case "season":
          setSeasons(data);
          break;
        case "style":
          setStyles(data);
          break;
        case "occasion":
          setOccasions(data);
          break;
        case "weather":
          setWeatherTypes(data);
          break;
        case "category":
          setCategories(data);
          break;
        case "role":
          setRoles(data);
          break;
      }

      return data;
    } catch (err) {
      console.error(`Lỗi load ${type}:`, err);
      throw err;
    }
  };

  // Hàm thêm setting mới
  const addSetting = async (settingData) => {
    try {
      const newSetting = await createSetting(settingData);

      // Cập nhật state
      setSettings((prev) => [newSetting, ...prev]);

      // Cập nhật state phân loại
      updateCategorizedState(newSetting, "add");

      return newSetting;
    } catch (err) {
      console.error("Lỗi thêm setting:", err);
      throw err;
    }
  };

  // Hàm cập nhật setting
  const editSetting = async (id, settingData) => {
    try {
      const updatedSetting = await updateSetting(id, settingData);

      // Cập nhật state
      setSettings((prev) =>
        prev.map((s) => (s._id === id ? updatedSetting : s))
      );

      // Cập nhật state phân loại
      updateCategorizedState(updatedSetting, "update", id);

      return updatedSetting;
    } catch (err) {
      console.error("Lỗi cập nhật setting:", err);
      throw err;
    }
  };

  // Hàm xóa mềm setting
  const removeSetting = async (id) => {
    try {
      await deleteSetting(id);

      // Xóa khỏi state (vì đã inactive)
      setSettings((prev) => prev.filter((s) => s._id !== id));

      // Xóa khỏi state phân loại
      updateCategorizedState({ _id: id }, "remove");
    } catch (err) {
      console.error("Lỗi xóa setting:", err);
      throw err;
    }
  };

  // Hàm xóa vĩnh viễn
  const removeSettingPermanent = async (id) => {
    try {
      await permanentDeleteSetting(id);

      // Xóa khỏi state
      setSettings((prev) => prev.filter((s) => s._id !== id));
      updateCategorizedState({ _id: id }, "remove");
    } catch (err) {
      console.error("Lỗi xóa vĩnh viễn:", err);
      throw err;
    }
  };

  // Helper: Cập nhật state phân loại
  const updateCategorizedState = (setting, action, oldId = null) => {
    const { type, _id } = setting;

    const updateState = (setState) => {
      setState((prev) => {
        if (action === "add") {
          return [setting, ...prev];
        } else if (action === "update") {
          return prev.map((s) => (s._id === oldId ? setting : s));
        } else if (action === "remove") {
          return prev.filter((s) => s._id !== _id);
        }
        return prev;
      });
    };

    switch (type) {
      case "brand":
        updateState(setBrands);
        break;
      case "color":
        updateState(setColors);
        break;
      case "season":
        updateState(setSeasons);
        break;
      case "style":
        updateState(setStyles);
        break;
      case "occasion":
        updateState(setOccasions);
        break;
      case "weather":
        updateState(setWeatherTypes);
        break;
      case "category":
        updateState(setCategories);
        break;
      case "role":
        updateState(setRoles);
        break;
    }
  };

  // Helper: Lấy settings theo type từ state
  const getByType = (type) => {
    switch (type) {
      case "brand":
        return brands;
      case "color":
        return colors;
      case "season":
        return seasons;
      case "style":
        return styles;
      case "occasion":
        return occasions;
      case "weather":
        return weatherTypes;
      case "category":
        return categories;
      case "role":
        return roles;
      default:
        return [];
    }
  };

  return (
    <SettingContext.Provider
      value={{
        // State
        settings,
        brands,
        colors,
        seasons,
        styles,
        occasions,
        weatherTypes,
        categories,
        roles,
        loading,
        error,

        // Functions
        loadAllSettings,
        loadSettingsByType,
        addSetting,
        editSetting,
        removeSetting,
        removeSettingPermanent,
        getByType,
      }}
    >
      {children}
    </SettingContext.Provider>
  );
}

// Hook để sử dụng SettingContext
export function useSettings() {
  const context = useContext(SettingContext);
  if (!context) {
    throw new Error("useSettings must be used within SettingProvider");
  }
  return context;
}
