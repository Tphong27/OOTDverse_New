//frontend/src/pages/marketplace/ListingCard.jsx
import { useState } from "react";
import { useRouter } from "next/router";
import { Heart, Eye, MapPin, Clock, TrendingUp } from "lucide-react";
import { useMarketplace } from "@/context/MarketplaceContext";
import { useAuth } from "@/context/AuthContext";

export default function ListingCard({ listing, showSellerInfo = true }) {
  const router = useRouter();
  const { user } = useAuth();
  const { toggleListingFavorite } = useMarketplace();
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(listing.favorite_count || 0);

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // Format time ago
  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return "Vừa xong";
    if (seconds < 3600) return Math.floor(seconds / 60) + " phút trước";
    if (seconds < 86400) return Math.floor(seconds / 3600) + " giờ trước";
    if (seconds < 604800) return Math.floor(seconds / 86400) + " ngày trước";
    return new Date(date).toLocaleDateString("vi-VN");
  };

  // Get condition label
  const getConditionLabel = (condition) => {
    const labels = {
      new: "Mới 100%",
      like_new: "Như mới",
      good: "Tốt",
      fair: "Khá",
      worn: "Đã sử dụng",
    };
    return labels[condition] || condition;
  };

  // Get condition color
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

  // Handle favorite toggle
  const handleFavorite = async (e) => {
    e.stopPropagation();
    if (!user) {
      router.push("/login");
      return;
    }

    try {
      await toggleListingFavorite(listing._id, isFavorited);
      setIsFavorited(!isFavorited);
      setFavoriteCount(isFavorited ? favoriteCount - 1 : favoriteCount + 1);
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  // Handle card click
  const handleClick = () => {
    router.push(`/marketplace/${listing._id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border border-gray-100 group"
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <img
          src={listing.item_id?.image_url || "/placeholder-item.png"}
          alt={listing.item_id?.item_name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {/* Listing Type Badge */}
          {listing.listing_type === "swap" && (
            <span className="bg-purple-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
              Chỉ Swap
            </span>
          )}
          {listing.listing_type === "both" && (
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
              Bán & Swap
            </span>
          )}

          {/* Featured Badge */}
          {listing.is_featured && (
            <span className="bg-yellow-500 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
              <TrendingUp size={12} />
              Nổi bật
            </span>
          )}
        </div>

        {/* Favorite Button */}
        <button
          onClick={handleFavorite}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all ${
            isFavorited
              ? "bg-red-500 text-white"
              : "bg-white/80 text-gray-700 hover:bg-red-500 hover:text-white"
          }`}
        >
          <Heart
            size={18}
            fill={isFavorited ? "currentColor" : "none"}
            strokeWidth={2}
          />
        </button>

        {/* Condition Badge */}
        <div className="absolute bottom-3 left-3">
          <span
            className={`text-xs font-medium px-3 py-1 rounded-full ${getConditionColor(
              listing.condition
            )}`}
          >
            {getConditionLabel(listing.condition)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Item Name */}
        <h3 className="font-semibold text-gray-900 text-lg mb-2 line-clamp-1">
          {listing.item_id?.item_name}
        </h3>

        {/* Category & Brand */}
        <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
          <span>{listing.item_id?.category_id?.name}</span>
          {listing.item_id?.brand_id && (
            <>
              <span>•</span>
              <span>{listing.item_id?.brand_id?.name}</span>
            </>
          )}
        </div>

        {/* Price or Swap Info */}
        {listing.listing_type !== "swap" ? (
          <div className="mb-3">
            <p className="text-2xl font-bold text-pink-600">
              {formatPrice(listing.selling_price)}
            </p>
            {listing.original_price && listing.original_price > listing.selling_price && (
              <p className="text-sm text-gray-500 line-through">
                {formatPrice(listing.original_price)}
              </p>
            )}
          </div>
        ) : (
          <div className="mb-3">
            <p className="text-lg font-semibold text-purple-600">Trao đổi</p>
            <p className="text-sm text-gray-600">Chấp nhận swap</p>
          </div>
        )}

        {/* Seller Info */}
        {showSellerInfo && listing.seller_id && (
          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-100">
            <img
              src={listing.seller_id.avatar || "/default-avatar.png"}
              alt={listing.seller_id.fullName}
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {listing.seller_id.fullName}
              </p>
              {listing.seller_id.seller_rating > 0 && (
                <p className="text-xs text-yellow-600">
                  ⭐ {listing.seller_id.seller_rating.toFixed(1)}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Eye size={16} />
              {listing.view_count || 0}
            </span>
            <span className="flex items-center gap-1">
              <Heart size={16} />
              {favoriteCount}
            </span>
          </div>
          <span className="flex items-center gap-1">
            <Clock size={16} />
            {timeAgo(listing.listed_at)}
          </span>
        </div>

        {/* Location (if available) */}
        {listing.shipping_from_location?.province && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <span className="flex items-center gap-1 text-sm text-gray-600">
              <MapPin size={16} />
              {listing.shipping_from_location.province}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}