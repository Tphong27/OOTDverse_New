//frontend/src/pages/marketplace/components/ListingInfo.jsx
import { Package, Truck, Shield, Eye, Heart, Clock } from "lucide-react";

export default function ListingInfo({ listing }) {
  const getConditionLabel = (condition) => {
    const labels = {
      new: "Mới 100%",
      like_new: "Như mới (95-99%)",
      good: "Tốt (80-94%)",
      fair: "Khá (60-79%)",
      worn: "Đã sử dụng (<60%)",
    };
    return labels[condition] || condition;
  };

  const getConditionColor = (condition) => {
    const colors = {
      new: "bg-green-100 text-green-800",
      like_new: "bg-blue-100 text-blue-800",
      good: "bg-yellow-100 text-yellow-800",
      fair: "bg-orange-100 text-orange-800",
      worn: "bg-gray-100 text-gray-800",
    };
    return colors[condition] || "bg-gray-100 text-gray-800";
  };

  const getShippingMethodLabel = (method) => {
    const labels = {
      ghn: "Giao Hàng Nhanh",
      ghtk: "Giao Hàng Tiết Kiệm",
      viettel_post: "Viettel Post",
      self_delivery: "Tự giao hàng",
      meetup: "Gặp mặt trực tiếp",
    };
    return labels[method] || method;
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return "Vừa xong";
    if (seconds < 3600) return Math.floor(seconds / 60) + " phút trước";
    if (seconds < 86400) return Math.floor(seconds / 3600) + " giờ trước";
    if (seconds < 604800) return Math.floor(seconds / 86400) + " ngày trước";
    return new Date(date).toLocaleDateString("vi-VN");
  };

  return (
    <div className="space-y-6">
      {/* Title & Category */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          {listing.item_id?.item_name}
        </h1>

        <div className="flex flex-wrap items-center gap-3 mb-4">
          {/* Category */}
          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
            {listing.item_id?.category_id?.name}
          </span>

          {/* Brand */}
          {listing.item_id?.brand_id && (
            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
              {listing.item_id?.brand_id?.name}
            </span>
          )}

          {/* Condition */}
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getConditionColor(listing.condition)}`}>
            {getConditionLabel(listing.condition)}
          </span>

          {/* Listing Type */}
          {listing.listing_type === "swap" && (
            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
              Chỉ Swap
            </span>
          )}
          {listing.listing_type === "both" && (
            <span className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full text-sm font-medium">
              Bán & Swap
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 text-sm text-gray-600 pt-4 border-t border-gray-100">
          <span className="flex items-center gap-1">
            <Eye size={16} />
            {listing.view_count || 0} lượt xem
          </span>
          <span className="flex items-center gap-1">
            <Heart size={16} />
            {listing.favorite_count || 0} yêu thích
          </span>
          <span className="flex items-center gap-1">
            <Clock size={16} />
            {timeAgo(listing.listed_at)}
          </span>
        </div>
      </div>

      {/* Description */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Mô tả</h2>
        <p className="text-gray-700 whitespace-pre-line leading-relaxed">
          {listing.description}
        </p>

        {listing.condition_note && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Ghi chú tình trạng:</strong> {listing.condition_note}
            </p>
          </div>
        )}
      </div>

      {/* Item Details */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Thông tin chi tiết</h2>
        <dl className="grid grid-cols-2 gap-4">
          {/* Size */}
          {listing.item_id?.size && (
            <>
              <dt className="text-gray-600">Size</dt>
              <dd className="text-gray-900 font-medium">{listing.item_id.size}</dd>
            </>
          )}

          {/* Material */}
          {listing.item_id?.material_id && (
            <>
              <dt className="text-gray-600">Chất liệu</dt>
              <dd className="text-gray-900 font-medium">{listing.item_id.material_id.name}</dd>
            </>
          )}

          {/* Colors */}
          {listing.item_id?.color_id?.length > 0 && (
            <>
              <dt className="text-gray-600">Màu sắc</dt>
              <dd className="text-gray-900 font-medium">
                {listing.item_id.color_id.map((c) => c.name).join(", ")}
              </dd>
            </>
          )}

          {/* Seasons */}
          {listing.item_id?.season_id?.length > 0 && (
            <>
              <dt className="text-gray-600">Mùa</dt>
              <dd className="text-gray-900 font-medium">
                {listing.item_id.season_id.map((s) => s.name).join(", ")}
              </dd>
            </>
          )}

          {/* Purchase Date */}
          {listing.item_id?.purchase_date && (
            <>
              <dt className="text-gray-600">Ngày mua</dt>
              <dd className="text-gray-900 font-medium">
                {new Date(listing.item_id.purchase_date).toLocaleDateString("vi-VN")}
              </dd>
            </>
          )}

          {/* Original Price */}
          {listing.original_price && (
            <>
              <dt className="text-gray-600">Giá gốc</dt>
              <dd className="text-gray-900 font-medium">
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(listing.original_price)}
              </dd>
            </>
          )}
        </dl>
      </div>

      {/* Shipping Info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Truck size={20} />
          Thông tin vận chuyển
        </h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Phương thức</span>
            <span className="text-gray-900 font-medium">
              {getShippingMethodLabel(listing.shipping_method)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Phí vận chuyển</span>
            <span className="text-gray-900 font-medium">
              {listing.shipping_fee > 0
                ? new Intl.NumberFormat("vi-VN").format(listing.shipping_fee) + " đ"
                : "Miễn phí"}
            </span>
          </div>
        </div>

        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
          <Shield className="text-blue-600 flex-shrink-0 mt-1" size={20} />
          <div>
            <p className="text-sm font-medium text-blue-800 mb-1">Bảo vệ người mua</p>
            <p className="text-xs text-blue-700">
              Hoàn tiền nếu sản phẩm không đúng mô tả hoặc không nhận được hàng
            </p>
          </div>
        </div>
      </div>

      {/* Swap Preferences (if applicable) */}
      {listing.listing_type !== "sell" && listing.swap_preferences && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Package size={20} />
            Ưu tiên Swap
          </h2>

          {listing.swap_preferences.categories?.length > 0 && (
            <div className="mb-3">
              <p className="text-sm text-gray-600 mb-2">Danh mục mong muốn:</p>
              <div className="flex flex-wrap gap-2">
                {listing.swap_preferences.categories.map((cat) => (
                  <span
                    key={cat._id}
                    className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                  >
                    {cat.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {listing.swap_preferences.brands?.length > 0 && (
            <div className="mb-3">
              <p className="text-sm text-gray-600 mb-2">Thương hiệu mong muốn:</p>
              <div className="flex flex-wrap gap-2">
                {listing.swap_preferences.brands.map((brand) => (
                  <span
                    key={brand._id}
                    className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                  >
                    {brand.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {listing.swap_preferences.sizes?.length > 0 && (
            <div className="mb-3">
              <p className="text-sm text-gray-600 mb-2">Size mong muốn:</p>
              <div className="flex flex-wrap gap-2">
                {listing.swap_preferences.sizes.map((size, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                  >
                    {size}
                  </span>
                ))}
              </div>
            </div>
          )}

          {listing.swap_preferences.note && (
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-sm text-purple-800">{listing.swap_preferences.note}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}