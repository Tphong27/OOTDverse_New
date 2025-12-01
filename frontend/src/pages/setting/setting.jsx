import LayoutUser from "@/components/layout/LayoutUser";
import { useState, useEffect } from "react";
import { useSettings } from "@/context/SettingContext";
import {
  Settings as SettingsIcon,
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  Sparkles,
  Tag,
  Palette,
  Cloud,
  Calendar,
  Shirt,
  Star,
  AlertCircle,
  User,
  Grid3x3,
} from "lucide-react";

export default function SettingsPage() {
  const {
    settings,
    brands,
    colors,
    seasons,
    styles,
    occasions,
    weatherTypes,
    cateogries,
    loading,
    addSetting,
    editSetting,
    removeSetting,
    getByType,
  } = useSettings();

  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all"); // ← THÊM state filter status
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentSetting, setCurrentSetting] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    type: "brand",
    priority: 0,
    value: "",
    description: "",
    status: "Active",
  });

  // Validation errors
  const [errors, setErrors] = useState({});

  // Categories với icons
  const categories = [
    { id: "all", label: "Tất cả", icon: SettingsIcon, count: settings.length },
    { id: "brand", label: "Thương hiệu", icon: Tag, count: brands.length },
    { id: "color", label: "Màu sắc", icon: Palette, count: colors.length },
    { id: "season", label: "Mùa", icon: Calendar, count: seasons.length },
    {
      id: "weather",
      label: "Thời tiết",
      icon: Cloud,
      count: weatherTypes.length,
    },
    { id: "style", label: "Phong cách", icon: Shirt, count: styles.length },
    { id: "occasion", label: "Dịp", icon: Star, count: occasions.length },
    // {
    //   id: "category",
    //   label: "Danh mục",
    //   icon: Grid3x3,
    //   count: categories.length,
    // }, // ← THÊM
    {
      id: "role",
      label: "Vai trò",
      icon: User,
      count: settings.filter((s) => s.type === "role").length,
    },
  ];

  // Filter settings
  const filteredSettings = settings.filter((setting) => {
    const matchType = selectedType === "all" || setting.type === selectedType;
    const matchStatus =
      selectedStatus === "all" || setting.status === selectedStatus;
    const matchSearch =
      setting.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      setting.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchType && matchStatus && matchSearch;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredSettings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredSettings.slice(startIndex, endIndex);

  // Reset về trang 1 khi filter thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedType, selectedStatus, searchQuery]);

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = "Tên không được để trống";
    } else if (formData.name.length < 2) {
      newErrors.name = "Tên phải có ít nhất 2 ký tự";
    } else if (formData.name.length > 100) {
      newErrors.name = "Tên không được quá 100 ký tự";
    }

    // Validate duplicate name (chỉ khi create hoặc đổi tên)
    const isDuplicate = settings.some(
      (s) =>
        s.name.toLowerCase() === formData.name.toLowerCase() &&
        s.type === formData.type &&
        s._id !== currentSetting?._id
    );
    if (isDuplicate) {
      newErrors.name = `Setting "${formData.name}" đã tồn tại trong loại "${formData.type}"`;
    }

    // Validate priority
    if (formData.priority < 0) {
      newErrors.priority = "Độ ưu tiên không được âm";
    } else if (formData.priority > 100) {
      newErrors.priority = "Độ ưu tiên không được quá 100";
    }

    // Validate value length
    if (formData.value && formData.value.length > 500) {
      newErrors.value = "Giá trị không được quá 500 ký tự";
    }

    // Validate description length
    if (formData.description && formData.description.length > 500) {
      newErrors.description = "Mô tả không được quá 500 ký tự";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate trước khi submit
    if (!validateForm()) {
      return;
    }

    try {
      if (editMode && currentSetting) {
        await editSetting(currentSetting._id, formData);
      } else {
        await addSetting(formData);
      }
      resetForm();
      setShowModal(false);
    } catch (error) {
      // Hiển thị lỗi từ backend
      const errorMsg = error.response?.data?.error || error.message;
      setErrors({ submit: errorMsg });
    }
  };

  // Handle edit
  const handleEdit = (setting) => {
    setCurrentSetting(setting);
    setFormData({
      name: setting.name,
      type: setting.type,
      priority: setting.priority,
      value: setting.value || "",
      description: setting.description || "",
      status: setting.status,
    });
    setEditMode(true);
    setShowModal(true);
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (confirm("Bạn có chắc muốn xóa setting này?")) {
      try {
        await removeSetting(id);
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      type: "brand",
      priority: 0,
      value: "",
      description: "",
      status: "Active",
    });
    setCurrentSetting(null);
    setEditMode(false);
    setErrors({}); //Reset errors
  };

  // Open add modal
  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  return (
    <LayoutUser>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 rounded-2xl p-8 text-white shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3">
                <SettingsIcon className="w-8 h-8" />
                Quản lý Settings
              </h1>
              <p className="text-white/90 text-lg">
                {settings.length} settings •{" "}
                {settings.filter((s) => s.status === "Active").length} active •{" "}
                {categories.length} danh mục
              </p>
            </div>
            <button
              onClick={openAddModal}
              className="bg-white text-purple-600 px-6 py-3 rounded-xl font-semibold hover:bg-purple-50 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 group"
            >
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
              Thêm Setting
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm setting..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Status Filter */}
            <div className="lg:w-48">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Categories Filter */}
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedType(cat.id)}
                className={`px-5 py-2.5 rounded-xl font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                  selectedType === cat.id
                    ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg scale-105"
                    : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                }`}
              >
                <Icon className="w-4 h-4" />
                {cat.label}
                <span
                  className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                    selectedType === cat.id ? "bg-white/20" : "bg-gray-100"
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Settings Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600"></div>
          </div>
        ) : filteredSettings.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl">
            <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Không tìm thấy setting nào
            </h3>
            <p className="text-gray-500 mb-6">
              Hãy thử thay đổi bộ lọc hoặc thêm setting mới!
            </p>
            <button
              onClick={openAddModal}
              className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              <Plus className="w-5 h-5 inline mr-2" />
              Thêm Setting
            </button>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Tên
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Loại
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Ưu tiên
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Trạng thái
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Mô tả
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Hành động
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentItems.map((setting) => (
                      <tr
                        key={setting._id}
                        className="hover:bg-purple-50/50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-semibold text-gray-900">
                            {setting.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                            {setting.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="flex items-center gap-1 text-sm text-gray-600">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            {setting.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 text-xs font-medium rounded-full ${
                              setting.status === "Active"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {setting.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                          {setting.description || "—"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEdit(setting)}
                              className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(setting._id)}
                              className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="text-sm text-gray-600">
                  Hiển thị{" "}
                  <span className="font-semibold">{startIndex + 1}</span> đến{" "}
                  <span className="font-semibold">
                    {Math.min(endIndex, filteredSettings.length)}
                  </span>{" "}
                  trong tổng số{" "}
                  <span className="font-semibold">
                    {filteredSettings.length}
                  </span>{" "}
                  kết quả
                </div>

                <div className="flex items-center gap-2">
                  {/* Previous Button */}
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      currentPage === 1
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white border border-gray-200 text-gray-700 hover:bg-purple-50 hover:border-purple-300"
                    }`}
                  >
                    Trước
                  </button>

                  {/* Page Numbers */}
                  <div className="flex items-center gap-1">
                    {[...Array(totalPages)].map((_, index) => {
                      const pageNum = index + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-10 h-10 rounded-lg font-medium transition-all ${
                            currentPage === pageNum
                              ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg"
                              : "bg-white border border-gray-200 text-gray-700 hover:bg-purple-50 hover:border-purple-300"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  {/* Next Button */}
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      currentPage === totalPages
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white border border-gray-200 text-gray-700 hover:bg-purple-50 hover:border-purple-300"
                    }`}
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal Add/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-500 p-6 text-white">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                {editMode ? (
                  <>
                    <Edit2 className="w-6 h-6" />
                    Chỉnh sửa Setting
                  </>
                ) : (
                  <>
                    <Plus className="w-6 h-6" />
                    Thêm Setting mới
                  </>
                )}
              </h2>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Error Alert */}
              {errors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-red-800">Lỗi</p>
                    <p className="text-sm text-red-700">{errors.submit}</p>
                  </div>
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    setErrors({ ...errors, name: null }); // Clear error khi gõ
                  }}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                    errors.name
                      ? "border-red-300 focus:ring-red-500"
                      : "border-gray-200 focus:ring-purple-500"
                  }`}
                  placeholder="VD: Zara, Màu đỏ, Mùa hè..."
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Loại <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="brand">Thương hiệu (Brand)</option>
                  <option value="color">Màu sắc (Color)</option>
                  <option value="season">Mùa (Season)</option>
                  <option value="weather">Thời tiết (Weather)</option>
                  <option value="style">Phong cách (Style)</option>
                  <option value="occasion">Dịp (Occasion)</option>
                  <option value="material">Chất liệu (Material)</option>
                  <option value="category">Danh mục (Category)</option>
                  <option value="role">Vai trò (Role)</option>
                </select>
              </div>

              {/* Priority & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Độ ưu tiên
                  </label>
                  <input
                    type="number"
                    value={formData.priority}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        priority: parseInt(e.target.value) || 0,
                      });
                      setErrors({ ...errors, priority: null });
                    }}
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                      errors.priority
                        ? "border-red-300 focus:ring-red-500"
                        : "border-gray-200 focus:ring-purple-500"
                    }`}
                    placeholder="0-100"
                    min="0"
                    max="100"
                  />
                  {errors.priority && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.priority}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Trạng thái
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Value (Optional) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Giá trị (Tùy chọn)
                </label>
                <input
                  type="text"
                  value={formData.value}
                  onChange={(e) => {
                    setFormData({ ...formData, value: e.target.value });
                    setErrors({ ...errors, value: null });
                  }}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                    errors.value
                      ? "border-red-300 focus:ring-red-500"
                      : "border-gray-200 focus:ring-purple-500"
                  }`}
                  placeholder="Hex code, URL, hoặc dữ liệu khác..."
                  maxLength={500}
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.value && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.value}
                    </p>
                  )}
                  <p
                    className={`text-xs ${
                      formData.value.length > 450
                        ? "text-red-500"
                        : "text-gray-400"
                    } ml-auto`}
                  >
                    {formData.value.length}/500
                  </p>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mô tả (Tùy chọn)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => {
                    setFormData({ ...formData, description: e.target.value });
                    setErrors({ ...errors, description: null });
                  }}
                  rows={3}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                    errors.description
                      ? "border-red-300 focus:ring-red-500"
                      : "border-gray-200 focus:ring-purple-500"
                  }`}
                  placeholder="Mô tả chi tiết về setting này..."
                  maxLength={500}
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.description && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.description}
                    </p>
                  )}
                  <p
                    className={`text-xs ${
                      formData.description.length > 450
                        ? "text-red-500"
                        : "text-gray-400"
                    } ml-auto`}
                  >
                    {formData.description.length}/500
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  {editMode ? "Cập nhật" : "Thêm mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </LayoutUser>
  );
}
