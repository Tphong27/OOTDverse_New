//frontend/src/components/orders/OrderDetailModal.jsx
import { useState } from "react";
import { 
  X, 
  Package, 
  User, 
  MapPin, 
  CreditCard, 
  Truck,
  Star,
  MessageCircle,
  AlertCircle
} from "lucide-react";
import OrderTimeline from "./OrderTimeline";
import { useOrder } from "@/context/OrderContext";

export default function OrderDetailModal({ order, role, isOpen, onClose }) {
  const { 
    changeOrderStatus, 
    cancelOrder, 
    rateSeller, 
    rateBuyer 
  } = useOrder();

  const [showRatingForm, setShowRatingForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Handle cancel order
  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      alert("Vui lòng nhập lý do hủy");
      return;
    }

    try {
      setLoading(true);
      await cancelOrder(order._id, cancelReason, role);
      alert("Đã hủy đơn hàng thành công");
      onClose();
    } catch (error) {
      alert("Không thể hủy đơn hàng: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle submit rating
  const handleSubmitRating = async () => {
    try {
      setLoading(true);
      if (role === "buyer") {
        await rateSeller(order._id, rating, review);
      } else {
        await rateBuyer(order._id, rating, review);
      }
      alert("Đánh giá thành công!");
      setShowRatingForm(false);
      onClose();
    } catch (error) {
      alert("Không thể gửi đánh giá: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Get partner info
  const partner = role === "buyer" ? order.seller_id : order.buyer_id;
  const partnerRating = role === "buyer" ? order.buyer_rating : order.seller_rating;
  const partnerReview = role === "buyer" ? order.buyer_review : order.seller_review;

  // Check if can cancel
  const canCancel = ["pending_payment", "paid", "preparing"].includes(order.order_status);

  // Check if can rate
  const canRate = order.order_status === "completed" && !partnerRating;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Chi tiết đơn hàng</h2>
            <p className="text-sm text-gray-600 mt-1">#{order.order_code}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[calc(90vh-180px)] overflow-y-auto">
          {/* Order Timeline */}
          <OrderTimeline order={order} />

          {/* Item Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Package size={20} />
              Thông tin sản phẩm
            </h3>
            <div className="flex items-center gap-4">
              <img
                src={order.item_id?.image_url || order.listing_id?.item_id?.image_url}
                alt={order.item_id?.item_name}
                className="w-24 h-24 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">
                  {order.item_id?.item_name || order.listing_id?.item_id?.item_name}
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  {order.item_id?.category_id?.name}
                </p>
                <p className="text-lg font-bold text-pink-600 mt-2">
                  {formatPrice(order.item_price)}
                </p>
              </div>
            </div>
          </div>

          {/* Partner Info */}
          {partner && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <User size={20} />
                Thông tin {role === "buyer" ? "người bán" : "người mua"}
              </h3>
              <div className="flex items-center gap-3">
                <img
                  src={partner.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(partner.fullName)}&background=random`}
                  alt={partner.fullName}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <p className="font-semibold text-gray-900">{partner.fullName}</p>
                  <p className="text-sm text-gray-600">{partner.phone || "N/A"}</p>
                </div>
              </div>
            </div>
          )}

          {/* Shipping Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <MapPin size={20} />
              Địa chỉ giao hàng
            </h3>
            <div className="space-y-2 text-sm text-gray-700">
              <p><strong>Người nhận:</strong> {order.shipping_address.recipient_name}</p>
              <p><strong>SĐT:</strong> {order.shipping_address.phone}</p>
              <p><strong>Địa chỉ:</strong> {order.shipping_address.address}</p>
              {order.shipping_address.ward && (
                <p>
                  {order.shipping_address.ward}, {order.shipping_address.district},{" "}
                  {order.shipping_address.province}
                </p>
              )}
            </div>
          </div>

          {/* Shipping Method */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Truck size={20} />
              Vận chuyển
            </h3>
            <div className="space-y-2 text-sm text-gray-700">
              <p><strong>Phương thức:</strong> {order.shipping_method?.toUpperCase()}</p>
              {order.tracking_number && (
                <p>
                  <strong>Mã vận đơn:</strong>{" "}
                  <code className="px-2 py-1 bg-white rounded font-mono">
                    {order.tracking_number}
                  </code>
                </p>
              )}
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <CreditCard size={20} />
              Thanh toán
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Giá sản phẩm:</span>
                <span className="font-medium">{formatPrice(order.item_price)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phí vận chuyển:</span>
                <span className="font-medium">{formatPrice(order.shipping_fee)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phí dịch vụ:</span>
                <span className="font-medium">{formatPrice(order.platform_fee)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-300">
                <span className="font-semibold text-gray-900">Tổng cộng:</span>
                <span className="font-bold text-pink-600 text-lg">
                  {formatPrice(order.total_amount)}
                </span>
              </div>
              <div className="pt-2">
                <p className="text-gray-600">
                  <strong>Phương thức:</strong> {order.payment_method?.toUpperCase()}
                </p>
                <p className="text-gray-600">
                  <strong>Trạng thái:</strong>{" "}
                  <span
                    className={
                      order.payment_status === "paid"
                        ? "text-green-600 font-medium"
                        : "text-yellow-600 font-medium"
                    }
                  >
                    {order.payment_status === "paid" ? "Đã thanh toán" : "Chờ thanh toán"}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Ratings */}
          {(order.buyer_rating || order.seller_rating) && (
            <div className="bg-yellow-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Star size={20} />
                Đánh giá
              </h3>

              {role === "buyer" && order.buyer_rating && (
                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Bạn đã đánh giá người bán:
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={16}
                          className={
                            star <= order.buyer_rating
                              ? "text-yellow-500 fill-current"
                              : "text-gray-300"
                          }
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      ({order.buyer_rating}/5)
                    </span>
                  </div>
                  {order.buyer_review && (
                    <p className="text-sm text-gray-700 mt-2 italic">
                      "{order.buyer_review}"
                    </p>
                  )}
                </div>
              )}

              {role === "seller" && order.seller_rating && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Bạn đã đánh giá người mua:
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={16}
                          className={
                            star <= order.seller_rating
                              ? "text-yellow-500 fill-current"
                              : "text-gray-300"
                          }
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      ({order.seller_rating}/5)
                    </span>
                  </div>
                  {order.seller_review && (
                    <p className="text-sm text-gray-700 mt-2 italic">
                      "{order.seller_review}"
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Rating Form */}
          {canRate && showRatingForm && (
            <div className="bg-yellow-50 rounded-lg p-4 border-2 border-yellow-200">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Star size={20} />
                Đánh giá {role === "buyer" ? "người bán" : "người mua"}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chất lượng (1-5 sao)
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="focus:outline-none"
                      >
                        <Star
                          size={32}
                          className={
                            star <= rating
                              ? "text-yellow-500 fill-current"
                              : "text-gray-300"
                          }
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nhận xét (tùy chọn)
                  </label>
                  <textarea
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    rows={3}
                    placeholder="Chia sẻ trải nghiệm của bạn..."
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowRatingForm(false)}
                    className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleSubmitRating}
                    disabled={loading}
                    className="flex-1 py-2 rounded-lg bg-yellow-500 text-white font-medium hover:bg-yellow-600 disabled:opacity-50"
                  >
                    {loading ? "Đang gửi..." : "Gửi đánh giá"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Cancel Form */}
          {canCancel && showCancelForm && (
            <div className="bg-red-50 rounded-lg p-4 border-2 border-red-200">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <AlertCircle size={20} />
                Hủy đơn hàng
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lý do hủy *
                  </label>
                  <textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    rows={3}
                    placeholder="Vui lòng cho biết lý do..."
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCancelForm(false)}
                    className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
                  >
                    Quay lại
                  </button>
                  <button
                    onClick={handleCancelOrder}
                    disabled={loading}
                    className="flex-1 py-2 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 disabled:opacity-50"
                  >
                    {loading ? "Đang hủy..." : "Xác nhận hủy"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-200 flex gap-3">
          {canRate && !showRatingForm && (
            <button
              onClick={() => setShowRatingForm(true)}
              className="flex-1 py-3 rounded-lg bg-yellow-500 text-white font-semibold hover:bg-yellow-600 transition-colors"
            >
              Đánh giá
            </button>
          )}

          {canCancel && !showCancelForm && (
            <button
              onClick={() => setShowCancelForm(true)}
              className="flex-1 py-3 rounded-lg border-2 border-red-500 text-red-600 font-semibold hover:bg-red-50 transition-colors"
            >
              Hủy đơn
            </button>
          )}

          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-lg bg-gray-900 text-white font-semibold hover:bg-gray-800 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}