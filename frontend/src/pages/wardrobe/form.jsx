import LayoutUser from "@/components/layout/LayoutUser";
import { useState, useEffect } from "react";
import {
  Upload,
  X,
  Loader2,
  Plus,
  Tag as TagIcon,
  AlertCircle,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  Info,
} from "lucide-react";
import { useRouter } from "next/router";
import { useWardrobe } from "@/context/WardrobeContext";
import { useSettings } from "@/context/SettingContext";
import axios from "axios";

export default function ItemForm() {
  const router = useRouter();
  const { id } = router.query; // ID để edit
  const { addItem, updateItem, getItemDetails } = useWardrobe();
  const { settings, getByType } = useSettings();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false); // State loading cho AI
  const [selectedImage, setSelectedImage] = useState(null);
  const [tagInput, setTagInput] = useState("");
  const [errors, setErrors] = useState({});

  // Toast State
  const [toast, setToast] = useState({ show: false, message: "", type: "info" });

  const showToast = (message, type = "info") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000);
  };

  // Form data
  const [formData, setFormData] = useState({
    item_name: "",
    category_id: "",
    brand_id: "",
    color_id: [],
    season_id: [],
    material_id: "",
    size: "",
    purchase_date: "",
    price: "",
    image_url: "",
    style_tags: [],
    notes: "",
    is_favorite: false,
  });

  // Load item data nếu đang edit
  useEffect(() => {
    if (id) {
      loadItemData();
    }
  }, [id]);

  const loadItemData = async () => {
    setIsLoading(true);
    try {
      const result = await getItemDetails(id);
      if (result.success) {
        const item = result.data;
        setFormData({
          item_name: item.item_name || "",
          category_id: item.category_id?._id || item.category_id || "",
          brand_id: item.brand_id?._id || item.brand_id || "",
          color_id: Array.isArray(item.color_id)
            ? item.color_id.map((c) => c._id || c)
            : [],
          season_id: Array.isArray(item.season_id)
            ? item.season_id.map((s) => s._id || s)
            : [],
          material_id: item.material_id?._id || item.material_id || "",
          size: item.size || "",
          purchase_date: item.purchase_date
            ? item.purchase_date.split("T")[0]
            : "",
          price: item.price || "",
          image_url: item.image_url || "",
          style_tags: item.style_tags || [],
          notes: item.notes || "",
          is_favorite: item.is_favorite || false,
        });
        setSelectedImage(item.image_url);
      }
    } catch (error) {
      console.error("Error loading item:", error);
      showToast("Lỗi tải dữ liệu món đồ", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Get settings by type
  const categories = getByType("category").filter((s) => s.status === "Active");
  const brands = getByType("brand").filter((s) => s.status === "Active");
  const colors = getByType("color").filter((s) => s.status === "Active");
  const seasons = getByType("season").filter((s) => s.status === "Active");
  const materials = getByType("material").filter((s) => s.status === "Active");

  // Hàm gọi API phân tích ảnh (AI)
  const analyzeImageWithAI = async (base64Image) => {
    setIsAnalyzing(true);
    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const response = await axios.post(
        `${API_URL}/api/wardrobe/analyze`,
        { imageBase64: base64Image },
        { timeout: 60000 } // Timeout 60s
      );

      if (response.data.success) {
        const aiData = response.data.data;
        console.log("✨ AI Result:", aiData);

        // ✅ Kiểm tra dữ liệu trước khi set
        if (
          aiData.category_id ||
          aiData.color_id?.length ||
          aiData.season_id?.length
        ) {
          setFormData((prev) => ({
            ...prev,
            category_id: aiData.category_id || prev.category_id,
            color_id: aiData.color_id?.length ? aiData.color_id : prev.color_id,
            season_id: aiData.season_id?.length
              ? aiData.season_id
              : prev.season_id,
            style_tags: [
              ...new Set([...prev.style_tags, ...(aiData.style_tags || [])]),
            ],
            notes: aiData.notes || prev.notes,
          }));

          // Thông báo thành công
          showToast("AI đã phân tích xong! Vui lòng kiểm tra lại thông tin.", "success");
        } else {
          showToast("AI không nhận diện được, vui lòng nhập thủ công.", "warning");
        }
      }
    } catch (error) {
      console.error("AI Analysis failed:", error);
      // Thông báo lỗi chi tiết hơn
      if (error.code === "ECONNABORTED") {
        showToast("AI đang xử lý quá lâu. Vui lòng thử lại hoặc nhập thủ công.", "error");
      } else if (error.response?.status === 503) {
        showToast("AI Service chưa được khởi động. Vui lòng kiểm tra terminal.", "error");
      } else {
        showToast("Lỗi kết nối AI. Vui lòng thử lại hoặc nhập thủ công.", "error");
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast("File ảnh quá lớn! Vui lòng chọn ảnh dưới 5MB.", "error");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result;
        setSelectedImage(base64Image);
        // Reset fields when new image is uploaded to avoid mixing data
        setFormData((prev) => ({
          ...prev,
          image_url: base64Image,
          // Reset AI-related fields
          category_id: "",
          color_id: [],
          season_id: [],
          style_tags: [],
          notes: "",
        }));
        setErrors((prev) => ({ ...prev, image_url: null }));

        // === KÍCH HOẠT AI NẾU ĐANG TẠO MỚI ===
        if (!id) {
          await analyzeImageWithAI(base64Image);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle multi-select (color, season)
  const handleMultiSelect = (field, value) => {
    setFormData((prev) => {
      const currentValues = prev[field];
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value];
      return { ...prev, [field]: newValues };
    });
  };

  // Handle style tags
  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag && !formData.style_tags.includes(tag)) {
      if (formData.style_tags.length >= 20) {
        showToast("Chỉ được thêm tối đa 20 tags", "warning");
        return;
      }
      setFormData((prev) => ({
        ...prev,
        style_tags: [...prev.style_tags, tag],
      }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      style_tags: prev.style_tags.filter((t) => t !== tagToRemove),
    }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.item_name.trim()) {
      newErrors.item_name = "Tên món đồ là bắt buộc";
    }

    if (!formData.category_id) {
      newErrors.category_id = "Vui lòng chọn danh mục";
    }

    if (!formData.image_url) {
      newErrors.image_url = "Vui lòng tải lên ảnh món đồ";
    }

    if (formData.price && formData.price < 0) {
      newErrors.price = "Giá không được âm";
    }

    if (formData.notes && formData.notes.length > 1000) {
      newErrors.notes = "Ghi chú không được quá 1000 ký tự";
    }

    // Bắt lỗi Ngày mua không được lớn hơn ngày hiện tại ===
    if (formData.purchase_date) {
      const purchaseDate = new Date(formData.purchase_date);
      const today = new Date();
      // Thiết lập giờ, phút, giây về 0 để so sánh chỉ ngày, tháng, năm
      today.setHours(0, 0, 0, 0);

      if (purchaseDate > today) {
        newErrors.purchase_date = "Ngày mua không được lớn hơn ngày hiện tại";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast("Vui lòng kiểm tra lại thông tin", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        item_name: formData.item_name.trim(),
        category_id: formData.category_id,
        brand_id: formData.brand_id || null,
        color_id: formData.color_id,
        season_id: formData.season_id,
        material_id: formData.material_id || null,
        size: formData.size || null,
        purchase_date: formData.purchase_date || null,
        price: formData.price ? parseFloat(formData.price) : null,
        image_url: formData.image_url,
        style_tags: formData.style_tags,
        notes: formData.notes || null,
        is_favorite: formData.is_favorite,
      };

      let result;
      if (id) {
        result = await updateItem(id, payload);
      } else {
        result = await addItem(payload);
      }

      if (result.success) {
        showToast(id ? "Cập nhật thành công!" : "Thêm món đồ thành công!", "success");
        setTimeout(() => router.push("/wardrobe/wardrobe"), 1500); // Wait for toast
      } else {
        throw new Error(result.error || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.error("❌ Error details:", error);
      showToast(
        "Lỗi: " +
        (error.response?.data?.message || error.message || "Vui lòng thử lại"),
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <LayoutUser>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600"></div>
        </div>
      </LayoutUser>
    );
  }

  return (
    <LayoutUser>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {id ? "Chỉnh sửa món đồ" : "Thêm món đồ mới"}
          </h1>
          <p className="text-gray-500 mt-1">
            Điền thông tin chi tiết về món đồ của bạn
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. UPLOAD ẢNH */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
            <label className="block text-sm font-semibold text-gray-700 mb-4">
              Hình ảnh <span className="text-red-500">*</span>
            </label>

            {/* AI Loading Overlay */}
            {isAnalyzing && (
              <div className="absolute inset-0 bg-white/80 z-20 flex flex-col items-center justify-center backdrop-blur-[2px]">
                <Sparkles className="w-10 h-10 text-purple-600 animate-pulse mb-3" />
                <p className="text-purple-700 font-semibold animate-pulse text-lg">
                  AI đang phân tích...
                </p>
                <p className="text-sm text-purple-500 mt-1">
                  Đang nhận diện loại đồ, màu sắc & phong cách
                </p>
              </div>
            )}

            {!selectedImage ? (
              <label
                className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl cursor-pointer hover:bg-gray-50 transition-colors group ${errors.image_url
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300"
                  }`}
              >
                <div
                  className={`p-4 rounded-full mb-3 ${errors.image_url
                      ? "bg-red-100"
                      : "bg-purple-50 group-hover:bg-purple-100"
                    } transition-colors`}
                >
                  <Upload
                    className={`w-8 h-8 ${errors.image_url ? "text-red-600" : "text-purple-600"
                      }`}
                  />
                </div>
                <p className="text-sm font-medium text-gray-700">
                  Nhấn để tải ảnh lên
                </p>
                <p className="text-xs text-gray-500 mt-1">PNG, JPG (max 5MB)</p>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </label>
            ) : (
              <div className="relative w-full h-96 bg-gray-50 rounded-xl overflow-hidden border border-gray-200 group">
                <img
                  src={selectedImage}
                  alt="Preview"
                  className="w-full h-full object-contain"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <label className="p-3 bg-white text-purple-600 rounded-full hover:bg-purple-50 cursor-pointer">
                    <Upload className="w-6 h-6" />
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedImage(null);
                      setFormData((prev) => ({ ...prev, image_url: "" }));
                    }}
                    className="p-3 bg-white text-red-600 rounded-full hover:bg-red-50"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
            )}
            {errors.image_url && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.image_url}
              </p>
            )}
          </div>

          {/* 2. THÔNG TIN CƠ BẢN */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Thông tin cơ bản
            </h3>

            {/* Tên món đồ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên món đồ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.item_name}
                onChange={(e) => {
                  setFormData({ ...formData, item_name: e.target.value });
                  setErrors({ ...errors, item_name: null });
                }}
                className={`w-full px-4 py-3 rounded-lg border ${errors.item_name ? "border-red-300" : "border-gray-300"
                  } focus:ring-2 focus:ring-purple-100 focus:border-purple-500 outline-none`}
                placeholder="Ví dụ: Áo sơ mi trắng Oxford"
              />
              {errors.item_name && (
                <p className="mt-1 text-sm text-red-600">{errors.item_name}</p>
              )}
            </div>

            {/* Danh mục & Size */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Danh mục <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) => {
                    setFormData({ ...formData, category_id: e.target.value });
                    setErrors({ ...errors, category_id: null });
                  }}
                  className={`w-full px-4 py-3 rounded-lg border ${errors.category_id ? "border-red-300" : "border-gray-300"
                    } focus:ring-2 focus:ring-purple-100 focus:border-purple-500 outline-none`}
                >
                  <option value="">-- Chọn danh mục --</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {errors.category_id && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.category_id}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Size
                </label>
                <input
                  type="text"
                  value={formData.size}
                  onChange={(e) =>
                    setFormData({ ...formData, size: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-100 focus:border-purple-500 outline-none"
                  placeholder="S, M, L, XL, 38, 40..."
                  maxLength={20}
                />
              </div>
            </div>

            {/* Thương hiệu */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thương hiệu
              </label>
              <select
                value={formData.brand_id}
                onChange={(e) =>
                  setFormData({ ...formData, brand_id: e.target.value })
                }
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-100 focus:border-purple-500 outline-none"
              >
                <option value="">-- Chọn thương hiệu --</option>
                {brands.map((brand) => (
                  <option key={brand._id} value={brand._id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 3. THUỘC TÍNH */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Thuộc tính</h3>

            {/* Màu sắc - Multi-select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Màu sắc (Có thể chọn nhiều)
              </label>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                  <button
                    key={color._id}
                    type="button"
                    onClick={() => handleMultiSelect("color_id", color._id)}
                    className={`px-4 py-2 rounded-lg border-2 transition-all ${formData.color_id.includes(color._id)
                        ? "border-purple-600 bg-purple-50 text-purple-700 font-semibold"
                        : "border-gray-200 hover:border-purple-300 text-gray-700"
                      }`}
                  >
                    {color.name}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Đã chọn: {formData.color_id.length} màu
              </p>
            </div>

            {/* Mùa - Multi-select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Mùa phù hợp (Có thể chọn nhiều)
              </label>
              <div className="flex flex-wrap gap-2">
                {seasons.map((season) => (
                  <button
                    key={season._id}
                    type="button"
                    onClick={() => handleMultiSelect("season_id", season._id)}
                    className={`px-4 py-2 rounded-lg border-2 transition-all ${formData.season_id.includes(season._id)
                        ? "border-blue-600 bg-blue-50 text-blue-700 font-semibold"
                        : "border-gray-200 hover:border-blue-300 text-gray-700"
                      }`}
                  >
                    {season.name}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Đã chọn: {formData.season_id.length} mùa
              </p>
            </div>

            {/* Chất liệu */}
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chất liệu
                </label>
                <select
                  value={formData.material_id}
                  onChange={(e) =>
                    setFormData({ ...formData, material_id: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-100 focus:border-purple-500 outline-none"
                >
                  <option value="">-- Chọn chất liệu --</option>
                  {materials.map((material) => (
                    <option key={material._id} value={material._id}>
                      {material.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 4. THÔNG TIN MUA SẮM */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Thông tin mua sắm
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày mua
                </label>
                <input
                  type="date"
                  value={formData.purchase_date}
                  onChange={(e) => {
                    setFormData({ ...formData, purchase_date: e.target.value });
                    setErrors({ ...errors, purchase_date: null }); // Xóa lỗi khi người dùng thay đổi
                  }}
                  className={`w-full px-4 py-3 rounded-lg border ${errors.purchase_date ? "border-red-300" : "border-gray-300"
                    } focus:ring-2 focus:ring-purple-100 focus:border-purple-500 outline-none`}
                />
                {errors.purchase_date && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.purchase_date}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giá (VNĐ)
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-100 focus:border-purple-500 outline-none"
                  placeholder="500000"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* 5. STYLE TAGS & NOTES */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Ghi chú & Tags
            </h3>

            {/* Style Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Style Tags (Tối đa 20 tags)
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), handleAddTag())
                  }
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-100 focus:border-purple-500 outline-none"
                  placeholder="VD: casual, streetwear, formal..."
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Thêm
                </button>
              </div>
              {formData.style_tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.style_tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium"
                    >
                      <TagIcon className="w-3 h-3" />
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

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ghi chú
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={4}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-100 focus:border-purple-500 outline-none resize-none"
                placeholder="Ghi chú về món đồ, cách phối đồ, dịp phù hợp..."
                maxLength={1000}
              />
              <p className="text-xs text-gray-500 mt-1 text-right">
                {formData.notes.length}/1000 ký tự
              </p>
            </div>

            {/* Favorite checkbox */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_favorite"
                checked={formData.is_favorite}
                onChange={(e) =>
                  setFormData({ ...formData, is_favorite: e.target.checked })
                }
                className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
              />
              <label
                htmlFor="is_favorite"
                className="text-sm font-medium text-gray-700 cursor-pointer"
              >
                ⭐ Đánh dấu là món đồ yêu thích
              </label>
            </div>
          </div>

          {/* SUBMIT BUTTONS */}
          <div className="flex items-center gap-4 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-medium rounded-xl hover:from-purple-700 hover:to-pink-600 transition-all shadow-lg flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {id ? "Đang cập nhật..." : "Đang lưu..."}
                </>
              ) : (
                <>{id ? "Cập nhật" : "Thêm vào tủ đồ"}</>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* TOAST NOTIFICATION */}
      {toast.show && (
        <div className="fixed top-24 right-6 z-[100] animate-in slide-in-from-right fade-in duration-300">
          <div
            className={`flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border ${toast.type === "success"
                ? "bg-white border-green-500 text-green-700"
                : toast.type === "error"
                  ? "bg-white border-red-500 text-red-700"
                  : toast.type === "warning"
                    ? "bg-white border-yellow-500 text-yellow-700"
                    : "bg-white border-blue-500 text-blue-700"
              }`}
          >
            {toast.type === "success" && <CheckCircle className="w-6 h-6 text-green-500" />}
            {toast.type === "error" && <AlertCircle className="w-6 h-6 text-red-500" />}
            {toast.type === "warning" && <AlertTriangle className="w-6 h-6 text-yellow-500" />}
            {toast.type === "info" && <Info className="w-6 h-6 text-blue-500" />}

            <div>
              <p className="font-semibold text-sm">{toast.message}</p>
            </div>

            <button
              onClick={() => setToast((prev) => ({ ...prev, show: false }))}
              className="ml-4 hover:opacity-70 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </LayoutUser>
  );
}
