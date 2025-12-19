// frontend/src/components/cart/CartTab.jsx
import { useState } from "react";
import { ShoppingCart, Trash2, ShoppingBag, AlertCircle } from "lucide-react";
import { useCart } from "@/context/CartContext";
import CheckoutModal from "./CheckoutModal";

export default function CartTab() {
  const { cartItems, cartCount, cartTotal, shippingTotal, platformFeeTotal, grandTotal, removeFromCart } = useCart();
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
      setSelectedItems(cartItems.map(item => item.listing_id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (listingId) => {
    setSelectedItems(prev => {
      if (prev.includes(listingId)) {
        return prev.filter(id => id !== listingId);
      } else {
        return [...prev, listingId];
      }
    });
  };

  const handleRemove = (listingId) => {
    if (confirm("Bạn có chắc muốn xóa món đồ này khỏi giỏ hàng?")) {
      removeFromCart(listingId);
      setSelectedItems(prev => prev.filter(id => id !== listingId));
    }
  };

  const selectedItemsData = cartItems.filter(item => selectedItems.includes(item.listing_id));
  const selectedTotal = selectedItemsData.reduce((sum, item) => sum + item.price, 0);
  const selectedShipping = selectedItemsData.reduce((sum, item) => sum + item.shipping_fee, 0);
  const selectedPlatformFee = selectedItemsData.reduce((sum, item) => sum + (item.price * 0.05), 0);
  const selectedGrandTotal = selectedTotal + selectedShipping + selectedPlatformFee;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <ShoppingCart size={32} />
            Giỏ hàng của tôi
          </h1>
          <p className="text-gray-600 mt-1">{cartCount} món đồ</p>
        </div>
      </div>

      {/* Empty Cart */}
      {cartCount === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
          <ShoppingCart size={64} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Giỏ hàng trống
          </h3>
          <p className="text-gray-600 mb-6">
            Hãy thêm món đồ yêu thích vào giỏ hàng!
          </p>
          <button
            onClick={() => window.location.href = "/marketplace/marketplace"}
            className="px-6 py-3 bg-pink-500 text-white rounded-xl font-semibold hover:bg-pink-600 transition-colors"
          >
            Khám phá ngay
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {/* Select All */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedItems.length === cartCount}
                  onChange={handleSelectAll}
                  className="w-5 h-5 text-pink-600 rounded focus:ring-2 focus:ring-pink-500"
                />
                <span className="font-semibold text-gray-900">
                  Chọn tất cả ({cartCount})
                </span>
              </label>
            </div>

            {/* Cart Items List */}
            {cartItems.map((item) => (
              <div
                key={item.listing_id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.listing_id)}
                    onChange={() => handleSelectItem(item.listing_id)}
                    className="w-5 h-5 text-pink-600 rounded focus:ring-2 focus:ring-pink-500 mt-1"
                  />

                  {/* Image */}
                  <img
                    src={item.item_image}
                    alt={item.item_name}
                    className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                      {item.item_name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {item.category} {item.brand && `• ${item.brand}`}
                    </p>
                    <div className="flex items-center gap-2 mb-2">
                      <img
                        src={item.seller_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.seller_name)}`}
                        alt={item.seller_name}
                        className="w-6 h-6 rounded-full"
                      />
                      <span className="text-sm text-gray-600">{item.seller_name}</span>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div>
                        <p className="text-lg font-bold text-pink-600">
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
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-20">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Tóm tắt đơn hàng
              </h3>

              {selectedItems.length === 0 ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={18} />
                    <p className="text-sm text-yellow-800">
                      Vui lòng chọn ít nhất một món đồ để thanh toán
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-gray-700">
                      <span>Số lượng:</span>
                      <span className="font-semibold">{selectedItems.length} món</span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span>Tổng tiền hàng:</span>
                      <span className="font-semibold">{formatPrice(selectedTotal)}</span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span>Phí vận chuyển:</span>
                      <span className="font-semibold">{formatPrice(selectedShipping)}</span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span>Phí dịch vụ (5%):</span>
                      <span className="font-semibold">{formatPrice(selectedPlatformFee)}</span>
                    </div>
                    <div className="border-t border-gray-300 pt-3 flex justify-between">
                      <span className="text-lg font-bold text-gray-900">Tổng cộng:</span>
                      <span className="text-2xl font-bold text-pink-600">
                        {formatPrice(selectedGrandTotal)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowCheckout(true)}
                    className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-bold hover:from-pink-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    <ShoppingBag size={20} />
                    Thanh toán ({selectedItems.length})
                  </button>
                </>
              )}

              {/* Trust Indicators */}
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span>Thanh toán an toàn & bảo mật</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span>Hoàn tiền nếu không nhận được hàng</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
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