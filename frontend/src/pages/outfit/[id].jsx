// frontend/src/pages/outfit/[id].jsx
import LayoutUser from "@/components/layout/LayoutUser";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import { useOutfit } from "@/context/OutfitContext";
import {
  Heart,
  Bookmark,
  Eye,
  Star,
  Share2,
  Edit,
  Trash2,
  Calendar,
  User,
  Sparkles,
  ShoppingBag,
  Shirt,
  ArrowLeft,
  MoreVertical,
  Clock,
  CheckCircle,
} from "lucide-react";

export default function OutfitDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();

  const {
    currentOutfit,
    loading,
    error,
    fetchOutfitById,
    deleteOutfit,
    toggleLike,
    toggleSave,
    recordWear,
    updateRating,
    groupCurrentOutfitItems,
  } = useOutfit();

  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Load outfit data
  useEffect(() => {
    if (id) {
      fetchOutfitById(id, true); // increment view count
    }
  }, [id]);

  // Initialize user interactions
  useEffect(() => {
    if (currentOutfit) {
      setUserRating(currentOutfit.user_rating || 0);
    }
  }, [currentOutfit]);

  const isOwner = user?._id === currentOutfit?.user_id?._id;
  const groupedItems = groupCurrentOutfitItems();

  // Handlers
  const handleLike = async () => {
    if (!user) {
      alert("Vui lòng đăng nhập");
      return;
    }
    await toggleLike(id, !isLiked);
    setIsLiked(!isLiked);
  };

  const handleSave = async () => {
    if (!user) {
      alert("Vui lòng đăng nhập");
      return;
    }
    await toggleSave(id, !isSaved);
    setIsSaved(!isSaved);
  };

  const handleWear = async () => {
    if (!user) {
      alert("Vui lòng đăng nhập");
      return;
    }
    const result = await recordWear(id);
    if (result.success) {
      alert("Đã ghi nhận mặc outfit!");
    }
  };

  const handleRating = async (rating) => {
    if (!user) {
      alert("Vui lòng đăng nhập");
      return;
    }
    if (!isOwner) {
      alert("Chỉ chủ sở hữu mới có thể đánh giá");
      return;
    }

    await updateRating(id, rating);
    setUserRating(rating);
    setShowRating(false);
  };

  const handleEdit = () => {
    router.push(`/outfits/edit/${id}`);
  };

  const handleDelete = async () => {
    const result = await deleteOutfit(id);
    if (result.success) {
      alert("Đã xóa outfit!");
      router.push("/outfits");
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: currentOutfit.outfit_name,
          text: currentOutfit.description,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Share failed:", err);
      }
    } else {
      // Fallback: copy link
      navigator.clipboard.writeText(window.location.href);
      alert("Đã copy link!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !currentOutfit) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-red-600 mb-4">{error || "Không tìm thấy outfit"}</p>
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:underline"
        >
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <LayoutUser>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft size={20} />
                Quay lại
              </button>

              <div className="flex items-center gap-2">
                {/* Share */}
                <button
                  onClick={handleShare}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <Share2 size={20} />
                </button>

                {/* Owner actions */}
                {isOwner && (
                  <div className="relative">
                    <button
                      onClick={() => setShowMenu(!showMenu)}
                      className="p-2 hover:bg-gray-100 rounded-full"
                    >
                      <MoreVertical size={20} />
                    </button>

                    {showMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-20">
                        <button
                          onClick={() => {
                            handleEdit();
                            setShowMenu(false);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-left"
                        >
                          <Edit size={16} />
                          Chỉnh sửa
                        </button>
                        <button
                          onClick={() => {
                            setShowDeleteConfirm(true);
                            setShowMenu(false);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-left text-red-600"
                        >
                          <Trash2 size={16} />
                          Xóa outfit
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Image & Stats */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="bg-white rounded-lg overflow-hidden shadow">
                <div className="aspect-[3/4] bg-gray-100">
                  {currentOutfit.full_image_url ||
                  currentOutfit.thumbnail_url ? (
                    <img
                      src={
                        currentOutfit.full_image_url ||
                        currentOutfit.thumbnail_url
                      }
                      alt={currentOutfit.outfit_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Shirt size={64} />
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="p-4 flex gap-3">
                  <button
                    onClick={handleLike}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium ${
                      isLiked
                        ? "bg-red-50 text-red-600"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
                    {currentOutfit.like_count || 0}
                  </button>

                  <button
                    onClick={handleSave}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium ${
                      isSaved
                        ? "bg-blue-50 text-blue-600"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <Bookmark
                      size={20}
                      fill={isSaved ? "currentColor" : "none"}
                    />
                    {currentOutfit.save_count || 0}
                  </button>

                  {isOwner && (
                    <button
                      onClick={handleWear}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-100 text-green-700 rounded-lg font-medium hover:bg-green-200"
                    >
                      <CheckCircle size={20} />
                      Đã mặc
                    </button>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="bg-white rounded-lg shadow p-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
                      <Eye size={18} />
                    </div>
                    <p className="text-2xl font-bold">
                      {currentOutfit.view_count || 0}
                    </p>
                    <p className="text-sm text-gray-500">Lượt xem</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
                      <Heart size={18} />
                    </div>
                    <p className="text-2xl font-bold">
                      {currentOutfit.like_count || 0}
                    </p>
                    <p className="text-sm text-gray-500">Thích</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
                      <ShoppingBag size={18} />
                    </div>
                    <p className="text-2xl font-bold">
                      {currentOutfit.wear_count || 0}
                    </p>
                    <p className="text-sm text-gray-500">Đã mặc</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Details */}
            <div className="space-y-4">
              {/* Basic Info */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold mb-2">
                      {currentOutfit.outfit_name}
                    </h1>

                    {currentOutfit.user_id && (
                      <div className="flex items-center gap-2 text-gray-600 mb-3">
                        <User size={18} />
                        <span>{currentOutfit.user_id.fullName}</span>
                      </div>
                    )}

                    {currentOutfit.ai_suggested && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                        <Sparkles size={14} />
                        AI Suggest
                      </span>
                    )}
                  </div>

                  {/* Rating */}
                  {isOwner && (
                    <div className="text-right">
                      <button
                        onClick={() => setShowRating(!showRating)}
                        className="flex items-center gap-1 text-yellow-600 hover:text-yellow-700"
                      >
                        <Star
                          size={20}
                          fill={userRating > 0 ? "currentColor" : "none"}
                        />
                        <span className="text-lg font-semibold">
                          {userRating > 0 ? `${userRating}/5` : "Đánh giá"}
                        </span>
                      </button>

                      {showRating && (
                        <div className="mt-2 flex gap-1">
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <button
                              key={rating}
                              onClick={() => handleRating(rating)}
                              className="hover:scale-110 transition-transform"
                            >
                              <Star
                                size={24}
                                fill={rating <= userRating ? "#EAB308" : "none"}
                                className={
                                  rating <= userRating
                                    ? "text-yellow-500"
                                    : "text-gray-300"
                                }
                              />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Description */}
                {currentOutfit.description && (
                  <p className="text-gray-700 mb-4">
                    {currentOutfit.description}
                  </p>
                )}

                {/* Tags */}
                {currentOutfit.tags && currentOutfit.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {currentOutfit.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Metadata */}
                <div className="grid grid-cols-2 gap-3 pt-4 border-t">
                  {currentOutfit.style_id && (
                    <div>
                      <p className="text-sm text-gray-500">Phong cách</p>
                      <p className="font-medium">
                        {currentOutfit.style_id.name}
                      </p>
                    </div>
                  )}
                  {currentOutfit.occasion_id && (
                    <div>
                      <p className="text-sm text-gray-500">Dịp</p>
                      <p className="font-medium">
                        {currentOutfit.occasion_id.name}
                      </p>
                    </div>
                  )}
                  {currentOutfit.season_id && (
                    <div>
                      <p className="text-sm text-gray-500">Mùa</p>
                      <p className="font-medium">
                        {currentOutfit.season_id.name}
                      </p>
                    </div>
                  )}
                  {currentOutfit.weather_id && (
                    <div>
                      <p className="text-sm text-gray-500">Thời tiết</p>
                      <p className="font-medium">
                        {currentOutfit.weather_id.name}
                      </p>
                    </div>
                  )}
                </div>

                {/* Dates */}
                <div className="flex items-center gap-4 mt-4 pt-4 border-t text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar size={16} />
                    Tạo:{" "}
                    {new Date(currentOutfit.created_date).toLocaleDateString(
                      "vi-VN"
                    )}
                  </div>
                  {currentOutfit.last_worn_date && (
                    <div className="flex items-center gap-1">
                      <Clock size={16} />
                      Mặc lần cuối:{" "}
                      {new Date(
                        currentOutfit.last_worn_date
                      ).toLocaleDateString("vi-VN")}
                    </div>
                  )}
                </div>
              </div>

              {/* Items in Outfit */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">
                  Món đồ trong Outfit ({currentOutfit.items?.length || 0})
                </h2>

                <div className="space-y-4">
                  {Object.entries(groupedItems).map(([position, items]) => {
                    if (items.length === 0) return null;

                    const positionLabels = {
                      head: "Đầu",
                      top: "Trên",
                      bottom: "Dưới",
                      footwear: "Giày dép",
                      accessories: "Phụ kiện",
                      other: "Khác",
                    };

                    return (
                      <div key={position}>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">
                          {positionLabels[position]}
                        </h3>
                        <div className="space-y-2">
                          {items.map((outfitItem) => {
                            const item = outfitItem.item_id;
                            return (
                              <div
                                key={outfitItem._id}
                                className="flex gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                                onClick={() =>
                                  router.push(`/wardrobe/${item._id}`)
                                }
                              >
                                <div className="w-16 h-16 flex-shrink-0 rounded overflow-hidden bg-gray-100">
                                  <img
                                    src={item.image_url}
                                    alt={item.item_name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>

                                <div className="flex-1 min-w-0">
                                  <p className="font-medium truncate">
                                    {item.item_name}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {item.category_id?.name}
                                  </p>

                                  {outfitItem.styling_note && (
                                    <p className="text-xs text-gray-400 mt-1 italic">
                                      "{outfitItem.styling_note}"
                                    </p>
                                  )}

                                  <div className="flex gap-2 mt-1">
                                    {outfitItem.layer_position && (
                                      <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded">
                                        {outfitItem.layer_position}
                                      </span>
                                    )}
                                    {outfitItem.is_optional && (
                                      <span className="text-xs px-2 py-0.5 bg-orange-50 text-orange-700 rounded">
                                        Optional
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Private Notes (Owner only) */}
              {isOwner && currentOutfit.notes && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <h3 className="font-semibold mb-2">Ghi chú riêng tư</h3>
                  <p className="text-gray-700">{currentOutfit.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-bold mb-3">Xác nhận xóa</h3>
              <p className="text-gray-600 mb-6">
                Bạn có chắc muốn xóa outfit "{currentOutfit.outfit_name}"? Hành
                động này không thể hoàn tác.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </LayoutUser>
  );
}
