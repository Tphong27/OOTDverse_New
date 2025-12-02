import LayoutUser from "@/components/layout/LayoutUser";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Heart,
  Calendar,
  DollarSign,
  Shirt,
  Tag,
  Sparkles,
  TrendingUp,
  Package,
  Loader2,
  MapPin,
  Clock,
} from "lucide-react";
import { useWardrobe } from "@/context/WardrobeContext";

export default function ItemDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { getItemDetails, toggleFavorite, deleteItem, recordWear } = useWardrobe();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  // Load item data
  useEffect(() => {
    if (id) {
      loadItem();
    }
  }, [id]);

  const loadItem = async () => {
    setLoading(true);
    try {
      const result = await getItemDetails(id);
      if (result.success) {
        setItem(result.data);
      } else {
        alert("Không tìm thấy món đồ");
        router.push("/wardrobe/wardrobe");
      }
    } catch (error) {
      console.error("Error loading item:", error);
      alert("Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  // Handle toggle favorite
  const handleToggleFavorite = async () => {
    const result = await toggleFavorite(id);
    if (result.success) {
      setItem(prev => ({ ...prev, is_favorite: result.data.is_favorite }));
    }
  };

  // Handle record wear
  const handleRecordWear = async () => {
    const result = await recordWear(id);
    if (result.success) {
      setItem(prev => ({
        ...prev,
        wear_count: result.data.wear_count,
        last_worn_date: result.data.last_worn_date
      }));
      alert("✅ Đã ghi nhận lần mặc!");
    }
  };

  // Handle delete
  const handleDelete = async () => {
    const result = await deleteItem(id);
    if (result.success) {
      alert("Đã xóa món đồ");
      router.push("/wardrobe/wardrobe");
    }
  };

  if (loading) {
    return (
      <LayoutUser>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-16 h-16 animate-spin text-purple-600" />
        </div>
      </LayoutUser>
    );
  }

  if (!item) {
    return (
      <LayoutUser>
        <div className="text-center py-20">
          <p className="text-gray-500">Không tìm thấy món đồ</p>
        </div>
      </LayoutUser>
    );
  }

  return (
    <LayoutUser>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Quay lại</span>
          </button>

          <div className="flex gap-2">
            <Link
              href={`/wardrobe/form?id=${id}`}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Chỉnh sửa
            </Link>
            <button
              onClick={() => setDeleteConfirm(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Xóa
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Image */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-lg">
            <div className="relative aspect-[3/4]">
              <img
                src={item.image_url || "https://placehold.co/600x800?text=No+Image"}
                alt={item.item_name}
                className="w-full h-full object-cover"
              />
              
              {/* Favorite Badge */}
              {item.is_favorite && (
                <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                  <Heart className="w-4 h-4 fill-white" />
                  <span className="text-sm font-medium">Yêu thích</span>
                </div>
              )}

              {/* Wear Count */}
              {item.wear_count > 0 && (
                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-lg">
                  <span className="text-sm font-medium">Đã mặc {item.wear_count} lần</span>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="p-4 grid grid-cols-2 gap-3">
              <button
                onClick={handleToggleFavorite}
                className={`px-4 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                  item.is_favorite
                    ? "bg-red-50 text-red-600 border-2 border-red-200"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <Heart className={`w-5 h-5 ${item.is_favorite ? "fill-red-600" : ""}`} />
                {item.is_favorite ? "Bỏ thích" : "Yêu thích"}
              </button>

              <button
                onClick={handleRecordWear}
                className="px-4 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-all flex items-center justify-center gap-2"
              >
                <Shirt className="w-5 h-5" />
                Ghi nhận mặc
              </button>
            </div>
          </div>

          {/* Right: Information */}
          <div className="space-y-6">
            {/* Title & Basic Info */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {item.item_name}
              </h1>

              <div className="space-y-3">
                {/* Category */}
                {item.category_id?.name && (
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-purple-600" />
                    <span className="text-gray-700">
                      <span className="font-medium">Danh mục:</span>{" "}
                      <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm font-medium">
                        {item.category_id.name}
                      </span>
                    </span>
                  </div>
                )}

                {/* Brand */}
                {item.brand_id?.name && (
                  <div className="flex items-center gap-3">
                    <Tag className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-700">
                      <span className="font-medium">Thương hiệu:</span> {item.brand_id.name}
                    </span>
                  </div>
                )}

                {/* Size */}
                {item.size && (
                  <div className="flex items-center gap-3">
                    <Shirt className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-700">
                      <span className="font-medium">Size:</span> {item.size}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Colors & Seasons */}
            <div className="bg-white rounded-2xl p-6 shadow-lg space-y-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                Thuộc tính
              </h3>

              {/* Colors */}
              {item.color_id && item.color_id.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Màu sắc:</p>
                  <div className="flex flex-wrap gap-2">
                    {item.color_id.map((color) => (
                      <span
                        key={color._id}
                        className="px-3 py-1 bg-pink-50 text-pink-700 rounded-full text-sm font-medium border border-pink-200"
                      >
                        {color.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Seasons */}
              {item.season_id && item.season_id.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Mùa:</p>
                  <div className="flex flex-wrap gap-2">
                    {item.season_id.map((season) => (
                      <span
                        key={season._id}
                        className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-200"
                      >
                        {season.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Material */}
              {item.material_id?.name && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Chất liệu:</p>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                    {item.material_id.name}
                  </span>
                </div>
              )}
            </div>

            {/* Purchase Info */}
            {(item.price || item.purchase_date) && (
              <div className="bg-white rounded-2xl p-6 shadow-lg space-y-3">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  Thông tin mua sắm
                </h3>

                {item.price && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Giá:</span>
                    <span className="text-xl font-bold text-green-600">
                      {item.price.toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                )}

                {item.purchase_date && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <span>
                      Ngày mua: {new Date(item.purchase_date).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Usage Stats */}
            <div className="bg-white rounded-2xl p-6 shadow-lg space-y-3">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                Thống kê sử dụng
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-purple-50 rounded-xl p-4">
                  <p className="text-sm text-purple-600 mb-1">Số lần mặc</p>
                  <p className="text-2xl font-bold text-purple-700">{item.wear_count || 0}</p>
                </div>

                {item.last_worn_date && (
                  <div className="bg-blue-50 rounded-xl p-4">
                    <p className="text-sm text-blue-600 mb-1 flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Mặc lần cuối
                    </p>
                    <p className="text-sm font-medium text-blue-700">
                      {new Date(item.last_worn_date).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Style Tags */}
            {item.style_tags && item.style_tags.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Style Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {item.style_tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full text-sm font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {item.notes && (
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Ghi chú</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{item.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-center mb-2">Xác nhận xóa?</h3>
            <p className="text-gray-600 text-center mb-6">
              Món đồ sẽ bị xóa vĩnh viễn. Hành động này không thể hoàn tác.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(false)}
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </LayoutUser>
  );
}