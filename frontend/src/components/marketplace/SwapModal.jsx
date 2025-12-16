//frontend/src/components/marketplace/SwapModal.jsx
import { useState, useEffect } from "react";
import { X, RefreshCw, MapPin, AlertCircle, Check } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useWardrobe } from "@/context/WardrobeContext";
import { useSwap } from "@/context/SwapContext";
import { useRouter } from "next/router";

export default function SwapModal({ listing, onClose }) {
  const router = useRouter();
  const { user } = useAuth();
  const { items } = useWardrobe();
  const { sendSwapRequest } = useSwap();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1); // 1: Select Item, 2: Address & Message

  const [selectedItemId, setSelectedItemId] = useState(null);
  const [formData, setFormData] = useState({
    requester_message: "",
    requester_address: {
      recipient_name: user?.fullName || "",
      phone: user?.phone || "",
      province: "",
      district: "",
      ward: "",
      address: "",
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("requester_address.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        requester_address: {
          ...prev.requester_address,
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validation
      if (!selectedItemId) {
        throw new Error("Vui lòng chọn món đồ để swap");
      }

      const { recipient_name, phone, address } = formData.requester_address;
      if (!recipient_name || !phone || !address) {
        throw new Error("Vui lòng điền đầy đủ thông tin giao hàng");
      }

      // Find selected item's listing
      // Note: User cần có listing cho item này
      // Để đơn giản, giả sử user đã tạo listing cho item
      // Trong thực tế, cần check hoặc auto-create listing

      const swapData = {
        receiver_id: listing.seller_id._id,
        requester_listing_id: selectedItemId, // This should be listing ID, not item ID
        receiver_listing_id: listing._id,
        ...formData,
      };

      const swapRequest = await sendSwapRequest(swapData);

      // Success - redirect to swap requests page
      router.push(`/swap-requests/${swapRequest._id}`);
      onClose();
    } catch (err) {
      console.error("Error creating swap request:", err);
      setError(err.message || err.error || "Không thể gửi yêu cầu swap");
    } finally {
      setLoading(false);
    }
  };

  // Filter active items
  const activeItems = items.filter((item) => item.is_active);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <RefreshCw size={24} />
            Đề xuất Swap
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[calc(90vh-200px)] overflow-y-auto">
          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Their Item */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h3 className="font-semibold text-purple-900 mb-3">
              Món đồ bạn muốn nhận
            </h3>
            <div className="flex items-center gap-4">
              <img
                src={listing.item_id?.image_url}
                alt={listing.item_id?.item_name}
                className="w-20 h-20 object-cover rounded-lg"
              />
              <div>
                <h4 className="font-semibold text-gray-900">
                  {listing.item_id?.item_name}
                </h4>
                <p className="text-sm text-gray-600">
                  {listing.item_id?.category_id?.name}
                </p>
                {listing.item_id?.brand_id && (
                  <p className="text-sm text-gray-600">
                    {listing.item_id.brand_id.name}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Step 1: Select Your Item */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                1. Chọn món đồ của bạn để swap
              </h3>

              {activeItems.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Bạn chưa có món đồ nào trong tủ</p>
                  <button
                    onClick={() => router.push("/wardrobe")}
                    className="mt-4 text-pink-600 hover:text-pink-700 underline"
                  >
                    Thêm món đồ ngay
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
                    {activeItems.map((item) => (
                      <div
                        key={item._id}
                        onClick={() => setSelectedItemId(item._id)}
                        className={`cursor-pointer rounded-lg border-2 transition-all ${
                          selectedItemId === item._id
                            ? "border-purple-500 ring-2 ring-purple-200"
                            : "border-gray-200 hover:border-purple-300"
                        }`}
                      >
                        <div className="relative">
                          <img
                            src={item.image_url}
                            alt={item.item_name}
                            className="w-full aspect-square object-cover rounded-t-lg"
                          />
                          {selectedItemId === item._id && (
                            <div className="absolute top-2 right-2 bg-purple-500 text-white rounded-full p-1">
                              <Check size={16} />
                            </div>
                          )}
                        </div>
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
                    disabled={!selectedItemId}
                    className="w-full py-3 rounded-lg bg-purple-500 text-white font-semibold hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Tiếp theo
                  </button>
                </>
              )}
            </div>
          )}

          {/* Step 2: Address & Message */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-purple-600 hover:text-purple-700 text-sm font-medium"
              >
                ← Quay lại chọn món đồ
              </button>

              {/* Selected Item Preview */}
              {selectedItemId && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="font-semibold text-purple-900 mb-3">
                    Món đồ bạn muốn trao đổi
                  </h3>
                  <div className="flex items-center gap-4">
                    {(() => {
                      const item = activeItems.find((i) => i._id === selectedItemId);
                      return (
                        <>
                          <img
                            src={item.image_url}
                            alt={item.item_name}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                          <div>
                            <h4 className="font-semibold text-gray-900">{item.item_name}</h4>
                            <p className="text-sm text-gray-600">{item.category_id?.name}</p>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* Shipping Address */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <MapPin size={20} />
                  Địa chỉ nhận hàng của bạn
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Họ tên *
                    </label>
                    <input
                      type="text"
                      name="requester_address.recipient_name"
                      value={formData.requester_address.recipient_name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số điện thoại *
                    </label>
                    <input
                      type="tel"
                      name="requester_address.phone"
                      value={formData.requester_address.phone}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <input
                    type="text"
                    name="requester_address.province"
                    value={formData.requester_address.province}
                    onChange={handleChange}
                    placeholder="Tỉnh/TP"
                    className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    name="requester_address.district"
                    value={formData.requester_address.district}
                    onChange={handleChange}
                    placeholder="Quận/Huyện"
                    className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    name="requester_address.ward"
                    value={formData.requester_address.ward}
                    onChange={handleChange}
                    placeholder="Phường/Xã"
                    className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <input
                    type="text"
                    name="requester_address.address"
                    value={formData.requester_address.address}
                    onChange={handleChange}
                    placeholder="Địa chỉ cụ thể *"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lời nhắn (tùy chọn)
                </label>
                <textarea
                  name="requester_message"
                  value={formData.requester_message}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Gửi lời nhắn đến người bán..."
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </form>
          )}
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
              className="flex-1 py-3 rounded-lg bg-purple-500 text-white font-semibold hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Đang gửi...
                </div>
              ) : (
                "Gửi yêu cầu Swap"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}