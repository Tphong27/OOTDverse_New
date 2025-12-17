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
  BarChart3
} from "lucide-react";
import MyListingCard from "@/components/marketplace/MyListingCard";
import EditListingModal from "@/components/marketplace/EditListingModal";
import CreateListingModal from "@/components/marketplace/CreateListingModal";
import ListingAnalytics from "@/components/marketplace/ListingAnalytics";

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

  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    loadMyListings();
  }, [user]);

  // Filter listings by status
  const filteredListings = myListings.filter((listing) => {
    if (statusFilter === "all") return true;
    return listing.status === statusFilter;
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
      alert("Đã boost listing thành công!");
    } catch (error) {
      console.error("Error boosting listing:", error);
      alert("Không thể boost listing: " + error.message);
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Số lượng</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Package className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Đang bán</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{stats.active}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Lượt xem</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalViews}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Eye className="text-purple-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Doanh thu</p>
                <p className="text-2xl font-bold text-pink-600 mt-1">
                  {new Intl.NumberFormat("vi-VN", {
                    notation: "compact",
                    compactDisplay: "short",
                  }).format(stats.totalRevenue)}đ
                </p>
              </div>
              <div className="p-3 bg-pink-100 rounded-lg">
                <DollarSign className="text-pink-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          <span className="text-sm font-medium text-gray-700 flex-shrink-0">
            <Filter size={16} className="inline mr-2" />
            Trạng thái:
          </span>
          {[
            { value: "all", label: "Tất cả", count: stats.total },
            { value: "active", label: "Đang bán", count: stats.active },
            { value: "pending", label: "Chờ xử lý", count: stats.pending },
            { value: "sold", label: "Đã bán", count: stats.sold },
          ].map((filter) => (
            <button
              key={filter.value}
              onClick={() => setStatusFilter(filter.value)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                statusFilter === filter.value
                  ? "bg-pink-500 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:border-pink-500"
              }`}
            >
              {filter.label} ({filter.count})
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Đang tải...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredListings.length === 0 && (
          <div className="text-center py-12">
            <Package size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Chưa có món đồ nào
            </h3>
            <p className="text-gray-600 mb-6">
              {statusFilter === "all"
                ? "Bạn chưa đăng bán món đồ nào"
                : `Không có món đồ ${statusFilter}`}
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-pink-500 text-white font-semibold hover:bg-pink-600 transition-colors"
            >
              <Plus size={20} />
              Đăng bán ngay
            </button>
          </div>
        )}

        {/* Listings Grid */}
        {!loading && filteredListings.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing) => (
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
                Xác nhận xóa listing
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