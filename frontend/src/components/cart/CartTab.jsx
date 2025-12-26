// frontend/src/components/cart/CartTab.jsx
import { useState } from "react";
import { ShoppingCart, Trash2, ShoppingBag, AlertCircle } from "lucide-react";
import { useCart } from "@/context/CartContext";
import CheckoutModal from "./CheckoutModal";

export default function CartTab() {
  const {
    cartItems,
    cartCount,
    cartTotal,
    shippingTotal,
    platformFeeTotal,
    grandTotal,
    removeFromCart,
  } = useCart();

  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(cartItems.map((item) => item.listing_id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (listingId) => {
    setSelectedItems((prev) => {
      if (prev.includes(listingId)) {
        return prev.filter((id) => id !== listingId);
      } else {
        return [...prev, listingId];
      }
    });
  };

  const handleRemove = (listingId) => {
    if (confirm("Bạn có chắc muốn xóa món đồ này khỏi giỏ hàng?")) {
      removeFromCart(listingId);
      setSelectedItems((prev) => prev.filter((id) => id !== listingId));
    }
  };

  const selectedItemsData = cartItems.filter((item) =>
    selectedItems.includes(item.listing_id)
  );
  const selectedTotal = selectedItemsData.reduce(
    (sum, item) => sum + item.price,
    0
  );
  const selectedShipping = selectedItemsData.reduce(
    (sum, item) => sum + item.shipping_fee,
    0
  );
  const selectedPlatformFee = selectedItemsData.reduce(
    (sum, item) => sum + item.price * 0.05,
    0
  );
  // const selectedGrandTotal = selectedTotal + selectedShipping + selectedPlatformFee;

  const selectedGrandTotal = selectedTotal + selectedPlatformFee;
  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
          <ShoppingCart size={28} />
          Giỏ hàng của tôi
        </h1>
        <p className="text-gray-600 text-sm mt-1">{cartCount} món đồ</p>
      </div>

      {cartCount === 0 ? (
        <div className="text-center py-14 bg-white rounded-2xl shadow-sm">
          <ShoppingCart size={56} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold">Giỏ hàng trống</h3>
          <p className="text-gray-600 mb-6 text-sm">
            Hãy thêm món đồ yêu thích vào giỏ hàng!
          </p>
          <button
            onClick={() => (window.location.href = "/marketplace/marketplace")}
            className="px-6 py-3 bg-pink-500 text-white rounded-xl font-semibold"
          >
            Khám phá ngay
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT */}
          <div className="lg:col-span-2 space-y-4">
            {/* Select All */}
            <div className="bg-white rounded-xl p-4 border">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedItems.length === cartCount}
                  onChange={handleSelectAll}
                  className="w-5 h-5"
                />
                <span className="font-semibold">Chọn tất cả ({cartCount})</span>
              </label>
            </div>

            {/* Items */}
            {cartItems.map((item) => (
              <div
                key={item.listing_id}
                className="bg-white rounded-xl border p-4 sm:p-6"
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex gap-3">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.listing_id)}
                      onChange={() => handleSelectItem(item.listing_id)}
                      className="w-5 h-5 mt-1"
                    />
                    <img
                      src={item.item_image}
                      alt={item.item_name}
                      className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg"
                    />
                  </div>

                  <div className="flex-1">
                    <h3 className="font-semibold line-clamp-1">
                      {item.item_name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-1">
                      {item.category} {item.brand && `• ${item.brand}`}
                    </p>

                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <img
                        src={item.seller_avatar}
                        className="w-6 h-6 rounded-full"
                      />
                      {item.seller_name}
                    </div>

                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-bold text-pink-600">
                          {formatPrice(item.price)}
                        </p>
                        {item.shipping_fee > 0 && (
                          <p className="text-xs text-gray-500">
                            + {formatPrice(item.shipping_fee)} phí ship
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => handleRemove(item.listing_id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT / SUMMARY */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border p-5 lg:sticky lg:top-20">
              <h3 className="text-lg font-bold mb-4">Tóm tắt đơn hàng</h3>

              {selectedItems.length === 0 ? (
                <div className="bg-yellow-50 border rounded-lg p-3 text-sm">
                  <div className="flex gap-2">
                    <AlertCircle size={16} />
                    Vui lòng chọn ít nhất một món đồ
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Số lượng</span>
                      <span>{selectedItems.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tiền hàng</span>
                      <span>{formatPrice(selectedTotal)}</span>
                    </div>
                    {/* <div className="flex justify-between">
                      <span>Phí ship</span>
                      <span>{formatPrice(selectedShipping)}</span>
                    </div> */}
                    <div className="flex justify-between">
                      <span>Phí dịch vụ (5%)</span>
                      <span>{formatPrice(selectedPlatformFee)}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-bold">
                      <span>Tổng</span>
                      <span className="text-pink-600">
                        {formatPrice(selectedGrandTotal)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowCheckout(true)}
                    className="mt-4 w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-bold flex justify-center gap-2"
                  >
                    <ShoppingBag size={18} />
                    Thanh toán
                  </button>
                </>
              )}

              {/* Trust Indicators */}
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-3 h-3 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span>Thanh toán an toàn & bảo mật</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-3 h-3 text-blue-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span>Hoàn tiền nếu không nhận được hàng</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCheckout && (
        <CheckoutModal
          items={selectedItemsData}
          isOpen={showCheckout}
          onClose={() => setShowCheckout(false)}
          onSuccess={() => {
            setShowCheckout(false);
            setSelectedItems([]);
          }}
        />
      )}
    </div>
  );
}
