//frontend/src/components/marketplace/BuyModal.jsx
import { useState } from "react";
import { X, MapPin, CreditCard, Truck, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useOrder } from "@/context/OrderContext";
import { useRouter } from "next/router";

export default function BuyModal({ listing, onClose }) {
  const router = useRouter();
  const { user } = useAuth();
  const { placeOrder } = useOrder();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1); // 1: Shipping Info, 2: Payment Method, 3: Confirm

  const [formData, setFormData] = useState({
    shipping_address: {
      recipient_name: user?.fullName || "",
      phone: user?.phone || "",
      province: "",
      district: "",
      ward: "",
      address: "",
    },
    shipping_method: listing.shipping_method || "ghn",
    payment_method: "cod",
    buyer_note: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("shipping_address.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        shipping_address: {
          ...prev.shipping_address,
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
      const { recipient_name, phone, address } = formData.shipping_address;
      if (!recipient_name || !phone || !address) {
        throw new Error("Vui lòng điền đầy đủ thông tin giao hàng");
      }

      // Create order
      const orderData = {
        listing_id: listing._id,
        ...formData,
      };

      const order = await placeOrder(orderData);

      // Redirect to order detail
      // router.push(`/orders/${order._id}`);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("marketplaceTab", "orders");
      }

      // router.push("/marketplace?tab=orders");
      onClose();
      // window.location.reload(); // Nếu cần
    } catch (err) {
      console.error("Error placing order:", err);
      setError(err.message || err.error || "Không thể tạo đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const totalAmount =
    listing.selling_price +
    (listing.shipping_fee || 0) +
    listing.selling_price * 0.05; // 5% platform fee

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            Xác nhận đơn hàng
          </h2>
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
              <AlertCircle
                className="text-red-600 flex-shrink-0 mt-0.5"
                size={20}
              />
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Product Info */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <img
              src={listing.item_id?.image_url}
              alt={listing.item_id?.item_name}
              className="w-20 h-20 object-cover rounded-lg"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">
                {listing.item_id?.item_name}
              </h3>
              <p className="text-sm text-gray-600">
                {listing.item_id?.category_id?.name}
              </p>
              <p className="text-lg font-bold text-pink-600 mt-1">
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(listing.selling_price)}
              </p>
            </div>
          </div>

          {/* Step 1: Shipping Address */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <MapPin size={20} />
              Thông tin giao hàng
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Họ tên người nhận *
                </label>
                <input
                  type="text"
                  name="shipping_address.recipient_name"
                  value={formData.shipping_address.recipient_name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số điện thoại *
                </label>
                <input
                  type="tel"
                  name="shipping_address.phone"
                  value={formData.shipping_address.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tỉnh/Thành phố
                </label>
                <input
                  type="text"
                  name="shipping_address.province"
                  value={formData.shipping_address.province}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quận/Huyện
                </label>
                <input
                  type="text"
                  name="shipping_address.district"
                  value={formData.shipping_address.district}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phường/Xã
                </label>
                <input
                  type="text"
                  name="shipping_address.ward"
                  value={formData.shipping_address.ward}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Địa chỉ cụ thể *
              </label>
              <input
                type="text"
                name="shipping_address.address"
                value={formData.shipping_address.address}
                onChange={handleChange}
                placeholder="Số nhà, tên đường..."
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Step 2: Shipping & Payment Method */}
          <div className="grid grid-cols-2 gap-6">
            {/* Shipping Method */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                <Truck size={20} />
                Vận chuyển
              </h3>
              <select
                name="shipping_method"
                value={formData.shipping_method}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="ghn">Giao Hàng Nhanh</option>
                <option value="ghtk">Giao Hàng Tiết Kiệm</option>
                <option value="viettel_post">Viettel Post</option>
              </select>
            </div>

            {/* Payment Method */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                <CreditCard size={20} />
                Thanh toán
              </h3>
              <select
                name="payment_method"
                value={formData.payment_method}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="cod">Thanh toán khi nhận hàng (COD)</option>
                <option value="vnpay">VNPay</option>
                <option value="momo">MoMo</option>
                <option value="bank_transfer">Chuyển khoản ngân hàng</option>
              </select>
            </div>
          </div>

          {/* Buyer Note */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ghi chú cho người bán (tùy chọn)
            </label>
            <textarea
              name="buyer_note"
              value={formData.buyer_note}
              onChange={handleChange}
              rows={3}
              placeholder="VD: Gọi trước khi giao hàng..."
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>

          {/* Order Summary */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <h3 className="font-semibold text-gray-900 mb-3">
              Chi tiết thanh toán
            </h3>
            <div className="flex justify-between text-gray-700">
              <span>Giá sản phẩm</span>
              <span>
                {new Intl.NumberFormat("vi-VN").format(listing.selling_price)} đ
              </span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Phí vận chuyển</span>
              <span>
                {new Intl.NumberFormat("vi-VN").format(
                  listing.shipping_fee || 0
                )}{" "}
                đ
              </span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Phí dịch vụ (5%)</span>
              <span>
                {new Intl.NumberFormat("vi-VN").format(
                  listing.selling_price * 0.05
                )}{" "}
                đ
              </span>
            </div>
            <div className="border-t border-gray-300 pt-2 mt-2 flex justify-between font-bold text-lg text-gray-900">
              <span>Tổng cộng</span>
              <span className="text-pink-600">
                {new Intl.NumberFormat("vi-VN").format(totalAmount)} đ
              </span>
            </div>
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
            className="flex-1 py-3 rounded-lg bg-pink-500 text-white font-semibold hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Đang xử lý...
              </div>
            ) : (
              "Đặt hàng"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
