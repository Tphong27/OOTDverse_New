//frontend/src/components/orders/OrderTimeline.jsx
import { 
  Clock, 
  CheckCircle, 
  Package, 
  Truck, 
  Home,
  XCircle
} from "lucide-react";

export default function OrderTimeline({ order }) {
  const getTimelineSteps = () => {
    const baseSteps = [
      {
        key: "pending_payment",
        label: "Chờ thanh toán",
        icon: <Clock size={20} />,
        timestamp: order.created_at,
      },
      {
        key: "paid",
        label: "Đã thanh toán",
        icon: <CheckCircle size={20} />,
        timestamp: order.paid_at,
      },
      {
        key: "preparing",
        label: "Đang chuẩn bị",
        icon: <Package size={20} />,
        timestamp: order.preparing_at,
      },
      {
        key: "shipping",
        label: "Đang vận chuyển",
        icon: <Truck size={20} />,
        timestamp: order.shipping_at,
      },
      {
        key: "delivered",
        label: "Đã giao hàng",
        icon: <Home size={20} />,
        timestamp: order.delivered_at,
      },
      {
        key: "completed",
        label: "Hoàn thành",
        icon: <CheckCircle size={20} />,
        timestamp: order.completed_at,
      },
    ];

    // If cancelled, replace with cancel step
    if (order.order_status === "cancelled") {
      return [
        baseSteps[0], // pending_payment
        {
          key: "cancelled",
          label: "Đã hủy",
          icon: <XCircle size={20} />,
          timestamp: order.cancelled_at,
        },
      ];
    }

    return baseSteps;
  };

  const steps = getTimelineSteps();

  const getCurrentStepIndex = () => {
    const statusIndex = {
      pending_payment: 0,
      paid: 1,
      preparing: 2,
      shipping: 3,
      delivered: 4,
      completed: 5,
      cancelled: 1,
    };
    return statusIndex[order.order_status] || 0;
  };

  const currentStepIndex = getCurrentStepIndex();

  const getStepStatus = (index) => {
    if (index < currentStepIndex) return "completed";
    if (index === currentStepIndex) return "current";
    return "pending";
  };

  const formatDate = (date) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6">
      <h3 className="font-semibold text-gray-900 mb-6">Trạng thái đơn hàng</h3>

      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute top-6 left-6 h-full w-0.5 bg-gray-200">
          <div
            className="bg-gradient-to-b from-purple-500 to-pink-500 transition-all duration-500"
            style={{
              height: `${(currentStepIndex / (steps.length - 1)) * 100}%`,
            }}
          />
        </div>

        {/* Steps */}
        <div className="space-y-6 relative">
          {steps.map((step, index) => {
            const status = getStepStatus(index);
            const isCompleted = status === "completed";
            const isCurrent = status === "current";
            const isPending = status === "pending";

            return (
              <div key={step.key} className="flex items-start gap-4 relative">
                {/* Icon */}
                <div
                  className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all z-10 ${
                    isCompleted || isCurrent
                      ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg"
                      : "bg-white border-2 border-gray-300 text-gray-400"
                  }`}
                >
                  {step.icon}
                </div>

                {/* Content */}
                <div className="flex-1 pt-1">
                  <p
                    className={`font-semibold ${
                      isCompleted || isCurrent ? "text-gray-900" : "text-gray-400"
                    }`}
                  >
                    {step.label}
                  </p>
                  {step.timestamp && (
                    <p className="text-sm text-gray-500 mt-1">
                      {formatDate(step.timestamp)}
                    </p>
                  )}
                  {isCurrent && (
                    <span className="inline-block mt-2 px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                      Đang xử lý
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cancellation Info */}
      {order.order_status === "cancelled" && order.cancellation_reason && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm font-medium text-red-800 mb-1">Lý do hủy:</p>
          <p className="text-sm text-red-700">{order.cancellation_reason}</p>
          {order.cancelled_by && (
            <p className="text-xs text-red-600 mt-2">
              Bởi: {order.cancelled_by === "buyer" ? "Người mua" : order.cancelled_by === "seller" ? "Người bán" : "Admin"}
            </p>
          )}
        </div>
      )}
    </div>
  );
}