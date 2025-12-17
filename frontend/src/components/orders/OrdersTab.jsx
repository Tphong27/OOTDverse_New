//frontend/src/components/orders/OrdersTab.jsx
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useOrder } from "@/context/OrderContext";
import { 
  ShoppingBag, 
  Package, 
  TrendingUp, 
  DollarSign,
  Filter,
  Search,
  Calendar
} from "lucide-react";
import OrderCard from "./OrderCard";
import OrderDetailModal from "./OrderDetailModal";

export default function OrdersTab() {
  const { user } = useAuth();
  const { 
    myOrders, 
    mySales, 
    loading, 
    loadMyOrders, 
    loadMySales,
    buyerStats,
    sellerStats,
    loadBuyerStats,
    loadSellerStats
  } = useOrder();

  const [activeRole, setActiveRole] = useState("buyer"); // buyer | seller
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    if (user) {
      loadMyOrders();
      loadMySales();
      loadBuyerStats();
      loadSellerStats();
    }
  }, [user]);

  // Get current list based on role
  const currentOrders = activeRole === "buyer" ? myOrders : mySales;

  // Filter orders
  const filteredOrders = currentOrders.filter((order) => {
    // Status filter
    if (statusFilter !== "all" && order.order_status !== statusFilter) {
      return false;
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const itemName = order.item_id?.item_name?.toLowerCase() || "";
      const orderCode = order.order_code?.toLowerCase() || "";
      return itemName.includes(query) || orderCode.includes(query);
    }

    return true;
  });

  // Stats
  const currentStats = activeRole === "buyer" ? buyerStats : sellerStats;

  const handleViewDetail = (order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  // Status options
  const statusOptions = [
    { value: "all", label: "Tất cả" },
    { value: "pending_payment", label: "Chờ thanh toán" },
    { value: "paid", label: "Đã thanh toán" },
    { value: "preparing", label: "Đang chuẩn bị" },
    { value: "shipping", label: "Đang vận chuyển" },
    { value: "delivered", label: "Đã giao hàng" },
    { value: "completed", label: "Hoàn thành" },
    { value: "cancelled", label: "Đã hủy" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Đơn hàng</h1>
        <p className="text-gray-600 mt-1">
          Quản lý đơn mua & đơn bán của bạn
        </p>
      </div>

      {/* Role Tabs */}
      <div className="flex gap-3">
        <button
          onClick={() => setActiveRole("buyer")}
          className={`flex-1 sm:flex-none px-6 py-3 rounded-xl font-semibold transition-all ${
            activeRole === "buyer"
              ? "bg-pink-500 text-white shadow-lg"
              : "bg-white text-gray-700 border-2 border-gray-200 hover:border-pink-500"
          }`}
        >
          <ShoppingBag className="inline mr-2" size={20} />
          Đơn mua ({myOrders.length})
        </button>

        <button
          onClick={() => setActiveRole("seller")}
          className={`flex-1 sm:flex-none px-6 py-3 rounded-xl font-semibold transition-all ${
            activeRole === "seller"
              ? "bg-pink-500 text-white shadow-lg"
              : "bg-white text-gray-700 border-2 border-gray-200 hover:border-pink-500"
          }`}
        >
          <Package className="inline mr-2" size={20} />
          Đơn bán ({mySales.length})
        </button>
      </div>

      {/* Stats Cards */}
      {currentStats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tổng đơn</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {currentStats.totalOrders || 0}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Package className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Hoàn thành</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {currentStats.completedOrders || 0}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Đã hủy</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {currentStats.cancelledOrders || 0}
                </p>
              </div>
              <div className="p-3 bg-gray-100 rounded-lg">
                <Calendar className="text-gray-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  {activeRole === "buyer" ? "Tổng chi" : "Doanh thu"}
                </p>
                <p className="text-xl font-bold text-pink-600 mt-1">
                  {new Intl.NumberFormat("vi-VN", {
                    notation: "compact",
                    compactDisplay: "short",
                  }).format(currentStats.totalRevenue || 0)}đ
                </p>
              </div>
              <div className="p-3 bg-pink-100 rounded-lg">
                <DollarSign className="text-pink-600" size={24} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Tìm theo tên món đồ hoặc mã đơn..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="sm:w-64">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <Package size={64} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Chưa có đơn hàng nào
          </h3>
          <p className="text-gray-600">
            {searchQuery || statusFilter !== "all"
              ? "Không tìm thấy đơn hàng phù hợp"
              : activeRole === "buyer"
              ? "Bạn chưa mua món đồ nào"
              : "Bạn chưa bán món đồ nào"}
          </p>
        </div>
      )}

      {/* Orders List */}
      {!loading && filteredOrders.length > 0 && (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <OrderCard
              key={order._id}
              order={order}
              role={activeRole}
              onViewDetail={handleViewDetail}
            />
          ))}
        </div>
      )}

      {/* Order Detail Modal */}
      {showDetailModal && selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          role={activeRole}
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedOrder(null);
          }}
        />
      )}
    </div>
  );
}