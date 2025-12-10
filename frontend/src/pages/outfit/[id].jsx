import LayoutUser from "@/components/layout/LayoutUser";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useOutfit } from "@/context/OutfitContext";
import { useAuth } from "@/context/AuthContext";
import {
  Heart,
  Bookmark,
  Eye,
  Star,
  Edit2,
  Trash2,
  Share2,
  AlertCircle,
  ArrowLeft,
  Calendar,
  Cloud,
  Sparkles,
  TrendingUp,
  Clock,
  Shirt,
  Lock,
  Globe,
  CheckCircle,
  X,
} from "lucide-react";

export default function OutfitDetail() {
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
    getOutfitScore,
  } = useOutfit();

  const [userRating, setUserRating] = useState(0);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (id) {
      // Increment view khi load trang
      fetchOutfitById(id, true);
    }
  }, [id]);

  useEffect(() => {
    if (currentOutfit) {
      setUserRating(currentOutfit.user_rating || 0);
    }
  }, [currentOutfit]);

  // Handle actions
  const handleLike = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    const increment = !isLiked;
    await toggleLike(id, increment);
    setIsLiked(!isLiked);
  };

  const handleSave = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    const increment = !isSaved;
    await toggleSave(id, increment);
    setIsSaved(!isSaved);
  };

  const handleRecordWear = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    await recordWear(id);
    alert("Đã ghi nhận mặc outfit!");
  };

  const handleRating = async (rating) => {
    if (!user) {
      router.push("/login");
      return;
    }
    await updateRating(id, rating);
    setUserRating(rating);
    setShowRatingModal(false);
  };

  const handleEdit = () => {
    router.push(`/outfit/edit/${id}`);
  };

  const handleDelete = async () => {
    if (confirm("Bạn có chắc muốn xóa outfit này?")) {
      const result = await deleteOutfit(id);
      if (result.success) {
        router.push("/outfit");
      }
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: currentOutfit.outfit_name,
        text: currentOutfit.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Đã copy link!");
    }
  };

  if (loading) {
    return (
      <LayoutUser>
        <div className="flex items-center justify-center py-40">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600"></div>
        </div>
      </LayoutUser>
    );
  }

  if (error || !currentOutfit) {
    return (
      <LayoutUser>
        <div className="text-center py-20 bg-white rounded-2xl">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Không tìm thấy outfit
          </h3>
          <p className="text-gray-600 mb-6">
            Outfit này không tồn tại hoặc đã bị xóa.
          </p>
          <button
            onClick={() => router.push("/outfit")}
            className="px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-all"
          >
            Quay lại danh sách
          </button>
        </div>
      </LayoutUser>
    );
  }

  const isOwner = user && currentOutfit.user_id?._id === user._id;
  const groupedItems = groupCurrentOutfitItems();
  const score = getOutfitScore(currentOutfit);

  return (
    <LayoutUser>
      <div className="space-y-6">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Quay lại</span>
        </button>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Image */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="relative aspect-square">
              <img
                src={
                  currentOutfit.full_image_url ||
                  currentOutfit.thumbnail_url ||
                  "/placeholder-outfit.jpg"
                }
                alt={currentOutfit.outfit_name}
                className="w-full h-full object-cover"
              />

              {currentOutfit.is_featured && (
                <div className="absolute top-4 left-4 px-4 py-2 bg-yellow-400 text-black font-bold rounded-full shadow-lg">
                  ⭐ Featured
                </div>
              )}

              {!currentOutfit.is_public && (
                <div className="absolute top-4 right-4 px-4 py-2 bg-black/70 text-white font-medium rounded-full shadow-lg flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Riêng tư
                </div>
              )}
            </div>

            {/* Stats Bar */}
            <div className="p-4 bg-gray-50 border-t flex justify-between items-center">
              <div className="flex gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {currentOutfit.view_count || 0}
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  {currentOutfit.like_count || 0}
                </span>
                <span className="flex items-center gap-1">
                  <Bookmark className="w-4 h-4" />
                  {currentOutfit.save_count || 0}
                </span>
                <span className="flex items-center gap-1">
                  <Shirt className="w-4 h-4" />
                  Mặc {currentOutfit.wear_count || 0} lần
                </span>
              </div>
              <span className="text-sm font-semibold text-purple-600">
                Score: {score}%
              </span>
            </div>
          </div>

          {/* Right: Details */}
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {currentOutfit.outfit_name}
              </h1>

              {/* User Info */}
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={currentOutfit.user_id?.avatar || "/default-avatar.png"}
                  alt={currentOutfit.user_id?.fullName}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium text-gray-900">
                    {currentOutfit.user_id?.fullName}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(currentOutfit.created_date).toLocaleDateString(
                      "vi-VN"
                    )}
                  </p>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {currentOutfit.style_id && (
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full font-medium flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    {currentOutfit.style_id.name}
                  </span>
                )}
                {currentOutfit.occasion_id && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full font-medium flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    {currentOutfit.occasion_id.name}
                  </span>
                )}
                {currentOutfit.season_id && (
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full font-medium flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {currentOutfit.season_id.name}
                  </span>
                )}
                {currentOutfit.weather_id && (
                  <span className="px-3 py-1 bg-orange-100 text-orange-700 text-sm rounded-full font-medium flex items-center gap-1">
                    <Cloud className="w-3 h-3" />
                    {currentOutfit.weather_id.name}
                  </span>
                )}
              </div>

              {/* Description */}
              {currentOutfit.description && (
                <div className="mb-4">
                  <p className="text-gray-700 leading-relaxed">
                    {currentOutfit.description}
                  </p>
                </div>
              )}

              {/* Custom Tags */}
              {currentOutfit.tags && currentOutfit.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {currentOutfit.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Rating */}
              <div className="flex items-center gap-2 mb-6">
                <span className="text-sm text-gray-600">Đánh giá:</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 cursor-pointer transition-all ${
                        star <= (userRating || 0)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                      onClick={() => isOwner && setShowRatingModal(true)}
                    />
                  ))}
                </div>
                {isOwner && (
                  <button
                    onClick={() => setShowRatingModal(true)}
                    className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                  >
                    Đánh giá
                  </button>
                )}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                {isOwner ? (
                  <>
                    <button
                      onClick={handleEdit}
                      className="px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                    >
                      <Edit2 className="w-4 h-4" />
                      Chỉnh sửa
                    </button>
                    <button
                      onClick={handleDelete}
                      className="px-4 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-all flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Xóa
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleLike}
                      className={`px-4 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                        isLiked
                          ? "bg-red-600 text-white"
                          : "bg-red-50 text-red-600 hover:bg-red-100"
                      }`}
                    >
                      <Heart className={isLiked ? "fill-white" : ""} />
                      Like
                    </button>
                    <button
                      onClick={handleSave}
                      className={`px-4 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                        isSaved
                          ? "bg-blue-600 text-white"
                          : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                      }`}
                    >
                      <Bookmark className={isSaved ? "fill-white" : ""} />
                      Save
                    </button>
                  </>
                )}
              </div>

              {isOwner && (
                <button
                  onClick={handleRecordWear}
                  className="w-full mt-3 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Ghi nhận mặc hôm nay
                </button>
              )}

              <button
                onClick={handleShare}
                className="w-full mt-3 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Chia sẻ
              </button>
            </div>

            {/* Additional Info */}
            {(currentOutfit.notes || currentOutfit.last_worn_date) && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Thông tin thêm
                </h3>

                {currentOutfit.last_worn_date && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <Clock className="w-4 h-4" />
                    <span>
                      Mặc lần cuối:{" "}
                      {new Date(
                        currentOutfit.last_worn_date
                      ).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                )}

                {currentOutfit.notes && (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-gray-700">
                      {currentOutfit.notes}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Outfit Items */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Shirt className="w-6 h-6" />
            Items trong outfit ({currentOutfit.items?.length || 0})
          </h2>

          {currentOutfit.items && currentOutfit.items.length > 0 ? (
            <div className="space-y-6">
              {Object.entries(groupedItems).map(([position, items]) => {
                if (items.length === 0) return null;

                return (
                  <div key={position}>
                    <h3 className="font-semibold text-gray-700 mb-3 capitalize">
                      {position} ({items.length})
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {items.map((outfitItem) => (
                        <OutfitItemCard
                          key={outfitItem._id}
                          outfitItem={outfitItem}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              Không có item nào trong outfit này
            </p>
          )}
        </div>
      </div>

      {/* Rating Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                Đánh giá outfit
              </h3>
              <button
                onClick={() => setShowRatingModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-gray-600 mb-6">
              Bạn đánh giá outfit này như thế nào?
            </p>

            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-12 h-12 cursor-pointer transition-all hover:scale-110 ${
                    star <= userRating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300 hover:text-yellow-400"
                  }`}
                  onClick={() => handleRating(star)}
                />
              ))}
            </div>

            <button
              onClick={() => setShowRatingModal(false)}
              className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all"
            >
              Hủy
            </button>
          </div>
        </div>
      )}
    </LayoutUser>
  );
}

// Outfit Item Card Component
const OutfitItemCard = ({ outfitItem }) => {
  const item = outfitItem.item_id;

  return (
    <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-200 hover:shadow-md transition-all">
      <div className="relative aspect-square">
        <img
          src={item.image_url || "/placeholder-item.jpg"}
          alt={item.name}
          className="w-full h-full object-cover"
        />
        {outfitItem.is_optional && (
          <div className="absolute top-2 right-2 px-2 py-1 bg-blue-500 text-white text-xs font-bold rounded">
            Optional
          </div>
        )}
        {outfitItem.layer_position && (
          <div className="absolute top-2 left-2 px-2 py-1 bg-black/70 text-white text-xs font-medium rounded">
            {outfitItem.layer_position}
          </div>
        )}
      </div>

      <div className="p-3">
        <p className="font-medium text-gray-900 text-sm truncate mb-1">
          {item.item_name}
        </p>
        <p className="text-xs text-gray-500">{item.category_id?.name}</p>
        {outfitItem.styling_note && (
          <p className="text-xs text-gray-600 mt-2 italic line-clamp-2">
            "{outfitItem.styling_note}"
          </p>
        )}
      </div>
    </div>
  );
};
