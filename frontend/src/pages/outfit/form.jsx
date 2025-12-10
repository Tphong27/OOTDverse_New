import LayoutUser from "@/components/layout/LayoutUser";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useOutfit } from "@/context/OutfitContext";
import { useSettings } from "@/context/SettingContext";
import { useAuth } from "@/context/AuthContext";
import { useWardrobe } from "@/context/WardrobeContext";
import {
  Save,
  X,
  Plus,
  Upload,
  Tag,
  AlertCircle,
  ArrowLeft,
  Sparkles,
  Shirt,
  Lock,
  Globe,
  Search,
  Grid3x3,
  Trash2,
} from "lucide-react";

export default function OutfitFormPage() {
  const router = useRouter();
  const { id } = router.query; // Nếu có id = Edit mode, không có = Create mode
  const { user } = useAuth();
  const { currentOutfit, createOutfit, updateOutfit, fetchOutfitById, loading, clearCurrentOutfit } = useOutfit();
  const { settings } = useSettings();
  const { items, loadItems } = useWardrobe();

  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    outfit_name: "",
    style_id: "",
    occasion_id: "",
    season_id: "",
    weather_id: "",
    is_public: true,
    thumbnail_url: "",
    full_image_url: "",
    tags: [],
    description: "",
    notes: "",
    items: [], // [{ item_id, layer_position, display_order, styling_note, is_optional }]
  });

  const [tagInput, setTagInput] = useState("");
  const [errors, setErrors] = useState({});
  const [previewImage, setPreviewImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Item Selection State
  const [selectedItems, setSelectedItems] = useState([]); // Array of item IDs
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  // ========================================
  // LOAD DATA
  // ========================================
  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    // Load user's wardrobe items
    loadItems(); // Không cần arg

    // If edit mode, load outfit
    if (isEditMode && id) {
      fetchOutfitById(id)
        .then((outfit) => {
          if (outfit && outfit.user_id?._id !== user._id) {
            router.push(`/outfit/${id}`);
          }
          setIsLoading(false);
        })
        .catch(() => {
          setIsLoading(false);
        });
    } else {
      clearCurrentOutfit();
      setIsLoading(false);
    }
  }, [user, loadItems]);

  // ========================================
  // POPULATE FORM IN EDIT MODE
  // ========================================
  useEffect(() => {
    if (isEditMode && currentOutfit) {
      setFormData({
        outfit_name: currentOutfit.outfit_name || "",
        style_id: currentOutfit.style_id?._id || "",
        occasion_id: currentOutfit.occasion_id?._id || "",
        season_id: currentOutfit.season_id?._id || "",
        weather_id: currentOutfit.weather_id?._id || "",
        is_public: currentOutfit.is_public !== undefined ? currentOutfit.is_public : true,
        thumbnail_url: currentOutfit.thumbnail_url || "",
        full_image_url: currentOutfit.full_image_url || "",
        tags: currentOutfit.tags || [],
        description: currentOutfit.description || "",
        notes: currentOutfit.notes || "",
        items: currentOutfit.items?.map((oi) => ({
          item_id: oi.item_id._id,
          layer_position: oi.layer_position,
          display_order: oi.display_order,
          styling_note: oi.styling_note,
          is_optional: oi.is_optional,
        })) || [],
      });

      setSelectedItems(currentOutfit.items?.map((oi) => oi.item_id._id) || []);

      if (currentOutfit.thumbnail_url) {
        setPreviewImage(currentOutfit.thumbnail_url);
      }
    }
  }, [currentOutfit, isEditMode]);

  // ========================================
  // FORM HANDLERS
  // ========================================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        thumbnail_url: "Ảnh không được vượt quá 5MB",
      }));
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      setFormData((prev) => ({
        ...prev,
        thumbnail_url: base64String,
        full_image_url: base64String,
      }));
      setPreviewImage(base64String);
      setErrors((prev) => ({ ...prev, thumbnail_url: null }));
    };
    reader.readAsDataURL(file);
  };

  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    
    if (formData.tags.length >= 20) {
      setErrors((prev) => ({
        ...prev,
        tags: "Không được thêm quá 20 tags",
      }));
      return;
    }

    if (!formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
      setErrors((prev) => ({ ...prev, tags: null }));
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  // ========================================
  // ITEM SELECTION
  // ========================================
  const toggleItemSelection = (itemId) => {
    setSelectedItems((prev) => {
      if (prev.includes(itemId)) {
        return prev.filter((id) => id !== itemId);
      } else {
        if (prev.length >= 15) {
          alert("Outfit không được vượt quá 15 items");
          return prev;
        }
        return [...prev, itemId];
      }
    });
  };

  const getFilteredItems = () => {
    return items.filter((item) => {
      const matchSearch = item.item_name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = filterCategory === "" || item.category_id?._id === filterCategory;
      return matchSearch && matchCategory;
    });
  };

  // ========================================
  // VALIDATION
  // ========================================
  const validateForm = () => {
    const newErrors = {};

    if (!formData.outfit_name.trim()) {
      newErrors.outfit_name = "Tên outfit là bắt buộc";
    } else if (formData.outfit_name.length < 2) {
      newErrors.outfit_name = "Tên phải có ít nhất 2 ký tự";
    } else if (formData.outfit_name.length > 150) {
      newErrors.outfit_name = "Tên không được quá 150 ký tự";
    }

    if (selectedItems.length < 2) {
      newErrors.items = "Outfit phải có ít nhất 2 items";
    }

    if (selectedItems.length > 15) {
      newErrors.items = "Outfit không được vượt quá 15 items";
    }

    if (formData.description && formData.description.length > 1000) {
      newErrors.description = "Mô tả không được quá 1000 ký tự";
    }

    if (formData.notes && formData.notes.length > 1000) {
      newErrors.notes = "Ghi chú không được quá 1000 ký tự";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ========================================
  // SUBMIT
  // ========================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Build items array
    const itemsData = selectedItems.map((itemId, index) => ({
      item_id: itemId,
      layer_position: null,
      display_order: index,
      styling_note: null,
      is_optional: false,
    }));

    const submitData = {
      ...formData,
      user_id: user._id,
      items: itemsData,
    };

    let result;
    if (isEditMode) {
      result = await updateOutfit(id, submitData);
    } else {
      result = await createOutfit(submitData);
    }

    if (result?.success) {
      // Navigate to outfit detail page
      router.push(`/outfit/${result.data._id}`);
    } else if (result?.errors) {
      setErrors(result.errors);
    }
  };

  // ========================================
  // SETTINGS HELPERS
  // ========================================
  const getSettingsByType = (type) => {
    return settings.filter((s) => s.type === type && s.status === "Active");
  };

  const getCategorySettings = () => {
    return settings.filter((s) => s.type === "category" && s.status === "Active");
  };

  // ========================================
  // RENDER
  // ========================================
  if (!user || isLoading) {
    return (
      <LayoutUser>
        <div className="flex items-center justify-center py-40">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600"></div>
        </div>
      </LayoutUser>
    );
  }

  return (
    <LayoutUser>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditMode ? "Chỉnh sửa Outfit" : "Tạo Outfit Mới"}
            </h1>
            <p className="text-gray-600">
              {isEditMode ? "Cập nhật thông tin outfit" : "Chọn items từ tủ đồ của bạn"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Item Selection */}
            <div className="lg:col-span-2 space-y-6">
              {/* Item Picker */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Shirt className="w-5 h-5 text-purple-600" />
                    Chọn items cho outfit
                  </h2>
                  <span className="text-sm font-medium text-purple-600">
                    {selectedItems.length}/15 items
                  </span>
                </div>

                {errors.items && (
                  <p className="mb-4 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.items}
                  </p>
                )}

                {/* Search & Filter */}
                <div className="flex gap-3 mb-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Tìm kiếm items..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Tất cả</option>
                    {getCategorySettings().map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Items Grid */}
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3 max-h-96 overflow-y-auto">
                  {getFilteredItems().map((item) => (
                    <div
                      key={item._id}
                      onClick={() => toggleItemSelection(item._id)}
                      className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                        selectedItems.includes(item._id)
                          ? "border-purple-500 ring-2 ring-purple-200"
                          : "border-gray-200 hover:border-purple-300"
                      }`}
                    >
                      <img
                        src={item.image_url || "/placeholder-item.jpg"}
                        alt={item.item_name}
                        className="w-full h-full object-cover"
                      />
                      {selectedItems.includes(item._id) && (
                        <div className="absolute inset-0 bg-purple-600/30 flex items-center justify-center">
                          <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">
                            ✓
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {getFilteredItems().length === 0 && (
                  <p className="text-center text-gray-500 py-8">
                    Không tìm thấy item nào
                  </p>
                )}
              </div>

              {/* Selected Items Preview */}
              {selectedItems.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="font-semibold mb-4">
                    Items đã chọn ({selectedItems.length})
                  </h3>
                  <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                    {selectedItems.map((itemId) => {
                      const item = items.find((i) => i._id === itemId);
                      if (!item) return null;
                      return (
                        <div key={itemId} className="relative aspect-square">
                          <img
                            src={item.image_url || "/placeholder-item.jpg"}
                            alt={item.item_name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => toggleItemSelection(itemId)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Outfit Details */}
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-semibold mb-4">Thông tin outfit</h2>

                {/* Outfit Name */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên Outfit <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="outfit_name"
                    value={formData.outfit_name}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                      errors.outfit_name
                        ? "border-red-300 focus:ring-red-500"
                        : "border-gray-200 focus:ring-purple-500"
                    }`}
                  />
                  {errors.outfit_name && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.outfit_name}
                    </p>
                  )}
                </div>

                {/* Image Upload */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ảnh Outfit
                  </label>
                  {previewImage ? (
                    <div className="relative w-full aspect-square rounded-xl overflow-hidden border-2 border-gray-200">
                      <img
                        src={previewImage}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewImage(null);
                          setFormData((prev) => ({
                            ...prev,
                            thumbnail_url: "",
                            full_image_url: "",
                          }));
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="w-full aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-purple-500 transition-colors">
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600">Upload ảnh</span>
                      <span className="text-xs text-gray-400 mt-1">
                        PNG, JPG (max 5MB)
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* Privacy */}
                <div className="mb-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="is_public"
                      checked={formData.is_public}
                      onChange={handleChange}
                      className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                    />
                    <div className="flex items-center gap-2">
                      {formData.is_public ? (
                        <Globe className="w-5 h-5 text-green-600" />
                      ) : (
                        <Lock className="w-5 h-5 text-gray-600" />
                      )}
                      <span className="font-medium text-gray-700">
                        {formData.is_public ? "Công khai" : "Riêng tư"}
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Categories */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  Phân loại
                </h2>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phong cách
                    </label>
                    <select
                      name="style_id"
                      value={formData.style_id}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-sm"
                    >
                      <option value="">Chọn phong cách</option>
                      {getSettingsByType("style").map((style) => (
                        <option key={style._id} value={style._id}>
                          {style.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dịp mặc
                    </label>
                    <select
                      name="occasion_id"
                      value={formData.occasion_id}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-sm"
                    >
                      <option value="">Chọn dịp mặc</option>
                      {getSettingsByType("occasion").map((occasion) => (
                        <option key={occasion._id} value={occasion._id}>
                          {occasion.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mùa
                    </label>
                    <select
                      name="season_id"
                      value={formData.season_id}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-sm"
                    >
                      <option value="">Chọn mùa</option>
                      {getSettingsByType("season").map((season) => (
                        <option key={season._id} value={season._id}>
                          {season.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Thời tiết
                    </label>
                    <select
                      name="weather_id"
                      value={formData.weather_id}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-sm"
                    >
                      <option value="">Chọn thời tiết</option>
                      {getSettingsByType("weather").map((weather) => (
                        <option key={weather._id} value={weather._id}>
                          {weather.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Tag className="w-5 h-5 text-purple-600" />
                  Tags
                </h2>

                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="Thêm tag..."
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium flex items-center gap-2"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-purple-900"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Description & Notes */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mô tả
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none text-sm"
                    maxLength={1000}
                  />
                  <p className="text-xs text-gray-400 mt-1 text-right">
                    {formData.description.length}/1000
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ghi chú cá nhân
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none text-sm"
                    maxLength={1000}
                  />
                  <p className="text-xs text-gray-400 mt-1 text-right">
                    {formData.notes.length}/1000
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                    loading
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:shadow-lg"
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      {isEditMode ? "Đang lưu..." : "Đang tạo..."}
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      {isEditMode ? "Lưu" : "Tạo Outfit"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </LayoutUser>
  );
}