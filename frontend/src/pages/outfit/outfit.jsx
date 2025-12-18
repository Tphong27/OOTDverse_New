import LayoutUser from "@/components/layout/LayoutUser";
import { useState, useEffect } from "react";
import { useOutfit } from "@/context/OutfitContext";
import { useSettings } from "@/context/SettingContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";
import Image from "next/image";
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
  X,
  ChevronDown,
  RotateCcw,
  Check,
} from "lucide-react";

// Component Bottom Sheet Filter cho Mobile
const MobileFilterSheet = ({
  show,
  onClose,
  selectedFilters,
  onFilterChange,
  getSettingsByType,
  onReset,
}) => {
  const [tempFilters, setTempFilters] = useState(selectedFilters);

  useEffect(() => {
    if (show) {
      setTempFilters(selectedFilters);
    }
  }, [show, selectedFilters]);

  const handleTempChange = (key, value) => {
    setTempFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleApply = () => {
    Object.keys(tempFilters).forEach((key) => {
      onFilterChange(key, tempFilters[key]);
    });
    onClose();
  };

  const handleReset = () => {
    const resetFilters = {
      style_id: "",
      occasion_id: "",
      season_id: "",
      weather_id: "",
      sort_by: "newest",
    };
    setTempFilters(resetFilters);
    onReset();
  };

  const hasActiveFilters = Object.entries(tempFilters).some(
    ([key, value]) => key !== "sort_by" && value !== ""
  );

  if (!show) return null;

  return (
    <>
      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }

        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }

        .filter-modal-content select {
          max-width: 100%;
        }

        .filter-modal-content {
          contain: layout style paint;
        }
      `}</style>

      <div className="fixed inset-0 z-50 lg:hidden">
        {/* Overlay với animation */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
          onClick={onClose}
        />

        {/* Bottom Sheet */}
        <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col animate-slide-up overflow-hidden">
          {/* Drag indicator */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1 bg-gray-300 rounded-full" />

          {/* Header */}
          <div className="flex-shrink-0 px-6 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  <Filter className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Bộ lọc</h3>
                  {hasActiveFilters && (
                    <p className="text-xs text-purple-600 font-medium">
                      Đang áp dụng bộ lọc
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-4 pb-6 filter-modal-content">
            <div className="space-y-5 max-w-full">
              {/* Phong cách */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  Phong cách
                </label>
                <div className="relative">
                  <select
                    value={tempFilters.style_id}
                    onChange={(e) =>
                      handleTempChange("style_id", e.target.value)
                    }
                    className="w-full px-4 py-3 pr-10 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm bg-white transition-all truncate"
                    style={{ appearance: "none", maxWidth: "100%" }}
                  >
                    <option value="">Tất cả phong cách</option>
                    {getSettingsByType("style").map((style) => (
                      <option key={style._id} value={style._id}>
                        {style.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  {tempFilters.style_id && (
                    <Check className="absolute right-10 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-600" />
                  )}
                </div>
              </div>

              {/* Dịp mặc */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <Star className="w-4 h-4 text-pink-600" />
                  Dịp mặc
                </label>
                <div className="relative">
                  <select
                    value={tempFilters.occasion_id}
                    onChange={(e) =>
                      handleTempChange("occasion_id", e.target.value)
                    }
                    className="w-full px-4 py-3 pr-10 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm bg-white transition-all truncate"
                    style={{ appearance: "none", maxWidth: "100%" }}
                  >
                    <option value="">Tất cả dịp</option>
                    {getSettingsByType("occasion").map((occasion) => (
                      <option key={occasion._id} value={occasion._id}>
                        {occasion.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  {tempFilters.occasion_id && (
                    <Check className="absolute right-10 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-600" />
                  )}
                </div>
              </div>

              {/* Mùa */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <Calendar className="w-4 h-4 text-green-600" />
                  Mùa
                </label>
                <div className="relative">
                  <select
                    value={tempFilters.season_id}
                    onChange={(e) =>
                      handleTempChange("season_id", e.target.value)
                    }
                    className="w-full px-4 py-3 pr-10 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm bg-white transition-all truncate"
                    style={{ appearance: "none", maxWidth: "100%" }}
                  >
                    <option value="">Tất cả mùa</option>
                    {getSettingsByType("season").map((season) => (
                      <option key={season._id} value={season._id}>
                        {season.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  {tempFilters.season_id && (
                    <Check className="absolute right-10 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-600" />
                  )}
                </div>
              </div>

              {/* Thời tiết */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <Cloud className="w-4 h-4 text-blue-600" />
                  Thời tiết
                </label>
                <div className="relative">
                  <select
                    value={tempFilters.weather_id}
                    onChange={(e) =>
                      handleTempChange("weather_id", e.target.value)
                    }
                    className="w-full px-4 py-3 pr-10 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm bg-white transition-all truncate"
                    style={{ appearance: "none", maxWidth: "100%" }}
                  >
                    <option value="">Tất cả thời tiết</option>
                    {getSettingsByType("weather").map((weather) => (
                      <option key={weather._id} value={weather._id}>
                        {weather.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  {tempFilters.weather_id && (
                    <Check className="absolute right-10 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-600" />
                  )}
                </div>
              </div>

              {/* Sắp xếp */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <TrendingUp className="w-4 h-4 text-orange-600" />
                  Sắp xếp theo
                </label>
                <div className="relative">
                  <select
                    value={tempFilters.sort_by}
                    onChange={(e) =>
                      handleTempChange("sort_by", e.target.value)
                    }
                    className="w-full px-4 py-3 pr-10 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm bg-white transition-all truncate"
                    style={{ appearance: "none", maxWidth: "100%" }}
                  >
                    <option value="newest">Mới nhất</option>
                    <option value="popular">Phổ biến nhất</option>
                    <option value="rating">Đánh giá cao</option>
                    <option value="most_worn">Mặc nhiều nhất</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Footer - Actions */}
          <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 bg-gray-50">
            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="flex-1 py-3 px-4 rounded-xl font-semibold text-gray-700 bg-white border-2 border-gray-200 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Đặt lại
              </button>
              <button
                onClick={handleApply}
                className="flex-[2] py-3 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" />
                Lọc trang phục
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

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

  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    if (user) {
      setActiveTab("my-outfits");
    } else {
      setActiveTab("explore");
    }
  }, [user]);

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

  const handleResetFilters = () => {
    setSelectedFilters({
      style_id: "",
      occasion_id: "",
      season_id: "",
      weather_id: "",
      sort_by: "newest",
    });
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

  const handleCreateOutfitwithAI = () => {
    if (!user) {
      router.push("/login");
      return;
    }
    router.push("#");
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

  // Tính số lượng filter đang active
  const activeFilterCount = Object.entries(selectedFilters).filter(
    ([key, value]) => key !== "sort_by" && value !== ""
  ).length;

  return (
    <LayoutUser>
      <div className="space-y-6">
        {/* Header with Tabs */}
        <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 rounded-2xl p-8 text-white shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-6">
            {/* ===== LEFT: TITLE ===== */}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3">
                <Shirt className="w-8 h-8" />
                Bộ sưu tập thời trang
              </h1>
              <p className="text-white/90 text-lg">
                {filteredOutfits.length} trang phục
              </p>
            </div>

            {/* ===== RIGHT: ACTION BUTTONS ===== */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleCreateOutfit}
                className="bg-white text-purple-600 px-6 py-3 rounded-xl font-semibold
                   hover:bg-purple-50 transition-all shadow-lg hover:shadow-xl
                   flex items-center gap-2 group"
              >
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                Phối đồ thủ công
              </button>

              <button
                onClick={handleCreateOutfitwithAI}
                className="bg-white/90 text-purple-700 px-6 py-3 rounded-xl font-semibold
                   hover:bg-white transition-all shadow-lg hover:shadow-xl
                   flex items-center gap-2 group border border-white/30"
              >
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                Phối đồ AI
              </button>
            </div>
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
              {/* Bộ lọc cho mobile */}
              <button
                onClick={() => setShowMobileFilters(true)}
                className="lg:hidden relative px-4 py-3 rounded-xl font-medium transition-all flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg hover:shadow-xl"
              >
                <Filter className="w-5 h-5" />
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setViewMode("grid")}
                className={`px-4 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
                  viewMode === "grid"
                    ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg"
                    : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                <Grid3x3 className="w-4 h-4" />
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
              </button>
            </div>
          </div>

          {/* Active Filters Display */}
          {activeFilterCount > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {selectedFilters.style_id && (
                <span className="px-3 py-1.5 bg-purple-100 text-purple-700 text-sm rounded-full font-medium flex items-center gap-1">
                  {
                    getSettingsByType("style").find(
                      (s) => s._id === selectedFilters.style_id
                    )?.name
                  }
                  <button onClick={() => handleFilterChange("style_id", "")}>
                    <X className="w-3 h-3 cursor-pointer hover:text-purple-900" />
                  </button>
                </span>
              )}
              {selectedFilters.occasion_id && (
                <span className="px-3 py-1.5 bg-pink-100 text-pink-700 text-sm rounded-full font-medium flex items-center gap-1">
                  {
                    getSettingsByType("occasion").find(
                      (s) => s._id === selectedFilters.occasion_id
                    )?.name
                  }
                  <button onClick={() => handleFilterChange("occasion_id", "")}>
                    <X className="w-3 h-3 cursor-pointer hover:text-pink-900" />
                  </button>
                </span>
              )}
              {selectedFilters.season_id && (
                <span className="px-3 py-1.5 bg-green-100 text-green-700 text-sm rounded-full font-medium flex items-center gap-1">
                  {
                    getSettingsByType("season").find(
                      (s) => s._id === selectedFilters.season_id
                    )?.name
                  }
                  <button onClick={() => handleFilterChange("season_id", "")}>
                    <X className="w-3 h-3 cursor-pointer hover:text-green-900" />
                  </button>
                </span>
              )}
              {selectedFilters.weather_id && (
                <span className="px-3 py-1.5 bg-blue-100 text-blue-700 text-sm rounded-full font-medium flex items-center gap-1">
                  {
                    getSettingsByType("weather").find(
                      (s) => s._id === selectedFilters.weather_id
                    )?.name
                  }
                  <button onClick={() => handleFilterChange("weather_id", "")}>
                    <X className="w-3 h-3 cursor-pointer hover:text-blue-900" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-6">
          {/* Sidebar Filters - Desktop Only */}
          <div className="w-64 flex-shrink-0 lg:block hidden">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sticky top-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Bộ lọc
                </h3>
              </div>

              <div className="mb-4">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
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
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
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
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
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
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
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
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
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

          {/* Mobile Filter Sheet */}
          <MobileFilterSheet
            show={showMobileFilters}
            onClose={() => setShowMobileFilters(false)}
            selectedFilters={selectedFilters}
            onFilterChange={handleFilterChange}
            getSettingsByType={getSettingsByType}
            onReset={handleResetFilters}
          />

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
                    <span className="font-semibold">
                      {filteredOutfits.length}
                    </span>{" "}
                    outfits
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
        <div className="relative w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden">
          <Image
            src={outfit.thumbnail_url || "/assets/placeholder-outfit.png"}
            alt={outfit.outfit_name}
            fill
            sizes="128px"
            className="object-cover"
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
            {outfit.style_id?.length > 0 && (
              <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                {outfit.style_id.map((s) => s.name).join(", ")}
              </span>
            )}
            {outfit.occasion_id?.length > 0 && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                {outfit.occasion_id.map((o) => o.name).join(", ")}
              </span>
            )}
            {outfit.season_id?.length > 0 && (
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                {outfit.season_id.map((se) => se.name).join(", ")}
              </span>
            )}
            {outfit.weather_id?.length > 0 && (
              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">
                {outfit.weather_id.map((w) => w.name).join(", ")}
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
      <div className="relative aspect-square w-full">
        <Image
          src={outfit.thumbnail_url || "/assets/placeholder-outfit.png"}
          alt={outfit.outfit_name}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
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
          {outfit.style_id?.length > 0 && (
            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
              {outfit.style_id.map((s) => s.name).join(", ")}
            </span>
          )}
          {outfit.occasion_id?.length > 0 && (
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
              {outfit.occasion_id.map((o) => o.name).join(", ")}
            </span>
          )}
          {outfit.season_id?.length > 0 && (
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
              {outfit.season_id.map((se) => se.name).join(", ")}
            </span>
          )}
          {outfit.weather_id?.length > 0 && (
            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">
              {outfit.weather_id.map((w) => w.name).join(", ")}
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
