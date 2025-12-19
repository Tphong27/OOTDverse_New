// frontend/src/components/cart/CheckoutModal.jsx
import { useState, useEffect } from "react";
import {
  X,
  MapPin,
  Truck,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Loader,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useOrder } from "@/context/OrderContext";
import { useRouter } from "next/router";
import {
  createVNPayPayment,
  createMoMoPayment,
  uploadTransferProof,
  confirmCODPayment,
} from "@/services/paymentService";
import { getDefaultAddress } from "@/services/addressService";
import AddressListModal from "@/components/address/AddressListModal";

export default function CheckoutModal({ items, isOpen, onClose, onSuccess }) {
  const router = useRouter();
  const { user } = useAuth();
  const { removeItems } = useCart();
  const { placeOrder } = useOrder();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1); // 1: Info, 2: Payment, 3: Success

  const [showAddressList, setShowAddressList] = useState(false);
  const [address, setAddress] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);

  const [formData, setFormData] = useState({
    shipping_method: "ghn",
    payment_method: "vnpay",
    buyer_note: "",
  });

  const [transferProof, setTransferProof] = useState(null);
  const [transferNote, setTransferNote] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    async function loadAddress() {
      try {
        const res = await getDefaultAddress();

        if (res) {
          setAddress(res);
          setFormData((f) => ({
            ...f,
            shipping_address_id: res,
          }));
        } else {
          setAddress(null);
        }
      } catch (err) {
        console.error("Load address failed", err);
        setAddress(null);
      }
    }

    loadAddress();
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

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

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);

    try {
      // Validation
      if (!address?._id) {
        throw new Error("Vui lòng chọn địa chỉ giao hàng");
      }

      // Create orders for each item (each item = 1 order since different sellers)
      const createdOrders = [];

      for (const item of items) {
        const orderData = {
          listing_id: item.listing_id,
          shipping_address_id: formData.shipping_address_id._id,
          payment_method: formData.payment_method,
        };

        const order = await placeOrder(orderData);
        createdOrders.push(order);
      }

      // Remove items from cart
      removeItems(items.map((item) => item.listing_id));

      // Handle payment based on method
      if (
        formData.payment_method === "vnpay" ||
        formData.payment_method === "momo"
      ) {
        // For online payment, process first order (or batch later)
        await handleOnlinePayment(createdOrders[0]);
      } else if (formData.payment_method === "bank_transfer") {
        // Upload proof for first order
        await handleBankTransfer(createdOrders[0]);
      } else if (formData.payment_method === "cod") {
        // Confirm COD for all orders
        for (const order of createdOrders) {
          await confirmCODPayment(order._id);
        }
        setStep(3);
      }
    } catch (err) {
      console.error("Checkout error:", err);
      setError(err.message || err.error || "Không thể xử lý thanh toán");
    } finally {
      setLoading(false);
    }
  };

  const handleOnlinePayment = async (order) => {
    try {
      if (formData.payment_method === "vnpay") {
        const response = await createVNPayPayment({
          order_id: order._id,
          amount: order.total_amount,
          order_info: `Thanh toán đơn hàng ${order.order_code}`,
          return_url: `${window.location.origin}/payment/vnpay-return`,
        });
        if (response.data?.payment_url) {
          window.location.href = response.data.payment_url;
        }
      } else if (formData.payment_method === "momo") {
        const response = await createMoMoPayment({
          order_id: order._id,
          amount: order.total_amount,
          order_info: `Thanh toán đơn hàng ${order.order_code}`,
          return_url: `${window.location.origin}/payment/momo-return`,
        });
        if (response.data?.payUrl) {
          window.location.href = response.data.payUrl;
        }
      }
    } catch (error) {
      throw error;
    }
  };

  const handleBankTransfer = async (order) => {
    if (!transferProof) {
      throw new Error("Vui lòng tải lên ảnh xác nhận chuyển khoản");
    }
    await uploadTransferProof(order._id, {
      image: transferProof,
      note: transferNote,
    });
    setStep(3);
  };

  const totalAmount = items.reduce(
    (sum, item) => sum + item.price + item.shipping_fee + item.price * 0.05,
    0
  );

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full my-8">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">
              {step === 1
                ? "Thông tin giao hàng"
                : step === 2
                ? "Phương thức thanh toán"
                : "Hoàn tất"}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {step === 1 && (
              <>
                {/* Items Summary */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold mb-3">
                    Đơn hàng ({items.length} món)
                  </h3>
                  <div className="space-y-2">
                    {items.map((item) => (
                      <div
                        key={item.listing_id}
                        className="flex items-center gap-3"
                      >
                        <img
                          src={item.item_image}
                          className="w-12 h-12 rounded object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {item.item_name}
                          </p>
                          <p className="text-xs text-gray-600">
                            {formatPrice(item.price)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <MapPin size={20} />
                    Địa chỉ giao hàng
                  </h3>

                  {address ? (
                    <div
                      onClick={() => setShowAddressModal(true)}
                      className="border p-3 rounded-lg cursor-pointer hover:border-pink-500"
                    >
                      <p className="font-semibold">
                        {address.full_name} | {address.phone}
                      </p>
                      <p className="text-sm text-gray-600">
                        {address.street}, {address.ward}, {address.district},{" "}
                        {address.province}
                      </p>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowAddressModal(true)}
                      className="border-dashed border-2 p-4 rounded-lg w-full text-pink-500"
                    >
                      + Thêm địa chỉ giao hàng
                    </button>
                  )}
                </div>

                {/* Shipping Method */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Truck size={20} />
                    Phương thức vận chuyển
                  </h3>
                  <select
                    name="shipping_method"
                    value={formData.shipping_method}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="ghn">Giao Hàng Nhanh</option>
                    <option value="ghtk">Giao Hàng Tiết Kiệm</option>
                    <option value="viettel_post">Viettel Post</option>
                  </select>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                {/* Payment Methods */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <CreditCard size={20} />
                    Chọn phương thức thanh toán
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { id: "vnpay", name: "VNPay", icon: "💳" },
                      { id: "momo", name: "MoMo", icon: "👛" },
                      { id: "bank_transfer", name: "Chuyển khoản", icon: "🏦" },
                      { id: "cod", name: "COD", icon: "💵" },
                    ].map((method) => (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            payment_method: method.id,
                          }))
                        }
                        className={`p-4 rounded-xl border-2 transition-all ${
                          formData.payment_method === method.id
                            ? "border-pink-500 bg-pink-50"
                            : "border-gray-200 hover:border-pink-300"
                        }`}
                      >
                        <div className="text-3xl mb-2">{method.icon}</div>
                        <p className="font-medium">{method.name}</p>
                      </button>
                    ))}
                  </div>

                  {formData.payment_method === "bank_transfer" && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-semibold text-green-900 mb-2">
                        Thông tin chuyển khoản
                      </h4>
                      <div className="space-y-1 text-sm text-green-800">
                        <p>
                          <strong>Ngân hàng:</strong> Vietcombank
                        </p>
                        <p>
                          <strong>STK:</strong> 1234567890
                        </p>
                        <p>
                          <strong>Chủ TK:</strong> FASHIONHUB CO., LTD
                        </p>
                        <p>
                          <strong>Số tiền:</strong> {formatPrice(totalAmount)}
                        </p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="mt-3 w-full"
                      />
                      {previewUrl && (
                        <img
                          src={previewUrl}
                          className="mt-2 max-h-32 rounded"
                        />
                      )}
                    </div>
                  )}
                </div>

                {/* Summary */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Tổng tiền hàng:</span>
                      <span className="font-semibold">
                        {formatPrice(items.reduce((s, i) => s + i.price, 0))}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Phí vận chuyển:</span>
                      <span className="font-semibold">
                        {formatPrice(
                          items.reduce((s, i) => s + i.shipping_fee, 0)
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Phí dịch vụ:</span>
                      <span className="font-semibold">
                        {formatPrice(
                          items.reduce((s, i) => s + i.price * 0.05, 0)
                        )}
                      </span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-bold text-lg">
                      <span>Tổng cộng:</span>
                      <span className="text-pink-600">
                        {formatPrice(totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {step === 3 && (
              <div className="text-center py-8">
                <CheckCircle className="w-20 h-20 text-green-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">
                  Đặt hàng thành công!
                </h3>
                <p className="text-gray-600">
                  Đơn hàng của bạn đang được xử lý
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t flex gap-3">
            {step > 1 && step < 3 && (
              <button
                onClick={() => setStep(step - 1)}
                className="flex-1 py-3 rounded-lg border border-gray-300 font-semibold hover:bg-gray-50"
              >
                Quay lại
              </button>
            )}
            {step < 3 && (
              <button
                onClick={step === 1 ? () => setStep(2) : handleCheckout}
                disabled={loading}
                className="flex-1 py-3 rounded-lg bg-pink-500 text-white font-semibold hover:bg-pink-600 disabled:opacity-50"
              >
                {loading ? (
                  <Loader className="animate-spin mx-auto" size={20} />
                ) : step === 1 ? (
                  "Tiếp tục"
                ) : (
                  "Xác nhận thanh toán"
                )}
              </button>
            )}
            {step === 3 && (
              <button
                onClick={() => {
                  onSuccess();
                  router.push("/marketplace/marketplace");
                }}
                className="w-full py-3 rounded-lg bg-pink-500 text-white font-semibold"
              >
                Xem đơn hàng
              </button>
            )}
          </div>
        </div>
      </div>
      <AddressListModal
        isOpen={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        onSelect={(addr) => {
          setAddress(addr); // ✅ để UI hiển thị
          setFormData((f) => ({
            ...f,
            shipping_address_id: addr, // ✅ để gửi backend
          }));
        }}
      />
    </>
  );
}
