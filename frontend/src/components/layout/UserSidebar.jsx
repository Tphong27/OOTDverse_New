"use client";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  Home,
  Shirt,
  Sparkles,
  Users,
  ShoppingBag,
  BarChart3,
  ChevronRight,
  Settings,
  User,
  LayoutDashboard,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext"; // Import useAuth

export default function UserSidebar({ isSidebarOpen, setIsSidebarOpen }) {
  const router = useRouter();
  // const currentPath = typeof window !== "undefined" ? window.location.pathname : "";
  const { isAdmin, isCustomer } = useAuth();

  const ALL_MENU_ITEMS = [
    // CUSTOMER ROUTES
    {
      id: "overview",
      icon: Home,
      label: "Tổng quan",
      path: "/user/dashboard",
      roles: ["Customer", "Admin"],
    },
    {
      id: "wardrobe",
      icon: Shirt,
      label: "Tủ đồ",
      path: "/wardrobe/wardrobe",
      roles: ["Customer", "Admin"],
    },
    {
      id: "builder",
      icon: Sparkles,
      label: "Mix đồ AI",
      path: "/outfit/outfit",
      roles: ["Customer", "Admin"],
    },
    {
      id: "community",
      icon: Users,
      label: "Cộng đồng",
      path: "/community/community",
      roles: ["Customer", "Admin"],
    },
    {
      id: "marketplace",
      icon: ShoppingBag,
      label: "Chợ",
      path: "/marketplace/marketplace",
      roles: ["Customer", "Admin"],
    },
    {
      id: "stats",
      icon: BarChart3,
      label: "Thống kê",
      path: "/stats/stats",
      roles: ["Customer", "Admin"],
    },
    // ADMIN ROUTES
    {
      id: "admin-dash",
      icon: LayoutDashboard,
      label: "Admin Dashboard",
      path: "/admin/dashboard",
      roles: ["Admin"],
    },
    {
      id: "settings",
      icon: Settings,
      label: "Settings",
      path: "/setting/setting",
      roles: ["Admin"],
    },
    {
      id: "account",
      icon: User,
      label: "Accounts",
      path: "/user/account",
      roles: ["Admin"],
    },
  ];
  const filteredMenuItems = ALL_MENU_ITEMS.filter((item) => {
    // Nếu người dùng là Admin, hiển thị tất cả các mục có role: ["Admin"]
    if (isAdmin && item.roles.includes("Admin")) {
      return true;
    }
    // Nếu người dùng là Customer (và không phải Admin), chỉ hiển thị các mục có role: ["Customer"]
    if (isCustomer && !isAdmin && item.roles.includes("Customer")) {
      return true;
    }
    return false;
  });

  return (
    <>
      {/* Overlay */}
      {isSidebarOpen && (
        <div
          suppressHydrationWarning={true}
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-20 lg:hidden animate-fade-in"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside
        suppressHydrationWarning={true}
        className={`fixed top-0 left-0 z-30 h-full w-72 bg-white border-r overflow-y-auto transition-transform duration-300 ease-in-out lg:static lg:translate-x-0
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo Area with gradient */}
        <div className="h-16 flex items-center px-6 border-b border-purple-50 bg-gradient-to-r from-purple-50 to-pink-50">
          <Link href="/user/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:shadow-purple-300 group-hover:scale-110 transition-all">
              Logo
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
              OOTDverse
            </span>
          </Link>
        </div>

        {/* Menu Items */}
        <nav className="p-4 space-y-1 mt-2">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = router.pathname === item.path;

            return (
              <Link
                key={item.id}
                href={item.path}
                onClick={() =>
                  window.innerWidth < 1024 && setIsSidebarOpen(false)
                }
                className={`flex items-center justify-between px-4 py-3.5 rounded-xl font-medium transition-all duration-200 group relative ${isActive
                  ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg shadow-purple-200"
                  : "text-gray-600 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:text-purple-700"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive
                      ? "text-white"
                      : "text-gray-400 group-hover:text-purple-600"
                      }`}
                  />
                  <span>{item.label}</span>
                </div>
                <ChevronRight
                  className={`w-4 h-4 transition-all ${isActive
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"
                    }`}
                />
              </Link>
            );
          })}
        </nav>

        {/* Upgrade Card */}
        <div className="absolute bottom-22 left-4 right-4 bg-gradient-to-br from-purple-600 to-pink-500 rounded-2xl p-5 text-white">
          <Sparkles className="w-8 h-8 mb-3 animate-pulse" />
          <h3 className="font-bold text-lg mb-1">Nâng cấp Premium</h3>
          <p className="text-white/80 text-sm mb-4">
            Trải nghiệm đầy đủ tính năng AI
          </p>
          <button className="w-full bg-white text-purple-600 py-2 rounded-xl font-semibold hover:bg-purple-50 transition-colors">
            Nâng cấp ngay
          </button>
        </div>
      </aside>
    </>
  );
}