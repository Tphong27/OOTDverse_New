import LayoutUser from "@/components/layout/LayoutUser";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Heart,
  Trash2,
  Search,
  Grid3x3,
  List,
  Sparkles,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Shirt,
  Eye,
  Edit,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useWardrobe } from "@/context/WardrobeContext";
import axios from "axios";

export default function Wardrobe() {
  // ===== USE WARDROBE CONTEXT =====
  const {
    items, // Thêm items để tính count tổng
    filteredItems,
    loading,
    error,
    statistics,
    filters,
    updateFilters,
    toggleFavorite,
    deleteItem,
    totalItems,
    favoriteCount,
  } = useWardrobe();

  // ===== LOCAL STATE =====
  const [viewMode, setViewMode] = useState("grid");
  const [dynamicCategories, setDynamicCategories] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ===== LOAD CATEGORIES FROM SETTINGS =====
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const API_URL =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const response = await axios.get(`${API_URL}/api/setting`);

        const categoriesFromDB = response.data
          .filter((s) => s.type === "category" && s.status === "Active")
          .sort((a, b) => (a.priority || 0) - (b.priority || 0));

        setDynamicCategories(categoriesFromDB);
      } catch (error) {
        console.error("Lỗi tải danh mục:", error);
      }
    };
    fetchCategories();
  }, []);

  // Reset currentPage when filteredItems change (e.g., due to filters)
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredItems.length]);

  // ===== CREATE CATEGORY TABS (with Favorite tab) =====
  const categoryTabs = [
    { id: "all", label: "Tất cả", count: totalItems },
    { id: "favorite", label: "Yêu thích", count: favoriteCount },
    ...dynamicCategories.map((cat) => ({
      id: cat._id,
      label: cat.name,
      count: items.filter(  // Sử dụng items thay vì filteredItems để count tổng
        (i) => i.category_id?._id === cat._id || i.category_id === cat._id
      ).length,
    })),
  ];

  // ===== PAGINATION LOGIC =====
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const currentItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // ===== HANDLE FUNCTIONS =====
  const handleCategoryChange = (categoryId) => {
    if (categoryId === "favorite") {
      updateFilters({ category: "all", favorite: true });
    } else {
      updateFilters({ category: categoryId, favorite: false });
    }
  };

  const handleSearchChange = (e) => {
    updateFilters({ search: e.target.value });
  };

  const handleToggleFavorite = async (itemId) => {
    const result = await toggleFavorite(itemId);
    if (!result.success) {
      alert("Lỗi: " + result.error);
    }
  };

  const handleDeleteClick = (itemId) => {
    setDeleteConfirm(itemId);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;

    const result = await deleteItem(deleteConfirm);
    if (result.success) {
      setDeleteConfirm(null);
    } else {
      alert("Lỗi xóa: " + result.error);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm(null);
  };

  return (
    <LayoutUser>
      <div className="space-y-6">
        {/* Header với gradient và statistics */}
        <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 rounded-2xl p-8 text-white shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3">
                Tủ đồ của tôi
              </h1>
            </div>
            <Link
              href="/wardrobe/form"
              className="bg-white text-purple-600 px-6 py-3 rounded-xl font-semibold hover:bg-purple-50 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 group"
            >
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
              Thêm món đồ mới
            </Link>
          </div>

          {/* Statistics Cards */}
          {statistics && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Shirt className="w-5 h-5" />
                  <span className="text-sm text-white/80">Tổng món đồ</span>
                </div>
                <p className="text-2xl font-bold leading-tight break-words">
                  {statistics.overview?.total_items || 0}
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Heart className="w-5 h-5" />
                  <span className="text-sm text-white/80">Yêu thích</span>
                </div>
                <p className="text-2xl font-bold leading-tight break-words">
                  {statistics.overview?.favorite_count || 0}
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="w-5 h-5" />
                  <span className="text-sm text-white/80">Tổng giá trị</span>
                </div>
                <p className="text-2xl font-bold leading-tight break-words">
                  {(statistics.overview?.total_value || 0).toLocaleString(
                    "vi-VN"
                  )}
                  đ
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-5 h-5" />
                  <span className="text-sm text-white/80">TB mặc/món</span>
                </div>
                <p className="text-2xl font-bold leading-tight break-words">
                  {(statistics.overview?.avg_wear_count || 0).toFixed(1)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên, thương hiệu, ghi chú..."
                value={filters.search}
                onChange={handleSearchChange}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex gap-2 bg-gray-50 p-1 rounded-lg">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-all ${viewMode === "grid"
                    ? "bg-white shadow-sm text-purple-600"
                    : "text-gray-400 hover:text-gray-600"
                  }`}
                title="Xem dạng lưới"
              >
                <Grid3x3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-all ${viewMode === "list"
                    ? "bg-white shadow-sm text-purple-600"
                    : "text-gray-400 hover:text-gray-600"
                  }`}
                title="Xem dạng danh sách"
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Categories Filter (Dynamic) */}
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {categoryTabs.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className={`px-5 py-2.5 rounded-xl font-medium whitespace-nowrap transition-all ${(filters.category === cat.id && !filters.favorite) ||
                  (cat.id === "favorite" && filters.favorite)
                  ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg scale-105"
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                }`}
            >
              {cat.label}
              <span
                className={`ml-2 px-2 py-0.5 rounded-full text-xs ${(filters.category === cat.id && !filters.favorite) ||
                    (cat.id === "favorite" && filters.favorite)
                    ? "bg-white/20"
                    : "bg-gray-100"
                  }`}
              >
                {cat.count}
              </span>
            </button>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-800">
            <p className="font-medium">⚠️ Có lỗi xảy ra: {error}</p>
          </div>
        )}

        {/* Items Grid/List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600"></div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-12 h-12 text-gray-300" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Không tìm thấy món đồ nào
            </h3>
            <p className="text-gray-500 mb-6">
              {filters.search
                ? `Không có kết quả nào cho "${filters.search}"`
                : "Tủ đồ của bạn đang trống hoặc chưa có món nào thuộc danh mục này."}
            </p>
            {!filters.search && (
              <Link
                href="/wardrobe/form"
                className="inline-flex items-center gap-2 text-purple-600 font-semibold hover:text-purple-700 hover:underline"
              >
                <Plus className="w-5 h-5" /> Thêm món đồ ngay
              </Link>
            )}
          </div>
        ) : (
          <>
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  : "space-y-4"
              }
            >
              {currentItems.map((item) => (
                <div
                  key={item._id}
                  className={`group relative bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:border-purple-200 transition-all duration-300 ${viewMode === "list" ? "flex gap-4" : ""
                    }`}
                >
                  {/* Image */}
                  <div
                    className={`relative overflow-hidden ${viewMode === "list" ? "w-40 h-40 shrink-0" : "aspect-[3/4]"
                      }`}
                  >
                    <img
                      src={
                        item.image_url ||
                        "https://placehold.co/400x600?text=No+Image"
                      }
                      alt={item.item_name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    {/* Favorite Button */}
                    <button
                      onClick={() => handleToggleFavorite(item._id)}
                      className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all shadow-lg hover:scale-110 z-10"
                    >
                      <Heart
                        className={`w-5 h-5 transition-colors ${item.is_favorite
                            ? "fill-red-500 text-red-500"
                            : "text-gray-600"
                          }`}
                      />
                    </button>

                    {/* Wear Count Badge */}
                    {item.wear_count > 0 && (
                      <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded-lg text-xs font-medium">
                        Mặc {item.wear_count} lần
                      </div>
                    )}

                    {/* Quick Actions */}
                    <div className="absolute bottom-3 left-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link
                        href={`/wardrobe/${item._id}`}
                        className="flex-1 bg-white/90 backdrop-blur-sm py-2 rounded-lg text-sm font-medium text-gray-900 hover:bg-white transition-colors text-center flex items-center justify-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/wardrobe/form?id=${item._id}`}
                        className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDeleteClick(item._id)}
                        className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-red-50 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Info */}
                  <div
                    className={`p-4 ${viewMode === "list"
                        ? "flex-1 flex flex-col justify-center"
                        : ""
                      }`}
                  >
                    <h3 className="font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-purple-600 transition-colors text-lg">
                      {item.item_name}
                    </h3>

                    {/* Brand */}
                    <p className="text-sm text-gray-500 mb-3 flex items-center gap-1">
                      {item.brand_id?.name ? (
                        <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-medium text-gray-600">
                          {item.brand_id.name}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">No brand</span>
                      )}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {item.category_id?.name && (
                        <span className="px-2.5 py-1 bg-purple-50 text-purple-600 text-xs font-medium rounded-full border border-purple-100">
                          {item.category_id.name}
                        </span>
                      )}
                      {item.color_id && item.color_id.length > 0 && (
                        <span className="px-2.5 py-1 bg-pink-50 text-pink-600 text-xs font-medium rounded-full border border-pink-100">
                          {item.color_id[0].name}
                        </span>
                      )}
                      {item.price && (
                        <span className="px-2.5 py-1 bg-green-50 text-green-600 text-xs font-medium rounded-full border border-green-100">
                          {item.price.toLocaleString("vi-VN")}đ
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Trước
                </button>
                <span className="text-gray-600 font-medium">
                  Trang {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  Sau
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-center mb-2">
              Xác nhận xóa món đồ?
            </h3>
            <p className="text-gray-600 text-center mb-6">
              Món đồ sẽ được xóa khỏi tủ đồ của bạn. Hành động này không thể
              hoàn tác.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteCancel}
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom scrollbar styles */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </LayoutUser>
  );
}