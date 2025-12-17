//frontend/src/components/marketplace/QuickStats.jsx
import { Package, TrendingUp, Eye, DollarSign } from "lucide-react";

export default function QuickStats({ stats }) {
  const formatRevenue = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      notation: "compact",
      compactDisplay: "short",
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Tổng listings</p>
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
              {formatRevenue(stats.totalRevenue)}đ
            </p>
          </div>
          <div className="p-3 bg-pink-100 rounded-lg">
            <DollarSign className="text-pink-600" size={24} />
          </div>
        </div>
      </div>
    </div>
  );
}