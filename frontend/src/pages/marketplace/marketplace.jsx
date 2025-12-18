"use client";
import { useState, useEffect } from "react";
import LayoutUser from "@/components/layout/LayoutUser";
import { useAuth } from "@/context/AuthContext";
import MarketplaceTab from "@/components/marketplace/MarketplaceTab";
import MyListingsTab from "@/components/marketplace/MyListingsTab";
import OrdersTab from "@/components/orders/OrdersTab";
import { Store, ShoppingBag, User, Package } from "lucide-react";

export default function MarketplacePage() {
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState("marketplace");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const savedTab = sessionStorage.getItem("marketplaceTab");
      if (savedTab) {
        setActiveTab(savedTab);
      }
    }
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("marketplaceTab", tab);
    }
  };

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("marketplaceTab");
      }
    };
  }, []);

  if (!mounted) {
    return (
      <LayoutUser>
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="animate-pulse">
            <div className="h-32 bg-gradient-to-r from-purple-200 to-pink-200 rounded-2xl mb-6"></div>
            <div className="h-64 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </LayoutUser>
    );
  }

  return (
    <LayoutUser>
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 rounded-2xl p-8 text-white shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
                <Store className="w-8 h-8" />
                Marketplace
              </h1>
              <p className="text-white/90 mt-2 text-lg">
                Khám phá, mua bán & quản lý gian hàng thời trang
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-6 flex gap-3 flex-wrap">
            <TabPill
              active={activeTab === "marketplace"}
              onClick={() => handleTabChange("marketplace")}
              icon={<ShoppingBag className="w-5 h-5" />}
            >
              Chợ
            </TabPill>

            {user && (
              <>
                <TabPill
                  active={activeTab === "my-listings"}
                  onClick={() => handleTabChange("my-listings")}
                  icon={<User className="w-5 h-5" />}
                >
                  Gian hàng của tôi
                </TabPill>

                <TabPill
                  active={activeTab === "orders"}
                  onClick={() => handleTabChange("orders")}
                  icon={<Package className="w-5 h-5" />}
                >
                  Đơn hàng
                </TabPill>
              </>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="min-h-[300px]">
          {activeTab === "marketplace" && <MarketplaceTab />}
          {activeTab === "my-listings" && user && <MyListingsTab />}
          {activeTab === "orders" && user && <OrdersTab />}
        </div>
      </div>
    </LayoutUser>
  );
}

function TabPill({ active, children, onClick, icon }) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
        active
          ? "bg-white text-purple-600 shadow-lg"
          : "bg-white/20 text-white hover:bg-white/30"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}