//frontend/src/pages/marketplace/my-listings.jsx
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import LayoutUser from "@/components/layout/LayoutUser";
import { useAuth } from "@/context/AuthContext";
import { useMarketplace } from "@/context/MarketplaceContext";
import { 
  Plus, 
  Edit2, 
  Trash2, 
  TrendingUp, 
  Eye, 
  Heart, 
  MessageCircle,
  DollarSign,
  Package,
  Filter,
  BarChart3,
  SlidersHorizontal,
  X as XIcon
} from "lucide-react";
import MyListingCard from "@/components/marketplace/MyListingCard";
import EditListingModal from "@/components/marketplace/EditListingModal";
import CreateListingModal from "@/components/marketplace/CreateListingModal";
import ListingAnalytics from "@/components/marketplace/ListingAnalytics";
import QuickStats from "@/components/marketplace/QuickStats";
import { useSettings } from "@/context/SettingContext";

export default function MyListingsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { 
    myListings, 
    loading, 
    loadMyListings, 
    removeListing,
    boostListing 
  } = useMarketplace();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    status: null,
    listing_type: null,
    condition: null,
    category_id: null,
    brand_id: null,
    min_price: null,
    max_price: null,
    sort_by: "newest",
  });

  const { categories, brands } = useSettings();

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    loadMyListings(filters);
  }, [user, filters]);

  // Apply filters
  const filteredListings = myListings.filter((listing) => {
    // Status
    if (filters.status && listing.status !== filters.status) return false;
    
    // Listing type
    if (filters.listing_type && listing.listing_type !== filters.listing_type) return false;
    
    // Condition
    if (filters.condition && listing.condition !== filters.condition) return false;
    
    // Category
    if (filters.category_id && listing.item_id?.category_id?._id !== filters.category_id) return false;
    
    // Brand
    if (filters.brand_id && listing.item_id?.brand_id?._id !== filters.brand_id) return false;
    
    // Price range
    if (filters.min_price && listing.selling_price < parseFloat(filters.min_price)) return false;
    if (filters.max_price && listing.selling_price > parseFloat(filters.max_price)) return false;
    
    return true;
  });

  // Sort listings
  const sortedListings = [...filteredListings].sort((a, b) => {
    switch (filters.sort_by) {
      case "price_low":
        return (a.selling_price || 0) - (b.selling_price || 0);
      case "price_high":
        return (b.selling_price || 0) - (a.selling_price || 0);
      case "views":
        return (b.view_count || 0) - (a.view_count || 0);
      case "favorites":
        return (b.favorite_count || 0) - (a.favorite_count || 0);
      case "newest":
      default:
        return new Date(b.listed_at) - new Date(a.listed_at);
    }
  });

  // Calculate stats
  const stats = {
    total: myListings.length,
    active: myListings.filter((l) => l.status === "active").length,
    sold: myListings.filter((l) => l.status === "sold").length,
    pending: myListings.filter((l) => l.status === "pending").length,
    totalViews: myListings.reduce((sum, l) => sum + (l.view_count || 0), 0),
    totalFavorites: myListings.reduce((sum, l) => sum + (l.favorite_count || 0), 0),
    totalRevenue: myListings
      .filter((l) => l.status === "sold")
      .reduce((sum, l) => sum + (l.selling_price || 0), 0),
  };

  // Update filters
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      status: null,
      listing_type: null,
      condition: null,
      category_id: null,
      brand_id: null,
      min_price: null,
      max_price: null,
      sort_by: "newest",
    });
  };

  const hasActiveFilters = () => {
    return (
      filters.status ||
      filters.listing_type ||
      filters.condition ||
      filters.category_id ||
      filters.brand_id ||
      filters.min_price ||
      filters.max_price
    );
  };

  // Handle edit
  const handleEdit = (listing) => {
    setSelectedListing(listing);
    setShowEditModal(true);
  };

  // Handle delete
  const handleDeleteClick = (listing) => {
    setDeleteConfirm(listing);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    try {
      await removeListing(deleteConfirm._id);
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Error deleting listing:", error);
      alert("Không thể xóa listing: " + error.message);
    }
  };

  // Handle boost
  const handleBoost = async (listingId) => {
    try {
      await boostListing(listingId);
      alert("Đã boost món đồ thành công!");
    } catch (error) {
      console.error("Error boosting listing:", error);
      alert("Không thể boost món đồ: " + error.message);
    }
  };

  if (!user) return null;

  return (
    <LayoutUser>
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gian hàng của tôi</h1>
            <p className="text-gray-600 mt-1">Quản lý các món đồ đang bán</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowAnalytics(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:border-pink-500 hover:bg-pink-50 hover:text-pink-700 transition-colors"
            >
              <BarChart3 size={20} />
              Thống kê
            </button>

            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-pink-500 text-white font-semibold hover:bg-pink-600 transition-colors shadow"
            >
              <Plus size={20} />
              Đăng bán mới
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <QuickStats stats={stats} />

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <SlidersHorizontal size={18} />
              <span>Bộ lọc</span>
              {hasActiveFilters() && (
                <span className="bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  !
                </span>
              )}
            </button>

            <select
              value={filters.sort_by}
              onChange={(e) => handleFilterChange("sort_by", e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            >
              <option value="newest">Mới nhất</option>
              <option value="price_low">Giá thấp → cao</option>
              <option value="price_high">Giá cao → thấp</option>
              <option value="views">Lượt xem nhiều nhất</option>
              <option value="favorites">Yêu thích nhiều nhất</option>
            </select>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">Lọc nâng cao</h3>
                {hasActiveFilters() && (
                  <button
                    onClick={resetFilters}
                    className="text-sm text-pink-600 hover:text-pink-700 flex items-center gap-1"
                  >
                    <XIcon size={16} />
                    Xóa bộ lọc
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trạng thái
                  </label>
                  <select
                    value={filters.status || ""}
                    onChange={(e) => handleFilterChange("status", e.target.value || null)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    <option value="">Tất cả</option>
                    <option value="active">Đang bán</option>
                    <option value="pending">Chờ xử lý</option>
                    <option value="sold">Đã bán</option>
                    <option value="inactive">Đã ẩn</option>
                  </select>
                </div>

                {/* Listing Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loại tin
                  </label>
                  <select
                    value={filters.listing_type || ""}
                    onChange={(e) => handleFilterChange("listing_type", e.target.value || null)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    <option value="">Tất cả</option>
                    <option value="sell">Chỉ bán</option>
                    <option value="swap">Chỉ swap</option>
                    <option value="both">Bán & Swap</option>
                  </select>
                </div>

                {/* Condition */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tình trạng
                  </label>
                  <select
                    value={filters.condition || ""}
                    onChange={(e) => handleFilterChange("condition", e.target.value || null)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    <option value="">Tất cả</option>
                    <option value="new">Mới 100%</option>
                    <option value="like_new">Như mới</option>
                    <option value="good">Tốt</option>
                    <option value="fair">Khá</option>
                    <option value="worn">Đã sử dụng</option>
                  </select>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Danh mục
                  </label>
                  <select
                    value={filters.category_id || ""}
                    onChange={(e) => handleFilterChange("category_id", e.target.value || null)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    <option value="">Tất cả</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Brand */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thương hiệu
                  </label>
                  <select
                    value={filters.brand_id || ""}
                    onChange={(e) => handleFilterChange("brand_id", e.target.value || null)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    <option value="">Tất cả</option>
                    {brands.map((brand) => (
                      <option key={brand._id} value={brand._id}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Min Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giá từ
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={filters.min_price || ""}
                    onChange={(e) => handleFilterChange("min_price", e.target.value || null)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>

                {/* Max Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giá đến
                  </label>
                  <input
                    type="number"
                    placeholder="10,000,000"
                    value={filters.max_price || ""}
                    onChange={(e) => handleFilterChange("max_price", e.target.value || null)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Đang tải...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && sortedListings.length === 0 && (
          <div className="text-center py-12">
            <Package size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Chưa có listing nào
            </h3>
            <p className="text-gray-600 mb-6">
              {hasActiveFilters()
                ? "Không tìm thấy món đồ nào phù hợp với bộ lọc"
                : "Bạn chưa đăng bán món đồ nào"}
            </p>
            {hasActiveFilters() ? (
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-pink-500 text-pink-600 font-semibold hover:bg-pink-50 transition-colors"
              >
                Xóa bộ lọc
              </button>
            ) : (
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-pink-500 text-white font-semibold hover:bg-pink-600 transition-colors"
              >
                <Plus size={20} />
                Đăng bán ngay
              </button>
            )}
          </div>
        )}

        {/* Listings Grid */}
        {!loading && sortedListings.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedListings.map((listing) => (
              <MyListingCard
                key={listing._id}
                listing={listing}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
                onBoost={handleBoost}
              />
            ))}
          </div>
        )}

        {/* Modals */}
        {showCreateModal && (
          <CreateListingModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => {
              setShowCreateModal(false);
              loadMyListings();
            }}
          />
        )}

        {showEditModal && selectedListing && (
          <EditListingModal
            listing={selectedListing}
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              setSelectedListing(null);
            }}
            onSuccess={() => {
              setShowEditModal(false);
              setSelectedListing(null);
              loadMyListings();
            }}
          />
        )}

        {showAnalytics && (
          <ListingAnalytics
            listings={myListings}
            stats={stats}
            isOpen={showAnalytics}
            onClose={() => setShowAnalytics(false)}
          />
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Xác nhận xóa món đồ
              </h3>
              <p className="text-gray-600 mb-6">
                Bạn có chắc chắn muốn xóa món đồ "{deleteConfirm.item_id?.item_name}"?
                Hành động này không thể hoàn tác.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-3 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 py-3 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors"
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