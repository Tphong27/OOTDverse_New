"use client";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  Home,
  Shirt,
  Sparkles,
  Users,
  ShoppingBag,
  Heart,
  BarChart3,
  LogOut,
} from "lucide-react";

export default function UserSidebar({ isSidebarOpen, setIsSidebarOpen }) {
  const router = useRouter();

  const menuItems = [
    { id: "overview", icon: Home, label: "Tổng quan", path: "/user/dashboard" },
    { id: "wardrobe", icon: Shirt, label: "Tủ đồ", path: "/wardrobe/wardrobe" },
    { id: "builder", icon: Sparkles, label: "Mix đồ AI", path: "/outfit/page" }, // Link tới trang AI
    {
      id: "community",
      icon: Users,
      label: "Cộng đồng",
      path: "/community/community",
    },
    {
      id: "marketplace",
      icon: ShoppingBag,
      label: "Chợ",
      path: "/marketplace/marketplace",
    },
    { id: "stats", icon: BarChart3, label: "Thống kê", path: "/stats/stats" },
  ];

  return (
    <>
      {/* Overlay cho mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-30 h-full w-72 bg-white border-r border-purple-100 shadow-xl transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo Area */}
        <div className="h-16 flex items-center px-8 border-b border-purple-50">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:shadow-purple-200 transition-all">
              O
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
              OOTDverse
            </span>
          </Link>
        </div>

        {/* Menu Items */}
        <nav className="p-4 space-y-2 mt-4">
          <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Menu chính
          </p>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = router.pathname === item.path;

            return (
              <Link
                key={item.id}
                href={item.path}
                onClick={() =>
                  window.innerWidth < 1024 && setIsSidebarOpen(false)
                }
                className={`flex items-center space-x-3 px-4 py-3.5 rounded-xl font-medium transition-all duration-200 group relative ${
                  isActive
                    ? "bg-purple-50 text-purple-700 shadow-sm"
                    : "text-gray-600 hover:bg-gray-50 hover:text-purple-600"
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-purple-600 rounded-r-full" />
                )}
                <Icon
                  className={`w-5 h-5 transition-colors ${
                    isActive
                      ? "text-purple-600"
                      : "text-gray-400 group-hover:text-purple-500"
                  }`}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer Sidebar */}
        <div className="absolute bottom-0 w-full p-4 border-t border-purple-50">
          <button className="flex items-center space-x-3 px-4 py-3 w-full rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors">
            <LogOut className="w-5 h-5" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>
    </>
  );
}
