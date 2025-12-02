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
  X,
  Check,
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
    categories,
    dynamicTypes,
    loading,
    addSetting,
    editSetting,
    removeSetting,
    loadDynamicTypes,
    getByType,
  } = useSettings();

  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentSetting, setCurrentSetting] = useState(null);

  // State cho thêm type mới (MỚI)
  const [isAddingNewType, setIsAddingNewType] = useState(false);
  const [newTypeName, setNewTypeName] = useState("");
  const [newTypeLabel, setNewTypeLabel] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  // Default icon mapping cho các type
  const typeIcons = {
    brand: Tag,
    color: Palette,
    season: Calendar,
    weather: Cloud,
    style: Shirt,
    occasion: Star,
    category: Grid3x3,
    role: User,
    material: Sparkles,
    size: Sparkles,
    fabric: Sparkles,
  };

  // Build categories động từ dynamicTypes
  const categoriesFilter = [
    { 
      id: "all", 
      label: "Tất cả", 
      icon: SettingsIcon, 
      count: settings.length 
    },
    ...dynamicTypes.map(type => ({
      id: type.id,
      label: type.label,
      icon: typeIcons[type.id] || SettingsIcon, // Fallback icon nếu không tìm thấy
      count: type.count
    }))
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

  // Set default type khi dynamicTypes load xong (MỚI)
  useEffect(() => {
    if (dynamicTypes.length > 0 && !formData.type) {
      setFormData(prev => ({ ...prev, type: dynamicTypes[0].id }));
    }
  }, [dynamicTypes]);

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

  // Handle thêm type mới (MỚI)
  const handleAddNewType = () => {
    if (!newTypeName.trim()) {
      alert("Vui lòng nhập tên type!");
      return;
    }

    // Validate: chỉ cho phép chữ thường và gạch dưới
    const typeRegex = /^[a-z_]+$/;
    if (!typeRegex.test(newTypeName)) {
      alert("Type chỉ được chứa chữ thường (a-z) và gạch dưới (_)!");
      return;
    }

    // Kiểm tra trùng lặp
    const isDuplicate = dynamicTypes.some(
      t => t.id.toLowerCase() === newTypeName.toLowerCase()
    );
    
    if (isDuplicate) {
      alert("Type này đã tồn tại!");
      return;
    }

    // Set type mới vào form
    setFormData({ 
      ...formData, 
      type: newTypeName.toLowerCase()
    });
    
    // Reset state
    setIsAddingNewType(false);
    setNewTypeName("");
    setNewTypeLabel("");
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
      
      // Reload dynamic types sau khi thêm/sửa (MỚI)
      await loadDynamicTypes();
      
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
        // Dynamic types sẽ tự reload trong removeSetting
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      type: dynamicTypes[0]?.id || "brand", // ← Lấy type đầu tiên từ dynamic
      priority: 0,
      value: "",
      description: "",
      status: "Active",
    });
    setCurrentSetting(null);
    setEditMode(false);
    setErrors({});
    setIsAddingNewType(false);
    setNewTypeName("");
    setNewTypeLabel("");
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
                {dynamicTypes.length} type
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

        {/* Categories Filter - DYNAMIC */}
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {categoriesFilter.map((cat) => {
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
                    setErrors({ ...errors, name: null });
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

              {/* Type - DYNAMIC (MỚI) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Loại <span className="text-red-500">*</span>
                </label>

                {!isAddingNewType ? (
                  <div className="space-y-2">
                    <select
                      required
                      value={formData.type}
                      onChange={(e) => {
                        if (e.target.value === "add_new_type") {
                          setIsAddingNewType(true);
                        } else {
                          setFormData({ ...formData, type: e.target.value });
                        }
                      }}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                    >
                      {/* Dynamic types từ database */}
                      {dynamicTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.label} ({type.count} items)
                        </option>
                      ))}
                      
                      {/* Option thêm type mới */}
                      <option 
                        value="add_new_type"
                        className="font-semibold text-purple-600 bg-purple-50"
                      >
                        ➕ Thêm loại mới
                      </option>
                    </select>
                    
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Chọn loại có sẵn hoặc tạo loại mới
                    </p>
                  </div>
                ) : (
                  // Form nhập type mới (MỚI)
                  <div className="space-y-3">
                    <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                      <p className="text-sm font-semibold text-purple-900 mb-3 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Tạo loại setting mới
                      </p>
                      
                      {/* Type ID (slug) */}
                      <div className="mb-3">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          ID loại (slug) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={newTypeName}
                          onChange={(e) => {
                            // Chỉ cho phép a-z và gạch dưới
                            const value = e.target.value.toLowerCase().replace(/[^a-z_]/g, '');
                            setNewTypeName(value);
                          }}
                          placeholder="VD: material, size, fabric"
                          className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                          autoFocus
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Chỉ dùng chữ thường (a-z) và gạch dưới (_)
                        </p>
                      </div>

                      {/* Type Label (optional - hiển thị) */}
                      <div className="mb-3">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Tên hiển thị (tùy chọn)
                        </label>
                        <input
                          type="text"
                          value={newTypeLabel}
                          onChange={(e) => setNewTypeLabel(e.target.value)}
                          placeholder="VD: Chất liệu, Kích cỡ"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Để trống sẽ tự động tạo từ ID
                        </p>
                      </div>

                      {/* Buttons */}
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleAddNewType}
                          className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                        >
                          <Check className="w-4 h-4" />
                          Xác nhận
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingNewType(false);
                            setNewTypeName("");
                            setNewTypeLabel("");
                          }}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                        >
                          <X className="w-4 h-4" />
                          Hủy
                        </button>
                      </div>
                    </div>

                    {/* Preview type mới */}
                    {newTypeName && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-xs font-medium text-blue-900 mb-1">
                          👁️ Preview:
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                            {newTypeName}
                          </span>
                          {newTypeLabel && (
                            <span className="text-xs text-gray-600">
                              → Hiển thị: "{newTypeLabel}"
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
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
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
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
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all resize-none ${
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
              <div className="flex gap-3 pt-4 border-t">
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
                  disabled={isAddingNewType && !newTypeName.trim()}
                  className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                    isAddingNewType && !newTypeName.trim()
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:shadow-lg"
                  }`}
                >
                  {editMode ? "Cập nhật" : "Thêm mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Scrollbar CSS */}
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