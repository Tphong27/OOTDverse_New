import LayoutUser from "@/components/layout/LayoutUser";
import { useState, useEffect } from "react";
import {
  Filter,
  Plus,
  Heart,
  Trash2,
  Search,
  Grid3x3,
  List,
  Sparkles,
} from "lucide-react";
import { getWardrobeItems } from "@/services/wardrobeService";

export default function Wardrobe() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    { id: "all", label: "Tất cả", count: items.length },
    {
      id: "tops",
      label: "Áo",
      count: items.filter((i) => i.category === "tops").length,
    },
    {
      id: "bottoms",
      label: "Quần",
      count: items.filter((i) => i.category === "bottoms").length,
    },
    {
      id: "dresses",
      label: "Váy",
      count: items.filter((i) => i.category === "dresses").length,
    },
    {
      id: "outerwear",
      label: "Áo khoác",
      count: items.filter((i) => i.category === "outerwear").length,
    },
    {
      id: "shoes",
      label: "Giày",
      count: items.filter((i) => i.category === "shoes").length,
    },
    {
      id: "accessories",
      label: "Phụ kiện",
      count: items.filter((i) => i.category === "accessories").length,
    },
  ];

  useEffect(() => {
    const fetchItems = async () => {
      const data = await getWardrobeItems();
      setItems(data);
      setLoading(false);
    };
    fetchItems();
  }, []);

  const filteredItems = items.filter((item) => {
    const matchCategory =
      selectedCategory === "all" || item.category === selectedCategory;
    const matchSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brand?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const toggleFavorite = (id) => {
    setItems((prev) =>
      prev.map((item) =>
        item._id === id ? { ...item, favorite: !item.favorite } : item
      )
    );
  };

  return (
    <LayoutUser>
      <div className="space-y-6">
        {/* Header với gradient */}
        <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 rounded-2xl p-8 text-white shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3">
                <Sparkles className="w-8 h-8" />
                Tủ đồ của tôi
              </h1>
              <p className="text-white/90 text-lg">
                {items.length} món đồ • {items.filter((i) => i.favorite).length}{" "}
                yêu thích
              </p>
            </div>
            <button className="bg-white text-purple-600 px-6 py-3 rounded-xl font-semibold hover:bg-purple-50 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 group">
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
              Thêm món đồ mới
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên hoặc thương hiệu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex gap-2 bg-gray-50 p-1 rounded-lg">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === "grid"
                    ? "bg-white shadow-sm text-purple-600"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <Grid3x3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === "list"
                    ? "bg-white shadow-sm text-purple-600"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Categories Filter */}
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-5 py-2.5 rounded-xl font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg scale-105"
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              {cat.label}
              <span
                className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  selectedCategory === cat.id ? "bg-white/20" : "bg-gray-100"
                }`}
              >
                {cat.count}
              </span>
            </button>
          ))}
        </div>

        {/* Items Grid/List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600"></div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Không tìm thấy món đồ nào
            </h3>
            <p className="text-gray-500">
              Hãy thử thay đổi bộ lọc hoặc thêm món đồ mới!
            </p>
          </div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "space-y-4"
            }
          >
            {filteredItems.map((item) => (
              <div
                key={item._id}
                className={`group relative bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:border-purple-200 transition-all duration-300 ${
                  viewMode === "list" ? "flex gap-4" : ""
                }`}
              >
                {/* Image */}
                <div
                  className={`relative overflow-hidden ${
                    viewMode === "list" ? "w-32 h-32" : "aspect-[3/4]"
                  }`}
                >
                  <img
                    src={
                      item.imageUrl ||
                      "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400"
                    }
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  {/* Favorite Button */}
                  <button
                    onClick={() => toggleFavorite(item._id)}
                    className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all shadow-lg hover:scale-110"
                  >
                    <Heart
                      className={`w-5 h-5 transition-colors ${
                        item.favorite
                          ? "fill-red-500 text-red-500"
                          : "text-gray-600"
                      }`}
                    />
                  </button>

                  {/* Quick Actions */}
                  <div className="absolute bottom-3 left-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="flex-1 bg-white/90 backdrop-blur-sm py-2 rounded-lg text-sm font-medium text-gray-900 hover:bg-white transition-colors">
                      Xem chi tiết
                    </button>
                    <button className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-red-50 hover:text-red-600 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div
                  className={`p-4 ${
                    viewMode === "list"
                      ? "flex-1 flex flex-col justify-center"
                      : ""
                  }`}
                >
                  <h3 className="font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-purple-600 transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-2">
                    {item.brand || "No brand"}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    <span className="px-2.5 py-1 bg-purple-50 text-purple-600 text-xs font-medium rounded-full">
                      {item.category}
                    </span>
                    {item.color && (
                      <span className="px-2.5 py-1 bg-pink-50 text-pink-600 text-xs font-medium rounded-full">
                        {item.color}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
