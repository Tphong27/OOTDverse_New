//frontend/src/pages/marketplace/ListingGrid.jsx
import { useState } from "react";
import ListingCard from "./ListingCard";
import { Grid, List, Filter, SlidersHorizontal, X } from "lucide-react";
import { useMarketplace } from "@/context/MarketplaceContext";
import { useSettings } from "@/context/SettingContext";

export default function ListingGrid() {
  const {
    listings,
    loading,
    error,
    filters,
    updateFilters,
    resetFilters,
    pagination,
    nextPage,
    prevPage,
  } = useMarketplace();

  const { categories, brands, colors } = useSettings();

  const [viewMode, setViewMode] = useState("grid"); // grid | list
  const [showFilters, setShowFilters] = useState(false);

  // Sort options
  const sortOptions = [
    { value: "newest", label: "Mới nhất" },
    { value: "price_low", label: "Giá thấp → cao" },
    { value: "price_high", label: "Giá cao → thấp" },
    { value: "popular", label: "Phổ biến nhất" },
    { value: "featured", label: "Nổi bật" },
  ];

  // Condition options
  const conditionOptions = [
    { value: "new", label: "Mới 100%" },
    { value: "like_new", label: "Như mới" },
    { value: "good", label: "Tốt" },
    { value: "fair", label: "Khá" },
    { value: "worn", label: "Đã sử dụng" },
  ];

  // Listing type options
  const listingTypeOptions = [
    { value: "sell", label: "Chỉ bán" },
    { value: "swap", label: "Chỉ swap" },
    { value: "both", label: "Cả hai" },
  ];

  // Handle filter change
  const handleFilterChange = (key, value) => {
    updateFilters({ [key]: value, page: 1 });
  };

  // Clear all filters
  const handleClearFilters = () => {
    resetFilters();
  };

  // Check if has active filters
  const hasActiveFilters = () => {
    return (
      filters.listing_type ||
      filters.condition ||
      filters.category_id ||
      filters.brand_id ||
      filters.color_id ||
      filters.min_price ||
      filters.max_price
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with View Toggle & Sort */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Results Count */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Marketplace
          </h2>
          <p className="text-gray-600 mt-1">
            {pagination.total} sản phẩm
          </p>
        </div>

        {/* View & Sort Controls */}
        <div className="flex items-center gap-3">
          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <SlidersHorizontal size={18} />
            <span className="hidden sm:inline">Bộ lọc</span>
            {hasActiveFilters() && (
              <span className="bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                !
              </span>
            )}
          </button>

          {/* Sort Dropdown */}
          <select
            value={filters.sort_by}
            onChange={(e) => handleFilterChange("sort_by", e.target.value)}
            className="px-4 py-2 rounded-lg bg-white border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-white border border-gray-300 rounded-lg p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded ${
                viewMode === "grid"
                  ? "bg-pink-500 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Grid size={18} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded ${
                viewMode === "list"
                  ? "bg-pink-500 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Filter size={20} />
              Bộ lọc
            </h3>
            {hasActiveFilters() && (
              <button
                onClick={handleClearFilters}
                className="text-sm text-pink-600 hover:text-pink-700 flex items-center gap-1"
              >
                <X size={16} />
                Xóa bộ lọc
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Listing Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loại tin
              </label>
              <select
                value={filters.listing_type || ""}
                onChange={(e) =>
                  handleFilterChange("listing_type", e.target.value || null)
                }
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="">Tất cả</option>
                {listingTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Condition */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tình trạng
              </label>
              <select
                value={filters.condition || ""}
                onChange={(e) =>
                  handleFilterChange("condition", e.target.value || null)
                }
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="">Tất cả</option>
                {conditionOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Danh mục
              </label>
              <select
                value={filters.category_id || ""}
                onChange={(e) =>
                  handleFilterChange("category_id", e.target.value || null)
                }
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
                onChange={(e) =>
                  handleFilterChange("brand_id", e.target.value || null)
                }
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
                onChange={(e) =>
                  handleFilterChange("min_price", e.target.value || null)
                }
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
                onChange={(e) =>
                  handleFilterChange("max_price", e.target.value || null)
                }
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && listings.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Không tìm thấy sản phẩm nào</p>
          {hasActiveFilters() && (
            <button
              onClick={handleClearFilters}
              className="mt-4 text-pink-600 hover:text-pink-700 underline"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>
      )}

      {/* Listings Grid/List */}
      {!loading && !error && listings.length > 0 && (
        <>
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "space-y-4"
            }
          >
            {listings.map((listing) => (
              <ListingCard key={listing._id} listing={listing} />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={prevPage}
                disabled={pagination.page === 1}
                className="px-6 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Trước
              </button>
              <span className="text-gray-700">
                Trang {pagination.page} / {pagination.totalPages}
              </span>
              <button
                onClick={nextPage}
                disabled={pagination.page === pagination.totalPages}
                className="px-6 py-2 rounded-lg bg-pink-500 text-white hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Sau
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}