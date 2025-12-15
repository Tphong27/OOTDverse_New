//frontend/src/pages/marketplace/marketplace.jsx
import LayoutUser from "@/components/layout/LayoutUser";
import { useState } from "react";
import { Plus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useMarketplace } from "@/context/MarketplaceContext";
import ListingGrid from "@/pages/marketplace/ListingGrid";
import CreateListingModal from "@/pages/marketplace/CreateListingModal";

export default function Marketplace() {
  const { user } = useAuth();
  const { refreshListings } = useMarketplace();

  const [openCreateModal, setOpenCreateModal] = useState(false);

  const handleCreateSuccess = () => {
    refreshListings(); // load lại danh sách sau khi đăng bán
  };

  return (
    <LayoutUser>
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Marketplace</h1>
            <p className="text-gray-600 mt-1">
              Mua bán & trao đổi quần áo từ cộng đồng
            </p>
          </div>

          {/* Create Listing Button */}
          {user && (
            <button
              onClick={() => setOpenCreateModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-pink-500 text-white font-semibold hover:bg-pink-600 transition-colors shadow"
            >
              <Plus size={20} />
              Đăng bán
            </button>
          )}
        </div>

        {/* Marketplace Grid */}
        <ListingGrid />

        {/* Create Listing Modal */}
        {user && (
          <CreateListingModal
            isOpen={openCreateModal}
            onClose={() => setOpenCreateModal(false)}
            onSuccess={handleCreateSuccess}
          />
        )}
      </div>
    </LayoutUser>
  );
}
