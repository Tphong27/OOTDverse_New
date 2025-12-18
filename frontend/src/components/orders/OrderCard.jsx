import { useState } from "react";
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Eye,
  CreditCard,
} from "lucide-react";
import PaymentModal from "./PaymentModal";

export default function OrderCard({ order, role, onViewDetail }) {
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const getStatusBadge = (status) => {
    const badges = {
      pending_payment: {
        color: "bg-yellow-100 text-yellow-800 border-yellow-300",
        icon: <Clock size={14} />,
        label: "Chờ thanh toán",
      },
      paid: {
        color: "bg-blue-100 text-blue-800 border-blue-300",
        icon: <CheckCircle size={14} />,
        label: "Đã thanh toán",
      },
      preparing: {
        color: "bg-purple-100 text-purple-800 border-purple-300",
        icon: <Package size={14} />,
        label: "Đang chuẩn bị",
      },
      shipping: {
        color: "bg-orange-100 text-orange-800 border-orange-300",
        icon: <Truck size={14} />,
        label: "Đang vận chuyển",
      },
      delivered: {
        color: "bg-teal-100 text-teal-800 border-teal-300",
        icon: <CheckCircle size={14} />,
        label: "Đã giao hàng",
      },
      completed: {
        color: "bg-green-100 text-green-800 border-green-300",
        icon: <CheckCircle size={14} />,
        label: "Hoàn thành",
      },
      cancelled: {
        color: "bg-red-100 text-red-800 border-red-300",
        icon: <XCircle size={14} />,
        label: "Đã hủy",
      },
      refunded: {
        color: "bg-gray-100 text-gray-800 border-gray-300",
        icon: <XCircle size={14} />,
        label: "Đã hoàn tiền",
      },
    };
    return badges[status] || badges.pending_payment;
  };

  const statusBadge = getStatusBadge(order.order_status);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const partner = role === "buyer" ? order.seller_id : order.buyer_id;

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Left: Item Info */}
            <div className="flex items-center gap-4 flex-1">
              <img
                src={
                  order.item_id?.image_url ||
                  order.listing_id?.item_id?.image_url
                }
                alt={order.item_id?.item_name}
                className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 ${statusBadge.color}`}
                  >
                    {statusBadge.icon}
                    {statusBadge.label}
                  </span>
                </div>

                <h3 className="font-semibold text-gray-900 line-clamp-1 mb-1">
                  {order.item_id?.item_name ||
                    order.listing_id?.item_id?.item_name}
                </h3>

                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                  <span className="font-mono text-xs">#{order.order_code}</span>
                  <span>•</span>
                  <span>{formatDate(order.created_at)}</span>
                </div>

                {partner && (
                  <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                    <img
                      src={
                        partner.avatar ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          partner.fullName
                        )}&background=random`
                      }
                      alt={partner.fullName}
                      className="w-6 h-6 rounded-full"
                    />
                    <span>
                      {role === "buyer" ? "Người bán" : "Người mua"}:{" "}
                      {partner.fullName}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Price & Actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:gap-6">
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-1">Tổng tiền</p>
                <p className="text-xl font-bold text-pink-600">
                  {formatPrice(order.total_amount)}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => onViewDetail(order)}
                  className="px-4 py-2 rounded-lg border-2 border-gray-300 text-gray-700 font-medium hover:border-pink-500 hover:bg-pink-50 hover:text-pink-700 transition-colors flex items-center gap-2"
                >
                  <Eye size={16} />
                  <span className="hidden sm:inline">Chi tiết</span>
                </button>

                {/* Payment Button - Only for buyer with pending_payment status */}
                {order.order_status === "pending_payment" &&
                  role === "buyer" &&
                  order.payment_status === "pending" && (
                    <button
                      onClick={() => setShowPaymentModal(true)}
                      className="px-4 py-2 rounded-lg bg-pink-500 text-white font-medium hover:bg-pink-600 transition-colors flex items-center gap-2"
                    >
                      <CreditCard size={16} />
                      Thanh toán
                    </button>
                  )}

                {order.order_status === "delivered" &&
                  role === "buyer" &&
                  !order.buyer_rating && (
                    <button className="px-4 py-2 rounded-lg bg-yellow-500 text-white font-medium hover:bg-yellow-600 transition-colors">
                      Đánh giá
                    </button>
                  )}
              </div>
            </div>
          </div>

          {order.tracking_number && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Truck size={16} />
                <span>Mã vận đơn:</span>
                <code className="px-2 py-1 bg-gray-100 rounded font-mono text-xs">
                  {order.tracking_number}
                </code>
              </div>
            </div>
          )}

          {order.order_status === "cancelled" && order.cancellation_reason && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-start gap-2 text-sm text-red-600">
                <XCircle size={16} className="flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Lý do hủy:</p>
                  <p className="text-red-700 mt-1">
                    {order.cancellation_reason}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          order={order}
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={() => {
            setShowPaymentModal(false);
            // Reload orders
            window.location.reload();
          }}
        />
      )}
    </>
  );
}
