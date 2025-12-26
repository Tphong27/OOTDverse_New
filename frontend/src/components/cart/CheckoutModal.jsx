// frontend/src/components/cart/CheckoutModal.jsx
import { useState, useEffect } from "react";
import { 
  X, MapPin, CreditCard, AlertCircle, CheckCircle, Loader,
  Calendar, MessageCircle, Clock, Navigation
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useOrder } from "@/context/OrderContext";
import { useRouter } from "next/router";
import { getDefaultAddress } from "@/services/addressService";
import AddressListModal from "@/components/address/AddressListModal";
import ShippingSelector from "@/components/orders/ShippingSelector";
import MeetUpSelector from "@/components/orders/MeetUpSelector"; // NEW
import {
  createVNPayPayment,
  createMoMoPayment,
  confirmCODPayment,
} from "@/services/paymentService";

export default function CheckoutModal({ items, isOpen, onClose, onSuccess }) {
  const router = useRouter();
  const { user } = useAuth();
  const { removeItems } = useCart();
  const { placeOrder } = useOrder();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1);

  const [address, setAddress] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);

  const [selectedShipping, setSelectedShipping] = useState(null);
  const [shippingFee, setShippingFee] = useState(0);
  
  const [meetUpData, setMeetUpData] = useState(null);

  const [formData, setFormData] = useState({
    payment_method: "vnpay",
    buyer_note: "",
  });

  // Load default address
  useEffect(() => {
    async function loadAddress() {
      if (!isOpen) return;

      try {
        const res = await getDefaultAddress();
        if (res?.data) {
          setAddress(res.data);
        }
      } catch (err) {
        console.error("Load address failed", err);
      }
    }

    loadAddress();
  }, [isOpen]);

  // Update shipping fee when shipping method changes
  useEffect(() => {
    if (selectedShipping) {
      setShippingFee(selectedShipping.fee || 0);
    }
  }, [selectedShipping]);

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

  const handleSelectAddress = (selectedAddress) => {
    setAddress(selectedAddress);
    setShowAddressModal(false);
  };

  const handleNextStep = () => {
    if (step === 1 && !address) {
      setError("Vui lòng chọn địa chỉ giao hàng");
      return;
    }

    if (step === 2 && !selectedShipping) {
      setError("Vui lòng chọn phương thức vận chuyển");
      return;
    }

    // Validate meet up data if method is meetup
    if (step === 2 && selectedShipping?.id === "meetup" && !meetUpData) {
      setError("Vui lòng chọn địa điểm và thời gian gặp mặt");
      return;
    }

    setError(null);
    setStep(step + 1);
  };

  const handleCheckout = async () => {
    if (!selectedShipping) {
      setError("Vui lòng chọn phương thức vận chuyển");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const createdOrders = [];

      for (const item of items) {
        const orderData = {
          listing_id: item.listing_id,
          shipping_address_id: address._id,
          shipping_method: selectedShipping.id,
          shipping_fee: selectedShipping.fee,
          payment_method: formData.payment_method,
          buyer_note: formData.buyer_note,
          // Include meetup data if applicable
          ...(selectedShipping.id === "meetup" && meetUpData && {
            meetup_info: {
              buyer_proposal: meetUpData
            }
          })
        };

        const order = await placeOrder(orderData);
        createdOrders.push(order);
      }

      removeItems(items.map((item) => item.listing_id));

      if (
        formData.payment_method === "vnpay" ||
        formData.payment_method === "momo"
      ) {
        await handleOnlinePayment(createdOrders[0]);
      } else if (formData.payment_method === "cod") {
        for (const order of createdOrders) {
          await confirmCODPayment(order._id);
        }
        setStep(4);
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

  const itemTotal = items.reduce((sum, item) => sum + item.price, 0);
  const platformFee = items.reduce((sum, item) => sum + item.price * 0.05, 0);
  const totalAmount = itemTotal + shippingFee + platformFee;

  if (!isOpen) return null;

  const formatAddress = (addr) => {
    if (!addr) return "";
    const parts = [
      addr.street,
      addr.ward?.name || addr.ward,
      addr.district?.name || addr.district,
      addr.province?.name || addr.province,
    ].filter(Boolean);
    return parts.join(", ");
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full my-8">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {step === 1 && "Địa chỉ giao hàng"}
                {step === 2 && "Phương thức vận chuyển"}
                {step === 3 && "Thanh toán"}
                {step === 4 && "Hoàn tất"}
              </h2>
              <p className="text-sm text-gray-600 mt-1">Bước {step}/4</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
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

            {/* Step 1: Address */}
            {step === 1 && (
              <>
                {/* Items Summary */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold mb-3">
                    Đơn hàng ({items.length} món)
                  </h3>
                  <div className="space-y-2">
                    {items.map((item) => (
                      <div key={item.listing_id} className="flex items-center gap-3">
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

                {/* Address Selection */}
                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <MapPin size={20} />
                    Địa chỉ giao hàng
                  </h3>

                  {address ? (
                    <div
                      onClick={() => setShowAddressModal(true)}
                      className="border-2 border-gray-200 p-4 rounded-lg cursor-pointer hover:border-pink-500 transition-colors"
                    >
                      <p className="font-semibold text-gray-900">
                        {address.full_name} | {address.phone}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {formatAddress(address)}
                      </p>
                      <p className="text-xs text-pink-600 mt-2">
                        Nhấn để thay đổi
                      </p>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowAddressModal(true)}
                      className="border-dashed border-2 border-gray-300 p-4 rounded-lg w-full text-pink-500 hover:border-pink-500 transition-colors"
                    >
                      + Thêm địa chỉ giao hàng
                    </button>
                  )}
                </div>
              </>
            )}

            {/* Step 2: Shipping Method */}
            {step === 2 && address && (
              <div className="space-y-6">
                <ShippingSelector
                  listing={{ _id: items[0].listing_id }}
                  buyerAddress={address}
                  onSelect={setSelectedShipping}
                  selectedMethod={selectedShipping}
                />

                {/* Meet Up Selector - Show only if meetup is selected */}
                {selectedShipping?.id === "meetup" && (
                  <MeetUpSelector
                    sellerInfo={items[0]} // Pass seller info from cart item
                    buyerAddress={address}
                    onSelect={setMeetUpData}
                    selectedData={meetUpData}
                  />
                )}
              </div>
            )}

            {/* Step 3: Payment Method */}
            {step === 3 && (
              <>
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <CreditCard size={20} />
                    Phương thức thanh toán
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { id: "vnpay", name: "VNPay", icon: "💳" },
                      { id: "momo", name: "MoMo", icon: "👛" },
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
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Tổng tiền hàng:</span>
                      <span className="font-semibold">{formatPrice(itemTotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Phí vận chuyển:</span>
                      <span className="font-semibold">{formatPrice(shippingFee)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Phí dịch vụ:</span>
                      <span className="font-semibold">{formatPrice(platformFee)}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-bold text-lg">
                      <span>Tổng cộng:</span>
                      <span className="text-pink-600">{formatPrice(totalAmount)}</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Step 4: Success */}
            {step === 4 && (
              <div className="text-center py-8">
                <CheckCircle className="w-20 h-20 text-green-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">Đặt hàng thành công!</h3>
                <p className="text-gray-600">
                  {selectedShipping?.id === "meetup"
                    ? "Người bán sẽ xác nhận địa điểm và thời gian gặp mặt"
                    : "Đơn hàng của bạn đang được xử lý"}
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t flex gap-3">
            {step > 1 && step < 4 && (
              <button
                onClick={() => setStep(step - 1)}
                className="flex-1 py-3 rounded-lg border border-gray-300 font-semibold hover:bg-gray-50"
              >
                Quay lại
              </button>
            )}
            {step < 3 && (
              <button
                onClick={handleNextStep}
                disabled={loading || (step === 1 && !address) || (step === 2 && !selectedShipping)}
                className="flex-1 py-3 rounded-lg bg-pink-500 text-white font-semibold hover:bg-pink-600 disabled:opacity-50"
              >
                Tiếp tục
              </button>
            )}
            {step === 3 && (
              <button
                onClick={handleCheckout}
                disabled={loading}
                className="flex-1 py-3 rounded-lg bg-pink-500 text-white font-semibold hover:bg-pink-600 disabled:opacity-50"
              >
                {loading ? <Loader className="animate-spin mx-auto" size={20} /> : "Xác nhận thanh toán"}
              </button>
            )}
            {step === 4 && (
              <button
                onClick={() => {
                  onSuccess();
                  // router.push("/user/account");
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
        onSelect={handleSelectAddress}
      />
    </>
  );
}