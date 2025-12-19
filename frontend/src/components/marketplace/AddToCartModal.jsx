// frontend/src/components/marketplace/AddToCartModal.jsx
import { X, ShoppingCart, CheckCircle } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/context/CartContext";

export default function AddToCartModal({ listing, onClose }) {
  const { addToCart } = useCart();
  const [result, setResult] = useState(null);

  const handleAddToCart = () => {
    const result = addToCart(listing);
    setResult(result);

    if (result.success) {
      // Auto close after 1.5s
      setTimeout(() => {
        onClose();
      }, 1500);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const totalAmount =
    listing.selling_price +
    (listing.shipping_fee || 0) +
    listing.selling_price * 0.05;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Xác nhận thêm vào giỏ hàng</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {result ? (
            // Result Display
            <div className="text-center py-8">
              {result.success ? (
                <>
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="text-green-600" size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {result.message}
                  </h3>
                  <p className="text-gray-600">
                    Chuyển sang giỏ hàng để thanh toán
                  </p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <X className="text-red-600" size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Không thể thêm
                  </h3>
                  <p className="text-red-600">{result.message}</p>
                </>
              )}
            </div>
          ) : (
            // Item Info
            <>
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <img
                  src={listing.item_id?.image_url}
                  alt={listing.item_id?.item_name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 line-clamp-1">
                    {listing.item_id?.item_name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {listing.item_id?.category_id?.name}
                  </p>
                  <p className="text-lg font-bold text-pink-600 mt-1">
                    {formatPrice(listing.selling_price)}
                  </p>
                </div>
              </div>

              {/* Price Details */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Giá sản phẩm:</span>
                  <span className="font-medium">{formatPrice(listing.selling_price)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phí vận chuyển:</span>
                  <span className="font-medium">
                    {formatPrice(listing.shipping_fee || 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phí dịch vụ (5%):</span>
                  <span className="font-medium">
                    {formatPrice(listing.selling_price * 0.05)}
                  </span>
                </div>
                <div className="border-t border-gray-300 pt-2 flex justify-between">
                  <span className="font-semibold text-gray-900">Tổng cộng:</span>
                  <span className="font-bold text-pink-600 text-lg">
                    {formatPrice(totalAmount)}
                  </span>
                </div>
              </div>

              {/* Note */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  💡 Sau khi thêm vào giỏ hàng, bạn có thể chọn phương thức vận chuyển và thanh toán tại trang giỏ hàng.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!result && (
          <div className="p-6 border-t border-gray-200 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleAddToCart}
              className="flex-1 py-3 rounded-lg bg-pink-500 text-white font-semibold hover:bg-pink-600 transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingCart size={20} />
              Thêm vào giỏ
            </button>
          </div>
        )}
      </div>
    </div>
  );
}