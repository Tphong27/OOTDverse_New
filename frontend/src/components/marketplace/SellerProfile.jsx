// frontend/src/components/marketplace/SellerProfile.jsx
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Star, ShoppingBag, RefreshCw, CheckCircle, MessageCircle } from "lucide-react";
import { getSellerDetail } from "../../services/userService";
import { useAuth } from "../../context/AuthContext";

export default function SellerProfile({ seller }) {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [showContactModal, setShowContactModal] = useState(false);
  const [showShopModal, setShowShopModal] = useState(false);
  const [sellerDetail, setSellerDetail] = useState(seller);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!seller) return null;

  const formatRating = (rating) => {
    return rating ? rating.toFixed(1) : "0.0";
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? "N/A" : date.toLocaleDateString("vi-VN");
  };

  const handleViewShop = async () => {
    setShowShopModal(true);
    setLoading(true);
    setError(null);
    try {
      // Gọi API với token từ currentUser
      const detail = await getSellerDetail(seller._id, currentUser?.token);
      setSellerDetail(detail);
    } catch (error) {
      console.error("Lỗi lấy chi tiết seller:", error);
      setError("Không thể tải thông tin chi tiết. Vui lòng thử lại.");
      setSellerDetail(seller); // Fallback về seller gốc nếu lỗi
    } finally {
      setLoading(false);
    }
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
            Xem chi tiết shop
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
        </div>
      </div>

      {/* Contact Modal */}
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

      {/* Shop Detail Modal */}
      {showShopModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Close Button - Always visible */}
            <div className="absolute top-4 right-4 z-10">
              <button
                onClick={() => setShowShopModal(false)}
                className="text-gray-400 hover:text-gray-600 bg-white rounded-full p-1 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-200 border-t-pink-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">Đang tải thông tin...</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-96">
                <div className="text-center p-6 bg-red-50 rounded-lg">
                  <p className="text-red-600 mb-4">{error}</p>
                  <button
                    onClick={handleViewShop}
                    className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
                  >
                    Thử lại
                  </button>
                </div>
              </div>
            ) : (
              <div className="overflow-y-auto flex-1 p-6">
                {/* Header Section */}
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <div className="flex items-start gap-4">
                    <img
                      src={sellerDetail?.avatar || "/default-avatar.png"}
                      alt={sellerDetail?.fullName || "Seller"}
                      className="w-24 h-24 rounded-full object-cover ring-4 ring-pink-100"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h2 className="text-2xl font-bold text-gray-900">
                          {sellerDetail?.fullName || "N/A"}
                        </h2>
                        {sellerDetail?.is_verified_seller && (
                          <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                            <CheckCircle size={14} /> Uy tín
                          </span>
                        )}
                      </div>
                      {sellerDetail?.bio && (
                        <p className="text-gray-600 text-sm mb-2">{sellerDetail.bio}</p>
                      )}
                      <p className="text-xs text-gray-500">
                        Tham gia từ {formatDate(sellerDetail?.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3 mb-6 p-4 bg-gradient-to-r from-pink-50 to-orange-50 rounded-xl">
                  <div className="text-center py-2">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Star className="text-yellow-500 fill-current" size={18} />
                      <span className="text-2xl font-bold text-gray-900">
                        {formatRating(sellerDetail?.seller_rating)}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-gray-600">Đánh giá</p>
                  </div>

                  <div className="text-center py-2 border-l border-r border-gray-300">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <ShoppingBag size={18} className="text-blue-600" />
                      <span className="text-2xl font-bold text-gray-900">{sellerDetail?.total_sales || 0}</span>
                    </div>
                    <p className="text-xs font-medium text-gray-600">Đã bán</p>
                  </div>

                  <div className="text-center py-2">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <RefreshCw size={18} className="text-green-600" />
                      <span className="text-2xl font-bold text-gray-900">{sellerDetail?.total_swaps || 0}</span>
                    </div>
                    <p className="text-xs font-medium text-gray-600">Đã swap</p>
                  </div>
                </div>

                {/* Additional Info */}
                {sellerDetail?.location && (
                  <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-900">
                      <strong>Địa chỉ:</strong> {sellerDetail.location}
                    </p>
                  </div>
                )}

                {/* Contact Section */}
                <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <MessageCircle size={18} />
                    Liên hệ
                  </h4>
                  {sellerDetail?.phone || sellerDetail?.email ? (
                    <div className="space-y-2">
                      {sellerDetail?.phone && (
                        <a
                          href={`tel:${sellerDetail.phone}`}
                          className="flex items-center gap-3 p-2 hover:bg-orange-100 rounded-lg transition-colors text-sm text-gray-700"
                        >
                          <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <span className="font-medium">{sellerDetail.phone}</span>
                        </a>
                      )}
                      {sellerDetail?.email && (
                        <a
                          href={`mailto:${sellerDetail.email}`}
                          className="flex items-center gap-3 p-2 hover:bg-orange-100 rounded-lg transition-colors text-sm text-gray-700 break-all"
                        >
                          <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span className="font-medium">{sellerDetail.email}</span>
                        </a>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">Chưa cập nhật thông tin liên hệ</p>
                  )}
                </div>

                {/* Trust Indicators */}
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <CheckCircle size={18} className="text-green-600" />
                    Độ tin cậy
                  </h4>
                  <div className="space-y-2">
                    <p className="text-sm text-green-800 flex items-center gap-2">
                      <CheckCircle size={14} className="text-green-600 flex-shrink-0" />
                      Email đã xác thực
                    </p>
                    {sellerDetail?.is_verified_seller && (
                      <p className="text-sm text-blue-800 flex items-center gap-2">
                        <CheckCircle size={14} className="text-blue-600 flex-shrink-0" />
                        Người bán uy tín
                      </p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setShowShopModal(false);
                      setShowContactModal(true);
                    }}
                    className="flex-1 py-3 px-4 rounded-lg bg-pink-500 text-white font-semibold hover:bg-pink-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <MessageCircle size={18} />
                    Nhắn tin
                  </button>
                  <button
                    onClick={() => setShowShopModal(false)}
                    className="flex-1 py-3 px-4 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}