// frontend/src/pages/payment/vnpay-return.jsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import LayoutUser from "@/components/layout/LayoutUser";
import { CheckCircle, XCircle, Loader, ArrowRight, Home } from "lucide-react";
import { handleVNPayReturn } from "@/services/paymentService";

export default function VNPayReturnPage() {
  const router = useRouter();
  const [status, setStatus] = useState("processing"); // processing | success | failed
  const [message, setMessage] = useState("");
  const [orderId, setOrderId] = useState(null);
  const [transactionId, setTransactionId] = useState(null);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (router.isReady) {
      processPaymentReturn();
    }
  }, [router.isReady]);

  // Countdown for redirect
  useEffect(() => {
    if (status === "success" && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }

    if (status === "success" && countdown === 0) {
      router.push("/marketplace?tab=orders");
    }
  }, [status, countdown]);

  const processPaymentReturn = async () => {
    try {
      const response = await handleVNPayReturn(router.query);

      if (response.success) {
        setStatus("success");
        setMessage("Thanh toán VNPay thành công!");
        setOrderId(response.data.order_id);
        setTransactionId(response.data.transaction_id);
      } else {
        setStatus("failed");
        setMessage(response.message || "Thanh toán VNPay thất bại");
      }
    } catch (error) {
      console.error("Error processing VNPay return:", error);
      setStatus("failed");
      setMessage(
        error.error ||
          error.message ||
          "Có lỗi xảy ra khi xử lý thanh toán VNPay"
      );
    }
  };

  return (
    <LayoutUser>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4 py-12">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
            {/* Processing State */}
            {status === "processing" && (
              <div className="space-y-6">
                <div className="relative">
                  <Loader className="w-20 h-20 text-blue-500 animate-spin mx-auto" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full animate-pulse"></div>
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Đang xử lý thanh toán VNPay...
                  </h2>
                  <p className="text-gray-600">
                    Vui lòng đợi trong giây lát, chúng tôi đang xác thực giao
                    dịch
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <div
                    className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  ></div>
                </div>
              </div>
            )}

            {/* Success State */}
            {status === "success" && (
              <div className="space-y-6">
                <div className="relative">
                  <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto animate-scale-in">
                    <CheckCircle className="w-16 h-16 text-green-600 animate-check" />
                  </div>
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-32 h-32">
                    <div className="confetti-animation"></div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h2 className="text-3xl font-bold text-gray-900">
                    Thanh toán thành công! 🎉
                  </h2>
                  <p className="text-gray-600 text-lg">{message}</p>
                </div>

                {/* Transaction Details */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                  <div className="space-y-3 text-left">
                    {transactionId && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-medium">
                          Mã giao dịch:
                        </span>
                        <code className="bg-white px-3 py-1 rounded-lg text-green-700 font-mono text-sm">
                          {transactionId}
                        </code>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">
                        Phương thức:
                      </span>
                      <span className="text-gray-900 font-semibold">VNPay</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">
                        Trạng thái:
                      </span>
                      <span className="text-green-600 font-semibold flex items-center gap-1">
                        <CheckCircle size={16} />
                        Thành công
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={() => router.push("/marketplace?tab=orders")}
                    className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group"
                  >
                    Xem đơn hàng
                    <ArrowRight
                      size={20}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </button>

                  <button
                    onClick={() => router.push("/")}
                    className="w-full py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                  >
                    <Home size={20} />
                    Về trang chủ
                  </button>
                </div>

                {/* Auto redirect countdown */}
                <p className="text-sm text-gray-500">
                  Tự động chuyển hướng sau{" "}
                  <span className="font-bold text-blue-600">{countdown}</span>s
                </p>
              </div>
            )}

            {/* Failed State */}
            {status === "failed" && (
              <div className="space-y-6">
                <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto animate-scale-in">
                  <XCircle className="w-16 h-16 text-red-600 animate-shake" />
                </div>

                <div className="space-y-3">
                  <h2 className="text-3xl font-bold text-gray-900">
                    Thanh toán thất bại
                  </h2>
                  <p className="text-gray-600 text-lg">{message}</p>
                </div>

                {/* Error Details */}
                <div className="bg-red-50 rounded-xl p-6 border border-red-200">
                  <div className="space-y-2 text-left">
                    <p className="text-red-800 font-medium">
                      Giao dịch không thành công
                    </p>
                    <p className="text-red-700 text-sm">
                      Vui lòng kiểm tra lại thông tin thanh toán hoặc thử lại
                      sau
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={() => router.push("/marketplace?tab=orders")}
                    className="w-full py-4 bg-gradient-to-r from-pink-500 to-red-600 text-white rounded-xl font-semibold hover:from-pink-600 hover:to-red-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    Quay lại đơn hàng
                  </button>

                  <button
                    onClick={() => router.push("/")}
                    className="w-full py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                  >
                    <Home size={20} />
                    Về trang chủ
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Support Info */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Cần hỗ trợ? Liên hệ{" "}
              <a
                href="mailto:support@fashionhub.com"
                className="text-blue-600 hover:underline font-medium"
              >
                support@fashionhub.com
              </a>
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scale-in {
          from {
            transform: scale(0);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes check {
          0% {
            transform: scale(0) rotate(-45deg);
          }
          50% {
            transform: scale(1.2) rotate(0deg);
          }
          100% {
            transform: scale(1) rotate(0deg);
          }
        }

        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-10px);
          }
          75% {
            transform: translateX(10px);
          }
        }

        .animate-scale-in {
          animation: scale-in 0.5s ease-out;
        }

        .animate-check {
          animation: check 0.6s ease-out;
        }

        .animate-shake {
          animation: shake 0.5s ease-out;
        }
      `}</style>
    </LayoutUser>
  );
}
