//frontend/src/components/marketplace/MyListingCard.jsx
import { useState } from "react";
import { useRouter } from "next/router";
import { 
  Edit2, 
  Trash2, 
  TrendingUp, 
  Eye, 
  Heart, 
  MessageCircle,
  ExternalLink,
  Clock,
  CheckCircle,
  XCircle,
  Loader
} from "lucide-react";

export default function MyListingCard({ listing, onEdit, onDelete, onBoost }) {
  const router = useRouter();
  const [boosting, setBoosting] = useState(false);

  const getStatusBadge = (status) => {
    const badges = {
      active: {
        color: "bg-green-100 text-green-800",
        icon: <CheckCircle size={14} />,
        label: "Đang bán",
      },
      pending: {
        color: "bg-yellow-100 text-yellow-800",
        icon: <Clock size={14} />,
        label: "Chờ xử lý",
      },
      sold: {
        color: "bg-blue-100 text-blue-800",
        icon: <CheckCircle size={14} />,
        label: "Đã bán",
      },
      inactive: {
        color: "bg-gray-100 text-gray-800",
        icon: <XCircle size={14} />,
        label: "Đã ẩn",
      },
    };
    return badges[status] || badges.inactive;
  };

  const statusBadge = getStatusBadge(listing.status);

  const handleBoost = async (e) => {
    e.stopPropagation();
    setBoosting(true);
    try {
      await onBoost(listing._id);
    } finally {
      setBoosting(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return "Vừa xong";
    if (seconds < 3600) return Math.floor(seconds / 60) + " phút trước";
    if (seconds < 86400) return Math.floor(seconds / 3600) + " giờ trước";
    return Math.floor(seconds / 86400) + " ngày trước";
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image */}
      <div 
        className="relative aspect-square bg-gray-100 cursor-pointer group"
        onClick={() => router.push(`/marketplace/${listing._id}`)}
      >
        <img
          src={listing.item_id?.image_url}
          alt={listing.item_id?.item_name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${statusBadge.color}`}
          >
            {statusBadge.icon}
            {statusBadge.label}
          </span>
        </div>

        {/* View Listing Button */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/marketplace/${listing._id}`);
            }}
            className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
          >
            <ExternalLink size={16} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <h3 className="font-semibold text-gray-900 line-clamp-1">
          {listing.item_id?.item_name}
        </h3>

        {/* Price */}
        {listing.listing_type !== "swap" ? (
          <p className="text-xl font-bold text-pink-600">
            {formatPrice(listing.selling_price)}
          </p>
        ) : (
          <p className="text-lg font-semibold text-purple-600">Chỉ Swap</p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <Eye size={16} />
            {listing.view_count || 0}
          </span>
          <span className="flex items-center gap-1">
            <Heart size={16} />
            {listing.favorite_count || 0}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle size={16} />
            {listing.inquiry_count || 0}
          </span>
        </div>

        {/* Time Info */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
          <span>Đăng {timeAgo(listing.listed_at)}</span>
          {listing.boost_count > 0 && (
            <span className="flex items-center gap-1 text-yellow-600">
              <TrendingUp size={12} />
              Boost x{listing.boost_count}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="grid grid-cols-3 gap-2 pt-3">
          {/* Edit */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(listing);
            }}
            disabled={listing.status === "sold"}
            className="flex items-center justify-center gap-1 px-3 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Edit2 size={14} />
            Sửa
          </button>

          {/* Boost */}
          <button
            onClick={handleBoost}
            disabled={listing.status !== "active" || boosting}
            className="flex items-center justify-center gap-1 px-3 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:border-yellow-500 hover:bg-yellow-50 hover:text-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {boosting ? (
              <Loader size={14} className="animate-spin" />
            ) : (
              <TrendingUp size={14} />
            )}
            Boost
          </button>

          {/* Delete */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(listing);
            }}
            className="flex items-center justify-center gap-1 px-3 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:border-red-500 hover:bg-red-50 hover:text-red-700 transition-colors"
          >
            <Trash2 size={14} />
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
}