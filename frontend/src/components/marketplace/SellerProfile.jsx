//frontend/src/pages/marketplace/components/SellerProfile.jsx
import { useState } from "react";
import { useRouter } from "next/router";
import { Star, ShoppingBag, RefreshCw, CheckCircle, MessageCircle } from "lucide-react";

export default function SellerProfile({ seller }) {
  const router = useRouter();
  const [showContactModal, setShowContactModal] = useState(false);

  if (!seller) return null;

  const formatRating = (rating) => {
    return rating ? rating.toFixed(1) : "0.0";
  };

  const handleViewShop = () => {
    router.push(`/marketplace?seller_id=${seller._id}`);
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Người bán</h3>

        {/* Seller Avatar & Name */}
        <div className="flex items-center gap-4 mb-4">
          <img
            src={seller.avatar || "/default-avatar.png"}
            alt={seller.fullName}
            className="w-16 h-16 rounded-full object-cover ring-2 ring-gray-100"
          />
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              {seller.fullName}
              {seller.is_verified_seller && (
                <CheckCircle className="text-blue-500" size={16} />
              )}
            </h4>
            {seller.bio && (
              <p className="text-sm text-gray-600 line-clamp-2 mt-1">{seller.bio}</p>
            )}
          </div>
        </div>

        {/* Seller Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
          {/* Rating */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Star className="text-yellow-500 fill-current" size={18} />
              <span className="font-bold text-gray-900">
                {formatRating(seller.seller_rating)}
              </span>
            </div>
            <p className="text-xs text-gray-600">Đánh giá</p>
          </div>

          {/* Total Sales */}
          <div className="text-center border-l border-r border-gray-200">
            <div className="flex items-center justify-center gap-1 mb-1">
              <ShoppingBag size={18} className="text-gray-600" />
              <span className="font-bold text-gray-900">{seller.total_sales || 0}</span>
            </div>
            <p className="text-xs text-gray-600">Đã bán</p>
          </div>

          {/* Total Swaps */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <RefreshCw size={18} className="text-gray-600" />
              <span className="font-bold text-gray-900">{seller.total_swaps || 0}</span>
            </div>
            <p className="text-xs text-gray-600">Đã swap</p>
          </div>
        </div>

        {/* Contact Info */}
        {seller.phone && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>SĐT:</strong> {seller.phone}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={() => setShowContactModal(true)}
            className="w-full py-3 rounded-lg bg-pink-500 text-white font-semibold hover:bg-pink-600 transition-colors flex items-center justify-center gap-2"
          >
            <MessageCircle size={18} />
            Nhắn tin
          </button>

          <button
            onClick={handleViewShop}
            className="w-full py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:border-pink-500 hover:bg-pink-50 hover:text-pink-700 transition-colors"
          >
            Xem shop
          </button>
        </div>

        {/* Trust Indicators */}
        <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
          <p className="text-xs text-gray-500 flex items-center gap-2">
            <CheckCircle size={14} className="text-green-500" />
            Đã xác thực email
          </p>
          {seller.is_verified_seller && (
            <p className="text-xs text-gray-500 flex items-center gap-2">
              <CheckCircle size={14} className="text-blue-500" />
              Người bán uy tín
            </p>
          )}
          <p className="text-xs text-gray-500">
            Tham gia: {new Date(seller.createdAt).toLocaleDateString("vi-VN")}
          </p>
        </div>
      </div>

      {/* Contact Modal (Simple) */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Liên hệ người bán</h3>
            <div className="space-y-3">
              {seller.phone && (
                <a
                  href={`tel:${seller.phone}`}
                  className="block w-full py-3 rounded-lg bg-green-500 text-white font-semibold hover:bg-green-600 transition-colors text-center"
                >
                  Gọi điện: {seller.phone}
                </a>
              )}
              {seller.email && (
                <a
                  href={`mailto:${seller.email}`}
                  className="block w-full py-3 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-colors text-center"
                >
                  Email: {seller.email}
                </a>
              )}
            </div>
            <button
              onClick={() => setShowContactModal(false)}
              className="w-full mt-4 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </>
  );
}