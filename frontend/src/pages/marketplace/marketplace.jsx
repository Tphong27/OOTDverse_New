//frontend/src/pages/marketplace/marketplace.jsx
import LayoutUser from "@/components/layout/LayoutUser";
import { useAuth } from "@/context/AuthContext";
import { useMarketplace } from "@/context/MarketplaceContext";
import ListingGrid from "@/components/marketplace/ListingGrid";
import { useRouter } from "next/router";

export default function Marketplace() {
  const router = useRouter();
  const { user } = useAuth();
  const { refreshListings } = useMarketplace();

  return (
    <LayoutUser>
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Marketplace</h1>
            <p className="text-gray-600 mt-1">
              Khám phá & mua sắm từ cộng đồng
            </p>
          </div>

          {/* My Listings Button (nếu đã login) */}
          {user && (
            <button
              onClick={() => router.push("/marketplace/my-listings")}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-pink-500 text-white font-semibold hover:bg-pink-600 transition-colors shadow"
            >
              Quản lý listings của tôi
            </button>
          )}
        </div>

        {/* Marketplace Grid */}
        <ListingGrid />
      </div>
    </LayoutUser>
  );
}