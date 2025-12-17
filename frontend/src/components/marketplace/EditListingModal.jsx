//frontend/src/components/marketplace/EditListingModal.jsx
import { useState, useEffect } from "react";
import { X, Save, AlertCircle } from "lucide-react";
import { useMarketplace } from "@/context/MarketplaceContext";

export default function EditListingModal({ listing, isOpen, onClose, onSuccess }) {
  const { editListing } = useMarketplace();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    listing_type: listing.listing_type,
    selling_price: listing.selling_price || "",
    condition: listing.condition,
    condition_note: listing.condition_note || "",
    description: listing.description,
    shipping_method: listing.shipping_method,
    shipping_fee: listing.shipping_fee || 0,
    status: listing.status,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validation
      if (
        (formData.listing_type === "sell" || formData.listing_type === "both") &&
        !formData.selling_price
      ) {
        throw new Error("Vui lòng nhập giá bán");
      }

      if (!formData.description || formData.description.length < 10) {
        throw new Error("Mô tả phải có ít nhất 10 ký tự");
      }

      // Prepare data
      const updateData = { ...formData };
      
      // Remove selling_price if listing_type = swap
      if (formData.listing_type === "swap") {
        delete updateData.selling_price;
      }

      await editListing(listing._id, updateData);

      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Error updating listing:", err);
      setError(err.message || err.error || "Không thể cập nhật listing");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Chỉnh sửa listing</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Item Preview */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <img
              src={listing.item_id?.image_url}
              alt={listing.item_id?.item_name}
              className="w-20 h-20 object-cover rounded-lg"
            />
            <div>
              <h3 className="font-semibold text-gray-900">
                {listing.item_id?.item_name}
              </h3>
              <p className="text-sm text-gray-600">
                {listing.item_id?.category_id?.name}
              </p>
            </div>
          </div>

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

          {/* Price */}
          {formData.listing_type !== "swap" && (
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
                required={formData.listing_type !== "swap"}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
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
              rows={4}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              {formData.description.length} / 2000 ký tự
            </p>
          </div>

          {/* Shipping */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phương thức vận chuyển
              </label>
              <select
                name="shipping_method"
                value={formData.shipping_method}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="ghn">Giao Hàng Nhanh</option>
                <option value="ghtk">Giao Hàng Tiết Kiệm</option>
                <option value="viettel_post">Viettel Post</option>
                <option value="self_delivery">Tự giao hàng</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phí ship (VNĐ)
              </label>
              <input
                type="number"
                name="shipping_fee"
                value={formData.shipping_fee}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trạng thái
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            >
              <option value="active">Đang bán</option>
              <option value="inactive">Tạm ẩn</option>
            </select>
          </div>
        </form>

        {/* Footer */}
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
                Đang lưu...
              </>
            ) : (
              <>
                <Save size={20} />
                Lưu thay đổi
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}