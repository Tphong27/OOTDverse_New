// frontend/src/components/orders/OrderStatusManager.jsx
import { useState } from "react";
import { 
  Clock, 
  CheckCircle, 
  Package, 
  Truck, 
  Home, 
  XCircle, 
  AlertCircle,
  Upload,
  CreditCard
} from "lucide-react";
import { useOrder } from "@/context/OrderContext";

export default function OrderStatusManager({ order, role, onUpdate }) {
  const { changeOrderStatus } = useOrder();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [trackingNumber, setTrackingNumber] = useState(order.tracking_number || "");
  const [showTrackingInput, setShowTrackingInput] = useState(false);

  // Define what actions are available for each role at each status
  const actionRules = {
    buyer: {
      pending_payment: {
        canAct: true,
        action: "payment",
        actionLabel: "Thanh toán ngay",
        description: "Vui lòng thanh toán để xác nhận đơn hàng",
        icon: <CreditCard size={20} />,
      },
      paid: {
        canAct: false,
        description: "Người bán đang chuẩn bị hàng cho bạn",
      },
      preparing: {
        canAct: false,
        description: "Người bán đang đóng gói hàng",
      },
      shipping: {
        canAct: false,
        description: "Đơn hàng đang trên đường giao đến bạn",
      },
      delivered: {
        canAct: true,
        action: "confirm_delivery",
        nextStatus: "completed",
        actionLabel: "Xác nhận đã nhận hàng",
        description: "Vui lòng kiểm tra hàng và xác nhận",
        icon: <CheckCircle size={20} />,
      },
      completed: {
        canAct: false,
        description: "Đơn hàng đã hoàn thành",
      },
      cancelled: {
        canAct: false,
        description: "Đơn hàng đã bị hủy",
      },
    },
    seller: {
      pending_payment: {
        canAct: false,
        description: "Chờ người mua thanh toán",
      },
      paid: {
        canAct: true,
        action: "start_preparing",
        nextStatus: "preparing",
        actionLabel: "Bắt đầu chuẩn bị hàng",
        description: "Đã nhận thanh toán, hãy chuẩn bị hàng",
        icon: <Package size={20} />,
      },
      preparing: {
        canAct: true,
        action: "ship_order",
        nextStatus: "shipping",
        actionLabel: "Giao cho shipper",
        description: "Đóng gói xong, sẵn sàng giao hàng",
        icon: <Truck size={20} />,
        requiresTracking: true,
      },
      shipping: {
        canAct: true,
        action: "mark_delivered",
        nextStatus: "delivered",
        actionLabel: "Xác nhận đã giao",
        description: "Đơn hàng đang vận chuyển",
        icon: <Home size={20} />,
      },
      delivered: {
        canAct: false,
        description: "Chờ người mua xác nhận nhận hàng",
      },
      completed: {
        canAct: false,
        description: "Đơn hàng đã hoàn thành",
      },
      cancelled: {
        canAct: false,
        description: "Đơn hàng đã bị hủy",
      },
    },
  };

  const currentRule = actionRules[role][order.order_status];

  const handleAction = async () => {
    // Handle payment action - redirect to payment modal
    if (currentRule.action === "payment") {
      // This should open payment modal in parent component
      if (onUpdate) onUpdate({ action: "open_payment" });
      return;
    }

    // Validate tracking number for shipping
    if (currentRule.requiresTracking && !trackingNumber.trim()) {
      setError("Vui lòng nhập mã vận đơn");
      setShowTrackingInput(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await changeOrderStatus(
        order._id,
        currentRule.nextStatus,
        trackingNumber.trim() || null
      );
      
      if (onUpdate) onUpdate({ success: true });
    } catch (err) {
      setError(err.message || "Không thể cập nhật trạng thái");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending_payment: "bg-yellow-100 text-yellow-800 border-yellow-300",
      paid: "bg-blue-100 text-blue-800 border-blue-300",
      preparing: "bg-purple-100 text-purple-800 border-purple-300",
      shipping: "bg-orange-100 text-orange-800 border-orange-300",
      delivered: "bg-teal-100 text-teal-800 border-teal-300",
      completed: "bg-green-100 text-green-800 border-green-300",
      cancelled: "bg-red-100 text-red-800 border-red-300",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending_payment: "Chờ thanh toán",
      paid: "Đã thanh toán",
      preparing: "Đang chuẩn bị",
      shipping: "Đang vận chuyển",
      delivered: "Đã giao hàng",
      completed: "Hoàn thành",
      cancelled: "Đã hủy",
    };
    return labels[status] || status;
  };

  return (
    <div className="space-y-4">
      {/* Current Status Banner */}
      <div className={`flex items-center gap-3 p-4 rounded-lg border-2 ${getStatusColor(order.order_status)}`}>
        <div className="flex-shrink-0">
          {order.order_status === "pending_payment" && <Clock size={24} />}
          {order.order_status === "paid" && <CheckCircle size={24} />}
          {order.order_status === "preparing" && <Package size={24} />}
          {order.order_status === "shipping" && <Truck size={24} />}
          {order.order_status === "delivered" && <Home size={24} />}
          {order.order_status === "completed" && <CheckCircle size={24} />}
          {order.order_status === "cancelled" && <XCircle size={24} />}
        </div>
        <div className="flex-1">
          <p className="font-bold text-lg">{getStatusLabel(order.order_status)}</p>
          <p className="text-sm opacity-90">{currentRule.description}</p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Tracking Number Input (for seller when shipping) */}
      {role === "seller" && 
       currentRule.requiresTracking && 
       (showTrackingInput || !trackingNumber) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <label className="block text-sm font-medium text-blue-900 mb-2">
            Mã vận đơn *
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="Nhập mã vận đơn (GHN, GHTK...)"
              className="flex-1 px-4 py-2 rounded-lg border border-blue-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <p className="text-xs text-blue-700 mt-2">
            Vui lòng nhập mã vận đơn từ đơn vị vận chuyển
          </p>
        </div>
      )}

      {/* Tracking Info Display */}
      {order.tracking_number && order.order_status === "shipping" && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Truck size={18} className="text-orange-600" />
            <p className="font-medium text-orange-900">Thông tin vận chuyển</p>
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 px-3 py-2 bg-white rounded border border-orange-200 font-mono text-sm">
              {order.tracking_number}
            </code>
            <button
              onClick={() => navigator.clipboard.writeText(order.tracking_number)}
              className="px-3 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 text-sm"
            >
              Copy
            </button>
          </div>
        </div>
      )}

      {/* Action Button */}
      {currentRule.canAct && (
        <button
          onClick={handleAction}
          disabled={loading}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Đang xử lý...
            </>
          ) : (
            <>
              {currentRule.icon}
              {currentRule.actionLabel}
            </>
          )}
        </button>
      )}

      {/* Helper Instructions */}
      {role === "seller" && (
        <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 space-y-2">
          <p className="font-semibold text-gray-900">📋 Hướng dẫn:</p>
          {order.order_status === "paid" && (
            <ul className="space-y-1 list-disc list-inside">
              <li>Kiểm tra thông tin đơn hàng và địa chỉ giao hàng</li>
              <li>Chuẩn bị và đóng gói hàng cẩn thận</li>
              <li>Chụp ảnh hàng trước khi đóng gói (nếu cần)</li>
            </ul>
          )}
          {order.order_status === "preparing" && (
            <ul className="space-y-1 list-disc list-inside">
              <li>Giao hàng cho đơn vị vận chuyển</li>
              <li>Nhập mã vận đơn để người mua theo dõi</li>
              <li>Lưu ảnh chứng từ giao hàng</li>
            </ul>
          )}
          {order.order_status === "shipping" && (
            <ul className="space-y-1 list-disc list-inside">
              <li>Theo dõi quá trình vận chuyển</li>
              <li>Hỗ trợ người mua nếu có thắc mắc</li>
              <li>Xác nhận khi đơn vị vận chuyển giao thành công</li>
            </ul>
          )}
        </div>
      )}

      {role === "buyer" && (
        <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 space-y-2">
          <p className="font-semibold text-gray-900">💡 Lưu ý:</p>
          {order.order_status === "pending_payment" && (
            <p>Vui lòng thanh toán trong vòng 24h để giữ đơn hàng</p>
          )}
          {order.order_status === "shipping" && (
            <p>Đơn hàng đang trên đường giao đến bạn. Vui lòng để ý điện thoại!</p>
          )}
          {order.order_status === "delivered" && (
            <ul className="space-y-1 list-disc list-inside">
              <li>Kiểm tra kỹ hàng trước khi xác nhận</li>
              <li>Chụp ảnh/video unboxing để bảo vệ quyền lợi</li>
              <li>Liên hệ người bán nếu có vấn đề</li>
            </ul>
          )}
        </div>
      )}

      {/* Cancel Option (only for early stages) */}
      {["pending_payment", "paid", "preparing"].includes(order.order_status) && (
        <button
          onClick={() => {
            if (onUpdate) onUpdate({ action: "open_cancel" });
          }}
          className="w-full py-3 rounded-lg border-2 border-red-500 text-red-600 font-semibold hover:bg-red-50 transition-colors"
        >
          Hủy đơn hàng
        </button>
      )}
    </div>
  );
}