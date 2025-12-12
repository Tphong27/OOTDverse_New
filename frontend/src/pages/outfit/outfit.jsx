import LayoutUser from "@/components/layout/LayoutUser";
import { useState, useEffect } from "react";
import { useOutfit } from "@/context/OutfitContext";
import { useSettings } from "@/context/SettingContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";
import {
  Plus,
  Search,
  Filter,
  Heart,
  Bookmark,
  Eye,
  Star,
  AlertCircle,
  Grid3x3,
  List,
  Shirt,
  Calendar,
  Cloud,
  Sparkles,
  TrendingUp,
  User,
  Globe,
  Lock,
} from "lucide-react";

export default function OutfitPage() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    outfits,
    loading,
    error,
    fetchOutfits,
    fetchUserOutfits,
    toggleLike,
    toggleSave,
    getOutfitScore,
    updateOutfit,
  } = useOutfit();

  const { settings } = useSettings();

  const [viewMode, setViewMode] = useState("grid");
  const [activeTab, setActiveTab] = useState("explore");

  const [selectedFilters, setSelectedFilters] = useState({
    style_id: "",
    occasion_id: "",
    season_id: "",
    weather_id: "",
    sort_by: "newest",
  });
  const [searchQuery, setSearchQuery] = useState("");

  // Lấy outfits theo tab
  useEffect(() => {
    if (activeTab === "explore") {
      const filterParams = {
        ...selectedFilters,
        is_public: true,
      };
      fetchOutfits(filterParams);
    } else if (activeTab === "my-outfits" && user) {
      fetchUserOutfits(user._id, selectedFilters);
    }
  }, [selectedFilters, activeTab, user]);

  const handleFilterChange = (key, value) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedFilters({
      style_id: "",
      occasion_id: "",
      season_id: "",
      weather_id: "",
      sort_by: "newest",
    });
    setSearchQuery("");
  };

  const handleLike = async (e, outfitId) => {
    e.stopPropagation();
    if (!user) {
      router.push("/login");
      return;
    }
    await toggleLike(outfitId, true);
  };

  const handleSave = async (e, outfitId) => {
    e.stopPropagation();
    if (!user) {
      router.push("/login");
      return;
    }
    await toggleSave(outfitId, true);
  };

  const handleTogglePrivacy = async (e, outfitId, currentStatus) => {
    e.stopPropagation();

    if (!user) {
      router.push("/login");
      return;
    }

    try {
      const result = await updateOutfit(outfitId, {
        is_public: !currentStatus,
      });

      if (result.success) {
        if (activeTab === "my-outfits") {
          fetchUserOutfits(user._id, selectedFilters);
        }
      }
    } catch (error) {
      console.error("Error toggling privacy:", error);
      alert("Lỗi khi thay đổi quyền riêng tư");
    }
  };

  const handleOutfitClick = (outfitId) => {
    router.push(`/outfit/${outfitId}`);
  };

  const handleCreateOutfit = () => {
    if (!user) {
      router.push("/login");
      return;
    }
    router.push("/outfit/form");
  };

  const filteredOutfits = outfits.filter((outfit) => {
    const matchSearch =
      outfit.outfit_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      outfit.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      outfit.tags?.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );

    if (activeTab === "explore" && user) {
      const notMyOutfit = outfit.user_id?._id !== user._id;
      return matchSearch && notMyOutfit;
    }

    return matchSearch;
  });

  const getSettingsByType = (type) => {
    return settings.filter((s) => s.type === type && s.status === "Active");
  };

  return (
    <LayoutUser>
      <div className="space-y-6">
        {/* Header with Tabs */}
        <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 rounded-2xl p-8 text-white shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3">
                <Shirt className="w-8 h-8" />
                Bộ sưu tập thời trang
              </h1>
              <p className="text-white/90 text-lg">
                {filteredOutfits.length} trang phục
              </p>
            </div>
            <button
              onClick={handleCreateOutfit}
              className="bg-white text-purple-600 px-6 py-3 rounded-xl font-semibold hover:bg-purple-50 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 group"
            >
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
              Phối đồ
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-3">
            {user && (
              <button
                onClick={() => handleTabChange("my-outfits")}
                className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                  activeTab === "my-outfits"
                    ? "bg-white text-purple-600 shadow-lg"
                    : "bg-white/20 text-white hover:bg-white/30"
                }`}
              >
                <User className="w-5 h-5" />
                Của tôi
              </button>
            )}
            <button
              onClick={() => handleTabChange("explore")}
              className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                activeTab === "explore"
                  ? "bg-white text-purple-600 shadow-lg"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              <Globe className="w-5 h-5" />
              Khám phá
            </button>
          </div>
        </div>

        {/* Search & View Mode */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm outfit theo tên, mô tả, tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-4 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
                  viewMode === "grid"
                    ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg"
                    : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                <Grid3x3 className="w-4 h-4" />
                Lưới
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-4 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
                  viewMode === "list"
                    ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg"
                    : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                <List className="w-4 h-4" />
                Danh sách
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar Filters */}
          <div className="w-64 flex-shrink-0 hidden lg:block">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sticky top-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Bộ lọc
                </h3>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Phong cách
                </label>
                <select
                  value={selectedFilters.style_id}
                  onChange={(e) =>
                    handleFilterChange("style_id", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                >
                  <option value="">Tất cả</option>
                  {getSettingsByType("style").map((style) => (
                    <option key={style._id} value={style._id}>
                      {style.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  Dịp mặc
                </label>
                <select
                  value={selectedFilters.occasion_id}
                  onChange={(e) =>
                    handleFilterChange("occasion_id", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                >
                  <option value="">Tất cả</option>
                  {getSettingsByType("occasion").map((occasion) => (
                    <option key={occasion._id} value={occasion._id}>
                      {occasion.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Mùa
                </label>
                <select
                  value={selectedFilters.season_id}
                  onChange={(e) =>
                    handleFilterChange("season_id", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                >
                  <option value="">Tất cả</option>
                  {getSettingsByType("season").map((season) => (
                    <option key={season._id} value={season._id}>
                      {season.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Cloud className="w-4 h-4" />
                  Thời tiết
                </label>
                <select
                  value={selectedFilters.weather_id}
                  onChange={(e) =>
                    handleFilterChange("weather_id", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                >
                  <option value="">Tất cả</option>
                  {getSettingsByType("weather").map((weather) => (
                    <option key={weather._id} value={weather._id}>
                      {weather.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Sắp xếp theo
                </label>
                <select
                  value={selectedFilters.sort_by}
                  onChange={(e) =>
                    handleFilterChange("sort_by", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                >
                  <option value="newest">Mới nhất</option>
                  <option value="popular">Phổ biến nhất</option>
                  <option value="rating">Đánh giá cao</option>
                  <option value="most_worn">Mặc nhiều nhất</option>
                </select>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {loading && (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600"></div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-900 mb-1">Lỗi</p>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            )}

            {!loading && !error && filteredOutfits.length === 0 && (
              <div className="text-center py-20 bg-white rounded-2xl">
                <div className="text-6xl mb-4">👔</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {activeTab === "my-outfits"
                    ? "Bạn chưa có outfit nào"
                    : searchQuery ||
                      Object.values(selectedFilters).some(
                        (v) => v && v !== "newest"
                      )
                    ? "Không tìm thấy outfit nào"
                    : "Chưa có outfit công khai nào"}
                </h3>
                <p className="text-gray-600 mb-6">
                  {activeTab === "my-outfits"
                    ? "Hãy tạo outfit đầu tiên của bạn!"
                    : searchQuery ||
                      Object.values(selectedFilters).some(
                        (v) => v && v !== "newest"
                      )
                    ? "Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"
                    : "Chờ người dùng khác chia sẻ outfit nhé!"}
                </p>
                {activeTab === "my-outfits" && (
                  <button
                    onClick={handleCreateOutfit}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all inline-flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Tạo Outfit Ngay
                  </button>
                )}
              </div>
            )}

            {!loading && !error && filteredOutfits.length > 0 && (
              <>
                <div className="mb-4 flex justify-between items-center">
                  <p className="text-sm text-gray-600">
                    Hiển thị{" "}
                    <span className="font-semibold">
                      {filteredOutfits.length}
                    </span>{" "}
                    outfits
                    {activeTab === "explore" && (
                      <span className="text-gray-400 ml-2">
                        (chỉ công khai)
                      </span>
                    )}
                  </p>
                </div>

                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                      : "space-y-4"
                  }
                >
                  {filteredOutfits.map((outfit) => (
                    <OutfitCard
                      key={outfit._id}
                      outfit={outfit}
                      viewMode={viewMode}
                      onLike={handleLike}
                      onSave={handleSave}
                      onTogglePrivacy={handleTogglePrivacy}
                      onClick={() => handleOutfitClick(outfit._id)}
                      getScore={getOutfitScore}
                      currentUserId={user?._id}
                      showPrivacyToggle={activeTab === "my-outfits"}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </LayoutUser>
  );
}

const OutfitCard = ({
  outfit,
  viewMode,
  onLike,
  onSave,
  onTogglePrivacy,
  onClick,
  getScore,
  currentUserId,
  showPrivacyToggle = false,
}) => {
  const score = getScore ? getScore(outfit) : 0;
  const isOwner = currentUserId === outfit.user_id?._id;

  if (viewMode === "list") {
    return (
      <div
        onClick={onClick}
        className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer p-4 flex gap-4 border border-gray-100"
      >
        <div className="relative w-32 h-32 flex-shrink-0">
          <img
            src={outfit.thumbnail_url || "/placeholder-outfit.jpg"}
            alt={outfit.outfit_name}
            className="w-full h-full object-cover rounded-lg"
          />
          <div className="absolute top-1 right-1">
            {showPrivacyToggle ? (
              <button
                onClick={(e) =>
                  onTogglePrivacy(e, outfit._id, outfit.is_public)
                }
                className={`text-xs font-bold px-2 py-1 rounded flex items-center gap-1 transition-all hover:scale-110 ${
                  outfit.is_public
                    ? "bg-green-500 hover:bg-green-600 text-white"
                    : "bg-gray-500 hover:bg-gray-600 text-white"
                }`}
                title={
                  outfit.is_public
                    ? "Click để đặt riêng tư"
                    : "Click để công khai"
                }
              >
                {outfit.is_public ? (
                  <Globe className="w-3 h-3" />
                ) : (
                  <Lock className="w-3 h-3" />
                )}
              </button>
            ) : (
              <div
                className={`text-xs font-bold px-2 py-1 rounded flex items-center gap-1 ${
                  outfit.is_public
                    ? "bg-green-500 text-white"
                    : "bg-gray-500 text-white"
                }`}
              >
                {outfit.is_public ? (
                  <Globe className="w-3 h-3" />
                ) : (
                  <Lock className="w-3 h-3" />
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1">
            <h3 className="font-semibold text-lg text-gray-900 truncate">
              {outfit.outfit_name}
            </h3>
            {isOwner && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium ml-2">
                Của tôi
              </span>
            )}
          </div>

          {outfit.user_id && (
            <p className="text-sm text-gray-500 mb-2">
              Bởi {outfit.user_id.fullName}
            </p>
          )}

          <div className="flex gap-2 mb-2 flex-wrap">
            {outfit.style_id && (
              <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                {outfit.style_id.name}
              </span>
            )}
            {outfit.occasion_id && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                {outfit.occasion_id.name}
              </span>
            )}
          </div>

          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {outfit.description || "Không có mô tả"}
          </p>

          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {outfit.view_count || 0}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="w-4 h-4" />
              {outfit.like_count || 0}
            </span>
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              {outfit.user_rating || "N/A"}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={(e) => onLike(e, outfit._id)}
            className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
          >
            <Heart className="w-5 h-5 text-gray-400 group-hover:text-red-500 group-hover:fill-red-500 transition-all" />
          </button>
          <button
            onClick={(e) => onSave(e, outfit._id)}
            className="p-2 hover:bg-blue-50 rounded-lg transition-colors group"
          >
            <Bookmark className="w-5 h-5 text-gray-400 group-hover:text-blue-500 group-hover:fill-blue-500 transition-all" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all cursor-pointer overflow-hidden border border-gray-100 group"
    >
      <div className="relative aspect-square">
        <img
          src={outfit.thumbnail_url || "/placeholder-outfit.jpg"}
          alt={outfit.outfit_name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        <div className="absolute top-2 left-2 z-10">
          {showPrivacyToggle ? (
            <button
              onClick={(e) => onTogglePrivacy(e, outfit._id, outfit.is_public)}
              className={`text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1 transition-all hover:scale-110 ${
                outfit.is_public
                  ? "bg-green-500 hover:bg-green-600 text-white"
                  : "bg-gray-500 hover:bg-gray-600 text-white"
              }`}
              title={
                outfit.is_public
                  ? "Click để đặt riêng tư"
                  : "Click để công khai"
              }
            >
              {outfit.is_public ? (
                <>
                  <Globe className="w-3 h-3" />
                  Công khai
                </>
              ) : (
                <>
                  <Lock className="w-3 h-3" />
                  Riêng tư
                </>
              )}
            </button>
          ) : (
            <div
              className={`text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1 ${
                outfit.is_public
                  ? "bg-green-500 text-white"
                  : "bg-gray-500 text-white"
              }`}
            >
              {outfit.is_public ? (
                <>
                  <Globe className="w-3 h-3" />
                  Công khai
                </>
              ) : (
                <>
                  <Lock className="w-3 h-3" />
                  Riêng tư
                </>
              )}
            </div>
          )}
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="absolute bottom-2 right-2 flex gap-2">
            <button
              onClick={(e) => onLike(e, outfit._id)}
              className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all shadow-lg group/btn"
            >
              <Heart className="w-4 h-4 text-gray-600 group-hover/btn:text-red-500 group-hover/btn:fill-red-500 transition-all" />
            </button>
            <button
              onClick={(e) => onSave(e, outfit._id)}
              className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all shadow-lg group/btn"
            >
              <Bookmark className="w-4 h-4 text-gray-600 group-hover/btn:text-blue-500 group-hover/btn:fill-blue-500 transition-all" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-purple-600 transition-colors flex-1">
            {outfit.outfit_name}
          </h3>
          {isOwner && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium ml-2">
              Của tôi
            </span>
          )}
        </div>

        {outfit.user_id && (
          <p className="text-sm text-gray-500 mb-2 truncate">
            {outfit.user_id.fullName}
          </p>
        )}

        <div className="flex gap-2 mb-3 flex-wrap">
          {outfit.style_id && (
            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
              {outfit.style_id.name}
            </span>
          )}
          {outfit.occasion_id && (
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
              {outfit.occasion_id.name}
            </span>
          )}
        </div>

        <div className="flex justify-between items-center text-sm">
          <div className="flex gap-3 text-gray-500">
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {outfit.view_count || 0}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="w-4 h-4" />
              {outfit.like_count || 0}
            </span>
          </div>
          <span className="font-semibold text-purple-600">{score}%</span>
        </div>
      </div>
    </div>
  );
};
