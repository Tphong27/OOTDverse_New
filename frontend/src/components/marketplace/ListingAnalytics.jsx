//frontend/src/components/marketplace/ListingAnalytics.jsx
import { X, TrendingUp, Eye, Heart, MessageCircle, DollarSign, Package } from "lucide-react";

export default function ListingAnalytics({ listings, stats, isOpen, onClose }) {
  if (!isOpen) return null;

  // Top performing listings by views
  const topByViews = [...listings]
    .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
    .slice(0, 5);

  // Top by favorites
  const topByFavorites = [...listings]
    .sort((a, b) => (b.favorite_count || 0) - (a.favorite_count || 0))
    .slice(0, 5);

  // Recent sold items
  const recentlySold = listings
    .filter((l) => l.status === "sold")
    .sort((a, b) => new Date(b.sold_at) - new Date(a.sold_at))
    .slice(0, 5);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const avgPrice = stats.total > 0
    ? listings.reduce((sum, l) => sum + (l.selling_price || 0), 0) / stats.total
    : 0;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Thống kê & Phân tích</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[calc(90vh-180px)] overflow-y-auto">
          {/* Overview Stats */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tổng quan</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                <div className="flex items-center gap-2 text-blue-600 mb-2">
                  <Package size={20} />
                  <span className="text-sm font-medium">Tổng listings</span>
                </div>
                <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-600 mb-2">
                  <TrendingUp size={20} />
                  <span className="text-sm font-medium">Đang bán</span>
                </div>
                <p className="text-2xl font-bold text-green-900">{stats.active}</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
                <div className="flex items-center gap-2 text-purple-600 mb-2">
                  <Eye size={20} />
                  <span className="text-sm font-medium">Lượt xem</span>
                </div>
                <p className="text-2xl font-bold text-purple-900">{stats.totalViews}</p>
              </div>

              <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg p-4">
                <div className="flex items-center gap-2 text-pink-600 mb-2">
                  <DollarSign size={20} />
                  <span className="text-sm font-medium">Doanh thu</span>
                </div>
                <p className="text-xl font-bold text-pink-900">
                  {formatPrice(stats.totalRevenue)}
                </p>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Chỉ số hiệu suất</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Trung bình lượt xem/listing</p>
                <p className="text-xl font-bold text-gray-900">
                  {stats.total > 0 ? Math.round(stats.totalViews / stats.total) : 0}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Trung bình yêu thích/listing</p>
                <p className="text-xl font-bold text-gray-900">
                  {stats.total > 0 ? Math.round(stats.totalFavorites / stats.total) : 0}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Giá trung bình</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatPrice(avgPrice)}
                </p>
              </div>
            </div>
          </div>

          {/* Top Performers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top by Views */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Top Lượt xem
              </h3>
              <div className="space-y-3">
                {topByViews.length > 0 ? (
                  topByViews.map((listing, index) => (
                    <div
                      key={listing._id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <img
                        src={listing.item_id?.image_url}
                        alt={listing.item_id?.item_name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {listing.item_id?.item_name}
                        </p>
                        <p className="text-xs text-gray-600 flex items-center gap-1">
                          <Eye size={12} />
                          {listing.view_count || 0} lượt xem
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">Chưa có dữ liệu</p>
                )}
              </div>
            </div>

            {/* Top by Favorites */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Top Yêu thích
              </h3>
              <div className="space-y-3">
                {topByFavorites.length > 0 ? (
                  topByFavorites.map((listing, index) => (
                    <div
                      key={listing._id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <img
                        src={listing.item_id?.image_url}
                        alt={listing.item_id?.item_name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {listing.item_id?.item_name}
                        </p>
                        <p className="text-xs text-gray-600 flex items-center gap-1">
                          <Heart size={12} />
                          {listing.favorite_count || 0} yêu thích
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">Chưa có dữ liệu</p>
                )}
              </div>
            </div>
          </div>

          {/* Recently Sold */}
          {recentlySold.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Đã bán gần đây
              </h3>
              <div className="space-y-3">
                {recentlySold.map((listing) => (
                  <div
                    key={listing._id}
                    className="flex items-center gap-3 p-3 bg-green-50 rounded-lg"
                  >
                    <img
                      src={listing.item_id?.image_url}
                      alt={listing.item_id?.item_name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {listing.item_id?.item_name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatPrice(listing.selling_price)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        {new Date(listing.sold_at).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-lg bg-gray-900 text-white font-semibold hover:bg-gray-800 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}