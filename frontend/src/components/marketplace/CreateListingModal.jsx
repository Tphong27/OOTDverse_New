//frontend/src/components/marketplace/CreateListingModal.jsx
import { useState, useEffect } from "react";
import { X, Check, AlertCircle, Truck } from "lucide-react";
import { useMarketplace } from "@/context/MarketplaceContext";
import { useWardrobe } from "@/context/WardrobeContext";
import { useAuth } from "@/context/AuthContext";

export default function CreateListingModal({ isOpen, onClose, onSuccess }) {
  const { user } = useAuth();
  const { addListing } = useMarketplace();
  const { items } = useWardrobe();

  const [step, setStep] = useState(1); // 1: Select Item, 2: Listing Details
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    item_id: "",
    listing_type: "sell",
    selling_price: "",
    condition: "like_new",
    condition_note: "",
    description: "",
    shipping_method: "ghn",
    shipping_fee: 30000,
    swap_preferences: {
      categories: [],
      brands: [],
      sizes: [],
      note: "",
    },
  });

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setFormData({
        item_id: "",
        listing_type: "sell",
        selling_price: "",
        condition: "like_new",
        condition_note: "",
        description: "",
        shipping_method: "ghn",
        shipping_fee: 30000,
        swap_preferences: {
          categories: [],
          brands: [],
          sizes: [],
          note: "",
        },
      });
      setError(null);
    }
  }, [isOpen]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Kiểm tra user đã đăng nhập chưa
      if (!user || !user._id) {
        throw new Error("Bạn cần đăng nhập để đăng bán");
      }

      // Validation
      if (!formData.item_id) {
        throw new Error("Vui lòng chọn món đồ");
      }

      if (
        (formData.listing_type === "sell" ||
          formData.listing_type === "both") &&
        !formData.selling_price
      ) {
        throw new Error("Vui lòng nhập giá bán");
      }

      if (!formData.description || formData.description.length < 10) {
        throw new Error("Mô tả phải có ít nhất 10 ký tự");
      }

      // Thêm seller_id vào formData
      const listingData = {
        ...formData,
        seller_id: user._id,
      };

      if (formData.listing_type === "swap") {
        delete listingData.selling_price;
      }

      console.log("📤 Creating listing with data:", listingData);

      // Create listing
      await addListing(listingData);

      // Success
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error("❌ Error creating listing:", err);
      setError(err.message || err.error || "Không thể tạo listing");
    } finally {
      setLoading(false);
    }
  };

  // Selected item
  const selectedItem = items.find((item) => item._id === formData.item_id);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Đăng bán món đồ</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Error Alert */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle
                  className="text-red-600 flex-shrink-0 mt-0.5"
                  size={20}
                />
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {/* Step 1: Select Item */}
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  1. Chọn món đồ từ tủ đồ của bạn
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                  {items
                    .filter((item) => item.is_active)
                    .map((item) => (
                      <div
                        key={item._id}
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            item_id: item._id,
                          }))
                        }
                        className={`cursor-pointer rounded-lg border-2 transition-all ${
                          formData.item_id === item._id
                            ? "border-pink-500 ring-2 ring-pink-200"
                            : "border-gray-200 hover:border-pink-300"
                        }`}
                      >
                        <img
                          src={item.image_url}
                          alt={item.item_name}
                          className="w-full aspect-square object-cover rounded-t-lg"
                        />
                        <div className="p-2">
                          <p className="text-sm font-medium text-gray-900 line-clamp-1">
                            {item.item_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {item.category_id?.name}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!formData.item_id}
                  className="w-full py-3 rounded-lg bg-pink-500 text-white font-semibold hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Tiếp theo
                </button>
              </div>
            )}

            {/* Step 2: Listing Details */}
            {step === 2 && (
              <div className="space-y-6">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-pink-600 hover:text-pink-700 text-sm font-medium"
                >
                  ← Quay lại chọn món đồ
                </button>

                {/* Selected Item Preview */}
                {selectedItem && (
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <img
                      src={selectedItem.image_url}
                      alt={selectedItem.item_name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">
                        {selectedItem.item_name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {selectedItem.category_id?.name} •{" "}
                        {selectedItem.brand_id?.name}
                      </p>
                    </div>
                  </div>
                )}

                {/* Listing Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loại tin đăng *
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: "sell", label: "Chỉ bán" },
                      { value: "swap", label: "Chỉ swap" },
                      { value: "both", label: "Bán & Swap" },
                    ].map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            listing_type: type.value,
                          }))
                        }
                        className={`py-3 px-4 rounded-lg border-2 font-medium transition-all ${
                          formData.listing_type === type.value
                            ? "border-pink-500 bg-pink-50 text-pink-700"
                            : "border-gray-200 hover:border-pink-300"
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price (if sell or both) */}
                {(formData.listing_type === "sell" ||
                  formData.listing_type === "both") && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Giá bán * (VNĐ)
                    </label>
                    <input
                      type="number"
                      name="selling_price"
                      value={formData.selling_price}
                      onChange={handleChange}
                      placeholder="500000"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      required
                    />
                  </div>
                )}

                {/* Condition */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tình trạng *
                  </label>
                  <select
                    name="condition"
                    value={formData.condition}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    <option value="new">Mới 100%</option>
                    <option value="like_new">Như mới (95-99%)</option>
                    <option value="good">Tốt (80-94%)</option>
                    <option value="fair">Khá (60-79%)</option>
                    <option value="worn">Đã sử dụng (&lt;60%)</option>
                  </select>
                </div>

                {/* Condition Note */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ghi chú tình trạng
                  </label>
                  <input
                    type="text"
                    name="condition_note"
                    value={formData.condition_note}
                    onChange={handleChange}
                    placeholder="VD: Còn mới, chưa qua sử dụng"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mô tả * (Tối thiểu 10 ký tự)
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Mô tả chi tiết về món đồ: Kích thước, màu sắc, chất liệu, lý do bán..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {formData.description.length} / 2000 ký tự
                  </p>
                </div>

                {/* === SHIPPING CONFIGURATION === */}
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-blue-900 flex items-center gap-2">
                    <Truck size={20} />
                    Giao hàng
                  </h3>

                  {/* Platform Shipping */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={
                          formData.shipping_config?.platform_shipping_enabled ??
                          true
                        }
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            shipping_config: {
                              ...prev.shipping_config,
                              platform_shipping_enabled: e.target.checked,
                            },
                          }))
                        }
                        className="w-5 h-5 text-pink-600 rounded focus:ring-2 focus:ring-pink-500"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 group-hover:text-pink-600 transition-colors">
                          Cho phép vận chuyển qua nền tảng
                        </p>
                        <p className="text-sm text-gray-600">
                          GHN, GHTK, Viettel Post (Người mua chọn & thanh toán
                          phí ship)
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Self Delivery */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={
                          formData.shipping_config?.self_delivery_enabled ??
                          false
                        }
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            shipping_config: {
                              ...prev.shipping_config,
                              self_delivery_enabled: e.target.checked,
                            },
                          }))
                        }
                        className="w-5 h-5 text-pink-600 rounded focus:ring-2 focus:ring-pink-500"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 group-hover:text-pink-600 transition-colors">
                          Cho phép tự giao hàng / Gặp mặt
                        </p>
                        <p className="text-sm text-gray-600">
                          Bạn tự vận chuyển hoặc hẹn gặp người mua
                        </p>
                      </div>
                    </label>

                    {/* Fixed Shipping Fee (if self delivery enabled) */}
                    {formData.shipping_config?.self_delivery_enabled && (
                      <div className="ml-8 space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Phí ship cố định (VNĐ) - Tùy chọn
                        </label>
                        <input
                          type="number"
                          min="0"
                          placeholder="0"
                          value={
                            formData.shipping_config?.fixed_shipping_fee || ""
                          }
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              shipping_config: {
                                ...prev.shipping_config,
                                fixed_shipping_fee:
                                  parseFloat(e.target.value) || 0,
                              },
                            }))
                          }
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        />
                        <p className="text-xs text-gray-500">
                          Để trống hoặc nhập 0 nếu miễn phí ship
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Shipping Regions */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Khu vực giao hàng *
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.shipping_config?.shipping_regions?.includes(
                            "hanoi"
                          )}
                          onChange={(e) => {
                            const regions =
                              formData.shipping_config?.shipping_regions || [];
                            setFormData((prev) => ({
                              ...prev,
                              shipping_config: {
                                ...prev.shipping_config,
                                shipping_regions: e.target.checked
                                  ? [...regions, "hanoi"]
                                  : regions.filter((r) => r !== "hanoi"),
                              },
                            }));
                          }}
                          className="w-4 h-4 text-pink-600 rounded"
                        />
                        <span className="text-sm text-gray-700">Hà Nội</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.shipping_config?.shipping_regions?.includes(
                            "hcm"
                          )}
                          onChange={(e) => {
                            const regions =
                              formData.shipping_config?.shipping_regions || [];
                            setFormData((prev) => ({
                              ...prev,
                              shipping_config: {
                                ...prev.shipping_config,
                                shipping_regions: e.target.checked
                                  ? [...regions, "hcm"]
                                  : regions.filter((r) => r !== "hcm"),
                              },
                            }));
                          }}
                          className="w-4 h-4 text-pink-600 rounded"
                        />
                        <span className="text-sm text-gray-700">
                          TP. Hồ Chí Minh
                        </span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.shipping_config?.shipping_regions?.includes(
                            "nationwide"
                          )}
                          onChange={(e) => {
                            const regions =
                              formData.shipping_config?.shipping_regions || [];
                            setFormData((prev) => ({
                              ...prev,
                              shipping_config: {
                                ...prev.shipping_config,
                                shipping_regions: e.target.checked
                                  ? [...regions, "nationwide"]
                                  : regions.filter((r) => r !== "nationwide"),
                              },
                            }));
                          }}
                          className="w-4 h-4 text-pink-600 rounded"
                        />
                        <span className="text-sm text-gray-700">Toàn quốc</span>
                      </label>
                    </div>
                  </div>

                  {/* Shipping Note */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Ghi chú về giao hàng
                    </label>
                    <textarea
                      rows={2}
                      placeholder="VD: Chỉ giao trong giờ hành chính, cần hẹn trước..."
                      value={formData.shipping_config?.shipping_note || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          shipping_config: {
                            ...prev.shipping_config,
                            shipping_note: e.target.value,
                          },
                        }))
                      }
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                  </div>

                  {/* Location for shipping calculation */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Địa điểm lấy hàng (để tính phí ship)
                    </label>
                    <input
                      type="text"
                      placeholder="Tỉnh/Thành phố"
                      value={formData.shipping_from_location?.province || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          shipping_from_location: {
                            ...prev.shipping_from_location,
                            province: e.target.value,
                          },
                        }))
                      }
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
              </div>
            )}
          </form>
        </div>
        {/* Footer */}
        {step === 2 && (
          <div className="p-6 border-t border-gray-200 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 py-3 rounded-lg bg-pink-500 text-white font-semibold hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Đang đăng...
                </>
              ) : (
                <>
                  <Check size={20} />
                  Đăng bán
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
