import { useState, useEffect } from "react";
import { X, CreditCard, Wallet, Smartphone, Building2, AlertCircle, CheckCircle, Loader } from "lucide-react";
import { useOrder } from "@/context/OrderContext";
import {
  createVNPayPayment,
  createMoMoPayment,
  uploadTransferProof,
  confirmCODPayment,
} from "@/services/paymentService";

export default function PaymentModal({ order, isOpen, onClose, onSuccess }) {
  const { changePaymentStatus } = useOrder();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState(order?.payment_method || "vnpay");
  const [step, setStep] = useState(1); // 1: Select Method, 2: Processing, 3: Confirm

  // Bank Transfer State
  const [transferProof, setTransferProof] = useState(null);
  const [transferNote, setTransferNote] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);

  const paymentMethods = [
    {
      id: "vnpay",
      name: "VNPay",
      description: "Thanh toán qua VNPay QR",
      icon: <CreditCard className="w-6 h-6" />,
      color: "bg-blue-500",
      available: true,
    },
    {
      id: "momo",
      name: "MoMo",
      description: "Ví điện tử MoMo",
      icon: <Wallet className="w-6 h-6" />,
      color: "bg-pink-500",
      available: true,
    },
    {
      id: "bank_transfer",
      name: "Chuyển khoản",
      description: "Chuyển khoản ngân hàng",
      icon: <Building2 className="w-6 h-6" />,
      color: "bg-green-500",
      available: true,
    },
    {
      id: "cod",
      name: "COD",
      description: "Thanh toán khi nhận hàng",
      icon: <Smartphone className="w-6 h-6" />,
      color: "bg-orange-500",
      available: true,
    },
  ];

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // Handle file upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("File không được vượt quá 5MB");
        return;
      }
      setTransferProof(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
    }
  };

  // Handle payment
  const handlePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      switch (selectedMethod) {
        case "vnpay":
          await handleVNPayPayment();
          break;
        case "momo":
          await handleMoMoPayment();
          break;
        case "bank_transfer":
          await handleBankTransfer();
          break;
        case "cod":
          await handleCOD();
          break;
        default:
          throw new Error("Phương thức thanh toán không hợp lệ");
      }
    } catch (err) {
      console.error("Payment error:", err);
      setError(err.message || "Không thể xử lý thanh toán");
    } finally {
      setLoading(false);
    }
  };

  // VNPay Payment
  const handleVNPayPayment = async () => {
    try {
      const response = await createVNPayPayment({
        order_id: order._id,
        amount: order.total_amount,
        order_info: `Thanh toán đơn hàng ${order.order_code}`,
        return_url: `${window.location.origin}/payment/vnpay-return`,
      });

      if (response.data?.payment_url) {
        // Redirect to VNPay
        window.location.href = response.data.payment_url;
      } else {
        throw new Error("Không thể tạo link thanh toán VNPay");
      }
    } catch (error) {
      throw error;
    }
  };

  // MoMo Payment
  const handleMoMoPayment = async () => {
    try {
      const response = await createMoMoPayment({
        order_id: order._id,
        amount: order.total_amount,
        order_info: `Thanh toán đơn hàng ${order.order_code}`,
        return_url: `${window.location.origin}/payment/momo-return`,
      });

      if (response.data?.payUrl) {
        // Redirect to MoMo
        window.location.href = response.data.payUrl;
      } else {
        throw new Error("Không thể tạo link thanh toán MoMo");
      }
    } catch (error) {
      throw error;
    }
  };

  // Bank Transfer
  const handleBankTransfer = async () => {
    if (!transferProof) {
      setError("Vui lòng tải lên ảnh xác nhận chuyển khoản");
      return;
    }

    try {
      await uploadTransferProof(order._id, {
        image: transferProof,
        note: transferNote,
      });

      // Update order payment status to processing
      await changePaymentStatus(order._id, "processing");

      setStep(3);
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 2000);
    } catch (error) {
      throw error;
    }
  };

  // COD
  const handleCOD = async () => {
    try {
      // Confirm COD payment via API
      await confirmCODPayment(order._id);
      
      setStep(3);
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 2000);
    } catch (error) {
      console.error("COD confirmation error:", error);
      throw error;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Thanh toán</h2>
            <p className="text-sm text-gray-600 mt-1">
              Đơn hàng #{order.order_code}
            </p>
          </div>
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

          {/* Order Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Thông tin đơn hàng</h3>
            <div className="flex items-center gap-4 mb-4">
              <img
                src={order.item_id?.image_url || order.listing_id?.item_id?.image_url}
                alt={order.item_id?.item_name}
                className="w-20 h-20 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">
                  {order.item_id?.item_name || order.listing_id?.item_id?.item_name}
                </h4>
                <p className="text-sm text-gray-600">{order.item_id?.category_id?.name}</p>
              </div>
            </div>

            <div className="space-y-2 text-sm border-t border-gray-200 pt-3">
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
                <span className="font-bold text-pink-600 text-xl">
                  {formatPrice(order.total_amount)}
                </span>
              </div>
            </div>
          </div>

          {/* Step 1: Select Payment Method */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Chọn phương thức thanh toán</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    disabled={!method.available}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      selectedMethod === method.id
                        ? "border-pink-500 bg-pink-50"
                        : "border-gray-200 hover:border-pink-300"
                    } ${!method.available && "opacity-50 cursor-not-allowed"}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-lg ${method.color} text-white`}>
                        {method.icon}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{method.name}</p>
                        <p className="text-xs text-gray-600">{method.description}</p>
                      </div>
                      {selectedMethod === method.id && (
                        <CheckCircle className="text-pink-500" size={24} />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* Bank Transfer Instructions */}
              {selectedMethod === "bank_transfer" && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 mb-2">
                    Thông tin chuyển khoản
                  </h4>
                  <div className="space-y-2 text-sm text-green-800">
                    <p><strong>Ngân hàng:</strong> Vietcombank</p>
                    <p><strong>Số tài khoản:</strong> 1234567890</p>
                    <p><strong>Chủ tài khoản:</strong> FASHIONHUB CO., LTD</p>
                    <p><strong>Nội dung:</strong> {order.order_code}</p>
                    <p><strong>Số tiền:</strong> {formatPrice(order.total_amount)}</p>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tải lên ảnh xác nhận chuyển khoản *
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    {previewUrl && (
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="mt-3 max-w-full h-48 object-contain rounded-lg border border-gray-200"
                      />
                    )}
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ghi chú (tùy chọn)
                    </label>
                    <textarea
                      value={transferNote}
                      onChange={(e) => setTransferNote(e.target.value)}
                      rows={2}
                      placeholder="Thêm ghi chú về giao dịch..."
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              {/* COD Note */}
              {selectedMethod === "cod" && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h4 className="font-semibold text-orange-900 mb-2">
                    Thanh toán khi nhận hàng
                  </h4>
                  <p className="text-sm text-orange-800">
                    Bạn sẽ thanh toán bằng tiền mặt khi nhận hàng từ shipper.
                    Vui lòng chuẩn bị đủ tiền: <strong>{formatPrice(order.total_amount)}</strong>
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Success */}
          {step === 3 && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-green-600" size={40} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {selectedMethod === "bank_transfer"
                  ? "Đã gửi xác nhận!"
                  : "Xác nhận thành công!"}
              </h3>
              <p className="text-gray-600">
                {selectedMethod === "bank_transfer"
                  ? "Chúng tôi sẽ xác nhận thanh toán trong 24h"
                  : "Đơn hàng của bạn đã được xác nhận"}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {step === 1 && (
          <div className="p-6 border-t border-gray-200 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handlePayment}
              disabled={loading || (selectedMethod === "bank_transfer" && !transferProof)}
              className="flex-1 py-3 rounded-lg bg-pink-500 text-white font-semibold hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader className="animate-spin" size={20} />
                  Đang xử lý...
                </div>
              ) : (
                "Xác nhận thanh toán"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}