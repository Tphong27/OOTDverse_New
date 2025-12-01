import axios from "axios";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/setting`;

// 1. Lấy tất cả settings (có thể filter)
export const getSettings = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.type) params.append("type", filters.type);
    if (filters.status) params.append("status", filters.status);

    const response = await axios.get(`${API_URL}?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy settings:", error);
    return [];
  }
};

// 2. Lấy settings theo type cụ thể
export const getSettingsByType = async (type) => {
  try {
    const response = await axios.get(`${API_URL}/type/${type}`);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi lấy settings type ${type}:`, error);
    return [];
  }
};

// 3. Lấy 1 setting theo ID
export const getSettingById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy setting:", error);
    return null;
  }
};

// 4. Tạo setting mới
export const createSetting = async (settingData) => {
  try {
    const response = await axios.post(API_URL, settingData);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tạo setting:", error);
    throw error;
  }
};

// 5. Cập nhật setting
export const updateSetting = async (id, settingData) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, settingData);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi cập nhật setting:", error);
    throw error;
  }
};

// 6. Xóa mềm setting (chuyển thành Inactive)
export const deleteSetting = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi xóa setting:", error);
    throw error;
  }
};

// 7. Xóa vĩnh viễn setting
export const permanentDeleteSetting = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}/permanent`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi xóa vĩnh viễn setting:", error);
    throw error;
  }
};

// 8. Lấy danh sách các types có sẵn
export const getSettingTypes = async () => {
  try {
    const response = await axios.get(`${API_URL}/types`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy types:", error);
    return [];
  }
};

// 9. Lấy danh sách types với count (MỚI - cho dynamic categories)
export const getTypesWithCount = async () => {
  try {
    const response = await axios.get(`${API_URL}/types-with-count`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy types with count:", error);
    return [];
  }
};

// 10. Helper: Lấy tất cả brands
export const getBrands = async () => {
  return getSettingsByType("brand");
};

// 11. Helper: Lấy tất cả colors
export const getColors = async () => {
  return getSettingsByType("color");
};

// 12. Helper: Lấy tất cả seasons
export const getSeasons = async () => {
  return getSettingsByType("season");
};

// 13. Helper: Lấy tất cả styles
export const getStyles = async () => {
  return getSettingsByType("style");
};

// 14. Helper: Lấy tất cả occasions
export const getOccasions = async () => {
  return getSettingsByType("occasion");
};

// 15. Helper: Lấy tất cả weather types
export const getWeatherTypes = async () => {
  return getSettingsByType("weather");
};

// 16. Helper: Lấy tất cả categories
export const getCategories = async () => {
  return getSettingsByType("category");
};

// 17. Helper: Lấy tất cả roles
export const getRoles = async () => {
  return getSettingsByType("role");
};