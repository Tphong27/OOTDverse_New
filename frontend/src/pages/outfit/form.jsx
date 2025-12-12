import LayoutUser from "@/components/layout/LayoutUser";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import { useOutfit } from "@/context/OutfitContext";
import { useSettings } from "@/context/SettingContext";
import { useWardrobe } from "@/context/WardrobeContext";
import {
  X,
  Plus,
  Save,
  Trash2,
  Search,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Shirt,
  Check,
} from "lucide-react";

export default function OutfitFormPage() {
  const router = useRouter();
  const id = router.query.id;
  const isEditMode = !!id;

  const { user } = useAuth();
  const { createOutfit, updateOutfit, fetchOutfitById } = useOutfit();
  const { styles, occasions, seasons, weatherTypes } = useSettings();
  const { items: wardrobeItems } = useWardrobe();

  // Form state
  const [formData, setFormData] = useState({
    outfit_name: "",
    style_id: [],
    occasion_id: [],
    season_id: [],
    weather_id: [],
    is_public: true,
    thumbnail_url: "",
    full_image_url: "",
    tags: [],
    description: "",
    notes: "",
    items: [],
  });

  const [newTag, setNewTag] = useState("");
  const [showItemPicker, setShowItemPicker] = useState(false);
  const [itemSearchQuery, setItemSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);

  // Load outfit data if edit mode
  useEffect(() => {
    if (isEditMode && id) {
      loadOutfitData();
    }
  }, [isEditMode, id]);

  const loadOutfitData = async () => {
    try {
      const outfit = await fetchOutfitById(id);
      if (outfit) {
        setFormData({
          outfit_name: outfit.outfit_name || "",
          style_id: Array.isArray(outfit.style_id)
            ? outfit.style_id.map((s) => s._id || s)
            : outfit.style_id?._id
            ? [outfit.style_id._id]
            : [],
          occasion_id: Array.isArray(outfit.occasion_id)
            ? outfit.occasion_id.map((o) => o._id || o)
            : outfit.occasion_id?._id
            ? [outfit.occasion_id._id]
            : [],
          season_id: Array.isArray(outfit.season_id)
            ? outfit.season_id.map((season) => season._id || season)
            : outfit.season_id?._id
            ? [outfit.season_id._id]
            : [],
          weather_id: Array.isArray(outfit.weather_id)
            ? outfit.weather_id.map((w) => w._id || w)
            : outfit.weather_id?._id
            ? [outfit.weather_id._id]
            : [],
          is_public: outfit.is_public !== undefined ? outfit.is_public : true,
          thumbnail_url: outfit.thumbnail_url || "",
          full_image_url: outfit.full_image_url || "",
          tags: outfit.tags || [],
          description: outfit.description || "",
          notes: outfit.notes || "",
          items:
            outfit.items?.map((oi) => ({
              item_id: oi.item_id._id,
              item_data: oi.item_id,
              layer_position: oi.layer_position,
              display_order: oi.display_order,
              styling_note: oi.styling_note,
              is_optional: oi.is_optional,
            })) || [],
        });
      }
    } catch (error) {
      console.error("Error loading outfit:", error);
      alert("Không thể tải dữ liệu outfit");
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors([]);
  };

  // Toggle checkbox for multi-select fields
  const handleToggleCheckbox = (field, id) => {
    setFormData((prev) => {
      const currentArray = prev[field] || [];
      const newArray = currentArray.includes(id)
        ? currentArray.filter((item) => item !== id)
        : [...currentArray, id];
      return { ...prev, [field]: newArray };
    });
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      handleChange("tags", [...formData.tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    handleChange(
      "tags",
      formData.tags.filter((tag) => tag !== tagToRemove)
    );
  };

  const handleAddItem = (item) => {
    if (formData.items.some((i) => i.item_id === item._id)) {
      alert("Item này đã có trong outfit");
      return;
    }

    if (formData.items.length >= 15) {
      alert("Outfit không được vượt quá 15 items");
      return;
    }

    const newItem = {
      item_id: item._id,
      item_data: item,
      layer_position: null,
      display_order: formData.items.length,
      styling_note: "",
      is_optional: false,
    };

    handleChange("items", [...formData.items, newItem]);
  };

  const handleRemoveItem = (itemId) => {
    handleChange(
      "items",
      formData.items.filter((i) => i.item_id !== itemId)
    );
  };

  const handleUpdateItemDetail = (itemId, field, value) => {
    handleChange(
      "items",
      formData.items.map((item) =>
        item.item_id === itemId ? { ...item, [field]: value } : item
      )
    );
  };

  const handleMoveItem = (index, direction) => {
    const newItems = [...formData.items];
    const newIndex = direction === "up" ? index - 1 : index + 1;

    if (newIndex < 0 || newIndex >= newItems.length) return;

    [newItems[index], newItems[newIndex]] = [
      newItems[newIndex],
      newItems[index],
    ];

    newItems.forEach((item, idx) => {
      item.display_order = idx;
    });

    handleChange("items", newItems);
  };

  const validateForm = () => {
    const newErrors = [];

    if (!formData.outfit_name.trim()) {
      newErrors.push("Tên outfit là bắt buộc");
    } else if (formData.outfit_name.trim().length < 2) {
      newErrors.push("Tên outfit phải có ít nhất 2 ký tự");
    }

    if (formData.items.length < 2) {
      newErrors.push("Outfit phải có ít nhất 2 items");
    }

    if (formData.items.length > 15) {
      newErrors.push("Outfit không được vượt quá 15 items");
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        user_id: user._id,
        ...formData,
        items: formData.items.map((item) => ({
          item_id: item.item_id,
          layer_position: item.layer_position,
          display_order: item.display_order,
          styling_note: item.styling_note,
          is_optional: item.is_optional,
        })),
      };

      let response;
      if (isEditMode) {
        response = await updateOutfit(id, submitData);
      } else {
        response = await createOutfit(submitData);
      }

      if (response.success) {
        alert(`${isEditMode ? "Cập nhật" : "Tạo"} outfit thành công!`);
        router.push("/outfit/outfit");
      }
    } catch (error) {
      console.error("Error submitting outfit:", error);
      alert(`Lỗi: ${error.message || "Không thể lưu outfit"}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredWardrobeItems = wardrobeItems.filter((item) => {
    const matchesSearch = item.item_name
      ?.toLowerCase()
      .includes(itemSearchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || item.category_id?._id === selectedCategory;
    const notSelected = !formData.items.some((i) => i.item_id === item._id);

    return matchesSearch && matchesCategory && notSelected;
  });

  const categories = Array.from(
    new Set(wardrobeItems.map((item) => item.category_id?._id).filter(Boolean))
  ).map(
    (catId) =>
      wardrobeItems.find((item) => item.category_id?._id === catId)?.category_id
  );

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Vui lòng đăng nhập để tạo outfit</p>
      </div>
    );
  }

  return (
    <LayoutUser>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          <div className="mb-6">
            <button
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-800 mb-4"
            >
              ← Quay lại
            </button>
            <h1 className="text-3xl font-bold">
              {isEditMode ? "Chỉnh sửa Outfit" : "Tạo Outfit Mới"}
            </h1>
          </div>

          {errors.length > 0 && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <ul className="list-disc list-inside text-red-700">
                {errors.map((error, idx) => (
                  <li key={idx}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Thông tin cơ bản</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Tên Outfit <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.outfit_name}
                    onChange={(e) =>
                      handleChange("outfit_name", e.target.value)
                    }
                    placeholder="VD: Outfit công sở lịch sự"
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Mô tả
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      handleChange("description", e.target.value)
                    }
                    placeholder="Mô tả outfit của bạn..."
                    rows={3}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Checkboxes Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Style Checkboxes */}
                  <div className="border rounded-lg p-4">
                    <label className="block text-sm font-medium mb-3">
                      Phong cách
                    </label>
                    <div className="space-y-2 h-48 overflow-y-auto">
                      {styles.map((style) => (
                        <label
                          key={style._id}
                          className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                        >
                          <input
                            type="checkbox"
                            checked={formData.style_id.includes(style._id)}
                            onChange={() =>
                              handleToggleCheckbox("style_id", style._id)
                            }
                            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-sm">{style.name}</span>
                          {formData.style_id.includes(style._id) && (
                            <Check className="w-4 h-4 text-blue-600 ml-auto" />
                          )}
                        </label>
                      ))}
                    </div>
                    {formData.style_id.length > 0 && (
                      <p className="text-xs text-gray-500 mt-2">
                        Đã chọn: {formData.style_id.length}
                      </p>
                    )}
                  </div>

                  {/* Occasion Checkboxes */}
                  <div className="border rounded-lg p-4">
                    <label className="block text-sm font-medium mb-3">
                      Dịp
                    </label>
                    <div className="space-y-2 h-48 overflow-y-auto">
                      {occasions.map((occasion) => (
                        <label
                          key={occasion._id}
                          className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                        >
                          <input
                            type="checkbox"
                            checked={formData.occasion_id.includes(
                              occasion._id
                            )}
                            onChange={() =>
                              handleToggleCheckbox("occasion_id", occasion._id)
                            }
                            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-sm">{occasion.name}</span>
                          {formData.occasion_id.includes(occasion._id) && (
                            <Check className="w-4 h-4 text-blue-600 ml-auto" />
                          )}
                        </label>
                      ))}
                    </div>
                    {formData.occasion_id.length > 0 && (
                      <p className="text-xs text-gray-500 mt-2">
                        Đã chọn: {formData.occasion_id.length}
                      </p>
                    )}
                  </div>

                  {/* Season Checkboxes */}
                  <div className="border rounded-lg p-4">
                    <label className="block text-sm font-medium mb-3">
                      Mùa
                    </label>
                    <div className="space-y-2 h-48 overflow-y-auto">
                      {seasons.map((season) => (
                        <label
                          key={season._id}
                          className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                        >
                          <input
                            type="checkbox"
                            checked={formData.season_id.includes(season._id)}
                            onChange={() =>
                              handleToggleCheckbox("season_id", season._id)
                            }
                            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-sm">{season.name}</span>
                          {formData.season_id.includes(season._id) && (
                            <Check className="w-4 h-4 text-blue-600 ml-auto" />
                          )}
                        </label>
                      ))}
                    </div>
                    {formData.season_id.length > 0 && (
                      <p className="text-xs text-gray-500 mt-2">
                        Đã chọn: {formData.season_id.length}
                      </p>
                    )}
                  </div>

                  {/* Weather Checkboxes */}
                  <div className="border rounded-lg p-4">
                    <label className="block text-sm font-medium mb-3">
                      Thời tiết
                    </label>
                    <div className="space-y-2 h-48 overflow-y-auto">
                      {weatherTypes.map((weather) => (
                        <label
                          key={weather._id}
                          className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                        >
                          <input
                            type="checkbox"
                            checked={formData.weather_id.includes(weather._id)}
                            onChange={() =>
                              handleToggleCheckbox("weather_id", weather._id)
                            }
                            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-sm">{weather.name}</span>
                          {formData.weather_id.includes(weather._id) && (
                            <Check className="w-4 h-4 text-blue-600 ml-auto" />
                          )}
                        </label>
                      ))}
                    </div>
                    {formData.weather_id.length > 0 && (
                      <p className="text-xs text-gray-500 mt-2">
                        Đã chọn: {formData.weather_id.length}
                      </p>
                    )}
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium mb-2">Tags</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" &&
                        (e.preventDefault(), handleAddTag())
                      }
                      placeholder="Thêm tag..."
                      className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-gray-100 rounded-full flex items-center gap-2"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="text-gray-500 hover:text-red-500"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Privacy */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_public"
                    checked={formData.is_public}
                    onChange={(e) =>
                      handleChange("is_public", e.target.checked)
                    }
                    className="w-4 h-4"
                  />
                  <label htmlFor="is_public" className="text-sm">
                    Công khai outfit (người khác có thể xem)
                  </label>
                </div>
              </div>
            </div>

            {/* Items Selection - Keep existing code */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">
                  Món đồ trong Outfit ({formData.items.length}/15)
                  <span className="text-red-500 ml-1">*</span>
                </h2>
                <button
                  type="button"
                  onClick={() => setShowItemPicker(!showItemPicker)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus size={20} />
                  Thêm món đồ
                </button>
              </div>

              {showItemPicker && (
                <div className="mb-4 p-4 border rounded-lg bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium">Chọn món đồ từ tủ đồ</h3>
                    <button
                      type="button"
                      onClick={() => setShowItemPicker(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="flex gap-2 mb-3">
                    <div className="flex-1 relative">
                      <Search
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        size={18}
                      />
                      <input
                        type="text"
                        value={itemSearchQuery}
                        onChange={(e) => setItemSearchQuery(e.target.value)}
                        placeholder="Tìm kiếm..."
                        className="w-full pl-10 pr-4 py-2 border rounded-lg"
                      />
                    </div>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="p-2 border rounded-lg"
                    >
                      <option value="all">Tất cả danh mục</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-96 overflow-y-auto">
                    {filteredWardrobeItems.map((item) => (
                      <div
                        key={item._id}
                        onClick={() => handleAddItem(item)}
                        className="cursor-pointer bg-white rounded-lg overflow-hidden border hover:border-blue-500 hover:shadow transition-all"
                      >
                        <div className="aspect-square bg-gray-100">
                          <img
                            src={item.image_url}
                            alt={item.item_name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-2">
                          <p className="text-sm font-medium truncate">
                            {item.item_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {item.category_id?.name}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {filteredWardrobeItems.length === 0 && (
                    <p className="text-center text-gray-500 py-8">
                      Không tìm thấy món đồ phù hợp
                    </p>
                  )}
                </div>
              )}

              {formData.items.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Shirt size={48} className="mx-auto mb-3 opacity-50" />
                  <p>Chưa có món đồ nào. Hãy thêm ít nhất 2 món đồ!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.items.map((item, index) => (
                    <div
                      key={item.item_id}
                      className="flex gap-3 p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex flex-col gap-1">
                        <button
                          type="button"
                          onClick={() => handleMoveItem(index, "up")}
                          disabled={index === 0}
                          className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"
                        >
                          <ChevronUp size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveItem(index, "down")}
                          disabled={index === formData.items.length - 1}
                          className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"
                        >
                          <ChevronDown size={16} />
                        </button>
                      </div>

                      <div className="w-20 h-20 flex-shrink-0 rounded overflow-hidden bg-gray-100">
                        <img
                          src={item.item_data?.image_url}
                          alt={item.item_data?.item_name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {item.item_data?.item_name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {item.item_data?.category_id?.name}
                        </p>

                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <select
                            value={item.layer_position || ""}
                            onChange={(e) =>
                              handleUpdateItemDetail(
                                item.item_id,
                                "layer_position",
                                e.target.value || null
                              )
                            }
                            className="text-sm p-1 border rounded"
                          >
                            <option value="">Layer</option>
                            <option value="base">Lớp trong</option>
                            <option value="mid">Lớp giữa</option>
                            <option value="outer">Lớp ngoài</option>
                          </select>

                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateItemDetail(
                                item.item_id,
                                "is_optional",
                                !item.is_optional
                              )
                            }
                            className={`text-xs px-2 py-1 rounded flex items-center gap-1 justify-center ${
                              item.is_optional
                                ? "bg-orange-100 text-orange-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {item.is_optional ? (
                              <EyeOff size={12} />
                            ) : (
                              <Eye size={12} />
                            )}
                            {item.is_optional ? "Optional" : "Required"}
                          </button>
                        </div>

                        <input
                          type="text"
                          value={item.styling_note || ""}
                          onChange={(e) =>
                            handleUpdateItemDetail(
                              item.item_id,
                              "styling_note",
                              e.target.value
                            )
                          }
                          placeholder="Ghi chú styling..."
                          className="w-full mt-2 p-1 text-sm border rounded"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.item_id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Ghi chú riêng tư</h2>
              <textarea
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                placeholder="Ghi chú cá nhân về outfit này (chỉ bạn nhìn thấy)..."
                rows={3}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 border rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    {isEditMode ? "Cập nhật" : "Tạo Trang phục"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </LayoutUser>
  );
}
