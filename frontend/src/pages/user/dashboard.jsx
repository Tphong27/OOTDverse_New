import LayoutUser from "@/components/layout/LayoutUser";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";
import { getWardrobeStatistics } from "@/services/wardrobeService";
import { getOutfitStats, getUserOutfits } from "@/services/outfitService";
import { 
  Shirt, 
  ShoppingBag, 
  Eye, 
  Heart, 
  Plus, 
  Sparkles, 
  Scissors, 
  ArrowRight,
  TrendingUp,
  Clock
} from "lucide-react";
import Link from "next/link";

export default function UserDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [wardrobeStats, setWardrobeStats] = useState(null);
  const [outfitStats, setOutfitStats] = useState(null);
  const [recentOutfits, setRecentOutfits] = useState([]);

  useEffect(() => {
    if (user?._id) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [wStats, oStats, latestOutfits] = await Promise.all([
        getWardrobeStatistics(),
        getOutfitStats(user._id),
        getUserOutfits(user._id, { limit: 5 })
      ]);

      setWardrobeStats(wStats);
      setOutfitStats(oStats.data);
      setRecentOutfits(latestOutfits.data || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, label, value, color, delay }) => (
    <div className={`bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4 animate-fade-in-up`} style={{ animationDelay: delay }}>
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <h3 className="text-2xl font-bold text-gray-800">{value || 0}</h3>
      </div>
    </div>
  );

  if (loading) {
    return (
      <LayoutUser>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="relative w-16 h-16">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
        </div>
      </LayoutUser>
    );
  }

  return (
    <LayoutUser>
      <div className="space-y-8 pb-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Chào mừng trở lại, <span className="text-indigo-600">{user?.fullName || "Fashionista"}</span>!
            </h1>
            <p className="mt-1 text-gray-500">Dưới đây là tổng hợp tủ đồ và phong cách của bạn hôm nay.</p>
          </div>
          <div className="flex space-x-3">
            <Link href="/wardrobe/form" className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">
              <Plus className="w-4 h-4 mr-2" />
              Thêm đồ mới
            </Link>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            icon={Shirt} 
            label="Tổng món đồ" 
            value={wardrobeStats?.overview?.total_items} 
            color="bg-blue-500" 
            delay="0ms" 
          />
          <StatCard 
            icon={ShoppingBag} 
            label="Bộ phối đồ" 
            value={outfitStats?.totalOutfits} 
            color="bg-purple-500" 
            delay="100ms" 
          />
          <StatCard 
            icon={Eye} 
            label="Lượt xem bộ phối" 
            value={outfitStats?.totalViews} 
            color="bg-pink-500" 
            delay="200ms" 
          />
          <StatCard 
            icon={Heart} 
            label="Lượt yêu thích" 
            value={outfitStats?.totalLikes} 
            color="bg-rose-500" 
            delay="300ms" 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-indigo-500" />
                Hành động nhanh
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link href="/outfit/ai-stylist" className="group p-4 bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-xl hover:shadow-md transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-indigo-500 rounded-lg text-white">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800">AI Stylist</h3>
                        <p className="text-xs text-gray-500">Tư vấn phối đồ thông minh</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
                <Link href="/outfit/form" className="group p-4 bg-gradient-to-br from-purple-50 to-white border border-purple-100 rounded-xl hover:shadow-md transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-purple-500 rounded-lg text-white">
                        <Scissors className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800">Mix & Match</h3>
                        <p className="text-xs text-gray-500">Tự do sáng tạo phong cách</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              </div>
            </section>

            {/* Recent Outfits */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-800 flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-indigo-500" />
                  Bộ phối gần đây
                </h2>
                <Link href="/outfit/outfit" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center group">
                  Xem tất cả
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-all" />
                </Link>
              </div>
              
              {recentOutfits.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                  {recentOutfits.map((outfit) => (
                    <Link key={outfit._id} href={`/user/outfits/${outfit._id}`} className="group relative aspect-[3/4] bg-gray-100 rounded-xl overflow-hidden hover:ring-2 hover:ring-indigo-500 transition-all shadow-sm">
                      <img 
                        src={outfit.thumbnail_url || "/images/placeholder-outfit.png"} 
                        alt={outfit.outfit_name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                        <p className="text-white text-xs font-semibold truncate">{outfit.outfit_name}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-8 text-center text-gray-500">
                  <Plus className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">Bạn chưa có bộ phối nào. Bắt đầu ngay!</p>
                </div>
              )}
            </section>
          </div>

          {/* Sidebar Column */}
          <div className="space-y-8">
            {/* Wardrobe Breakdown */}
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
                Tủ đồ theo loại
              </h2>
              <div className="space-y-4">
                {wardrobeStats?.by_category?.length > 0 ? (
                  wardrobeStats.by_category.slice(0, 5).map((cat, idx) => {
                    const percentage = (cat.count / (wardrobeStats.overview.total_items || 1)) * 100;
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-gray-600">
                          <span>{cat.category_name}</span>
                          <span>{cat.count} món</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-indigo-500 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-gray-400 text-center py-4 italic">Chưa có dữ liệu</p>
                )}
              </div>
            </section>

            {/* Activity Info */}
            <section className="bg-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-100 relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-lg font-bold mb-2">Ưu đãi hôm nay</h2>
                <p className="text-indigo-100 text-xs mb-4">Hoàn thiện tủ đồ của bạn với mã giảm giá dành riêng cho bạn.</p>
                <button className="w-full py-2 bg-white text-indigo-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition shadow-lg">
                  Lấy Mã Ngay
                </button>
              </div>
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-indigo-500 rounded-full opacity-50 blur-3xl"></div>
              <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 bg-white rounded-full opacity-10 blur-2xl"></div>
            </section>
          </div>
        </div>
      </div>
    </LayoutUser>
  );
}