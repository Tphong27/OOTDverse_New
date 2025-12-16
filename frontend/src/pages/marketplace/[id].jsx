//frontend/src/pages/marketplace/[id].jsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import LayoutUser from "@/components/layout/LayoutUser";
import { useMarketplace } from "@/context/MarketplaceContext";
import { useAuth } from "@/context/AuthContext";
import ImageGallery from "@/components/marketplace/ImageGallery";
import SellerProfile from "@/components/marketplace/SellerProfile";
import ListingInfo from "@/components/marketplace/ListingInfo";
import SimilarItems from "@/components/marketplace/SimilarItems";
import BuyModal from "@/components/marketplace/BuyModal";
import SwapModal from "@/components/marketplace/SwapModal";
import { ArrowLeft, Heart, Share2, Flag, MapPin } from "lucide-react";

export default function ListingDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const { loadListingById, currentListing, loading, toggleListingFavorite } = useMarketplace();

  const [isFavorited, setIsFavorited] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showSwapModal, setShowSwapModal] = useState(false);

  // Load listing
  useEffect(() => {
    if (id) {
      loadListingById(id, true); // increment view
    }
  }, [id]);

  // Handle favorite
  const handleFavorite = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    try {
      await toggleListingFavorite(currentListing._id, isFavorited);
      setIsFavorited(!isFavorited);
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  // Handle share
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: currentListing?.item_id?.item_name,
        text: currentListing?.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Đã copy link!");
    }
  };

  // Loading state
  if (loading) {
    return (
      <LayoutUser>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-96 bg-gray-200 rounded-xl"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </LayoutUser>
    );
  }

  // Not found
  if (!currentListing) {
    return (
      <LayoutUser>
        <div className="max-w-7xl mx-auto px-4 py-8 text-center">
          <p className="text-gray-500 text-lg">Không tìm thấy sản phẩm</p>
          <button
            onClick={() => router.push("/marketplace/marketplace")}
            className="mt-4 text-pink-600 hover:text-pink-700 underline"
          >
            Quay lại Marketplace
          </button>
        </div>
      </LayoutUser>
    );
  }

  const isOwner = user?._id === currentListing?.seller_id?._id;
  const canBuy = currentListing?.listing_type !== "swap" && !isOwner;
  const canSwap = currentListing?.listing_type !== "sell" && !isOwner;

  return (
    <LayoutUser>
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Quay lại</span>
        </button>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Image Gallery */}
          <div className="lg:col-span-2 space-y-6">
            <ImageGallery
              mainImage={currentListing.item_id?.image_url}
              additionalImages={currentListing.item_id?.additional_images || []}
            />

            {/* Listing Info */}
            <ListingInfo listing={currentListing} />

            {/* Location */}
            {currentListing.shipping_from_location?.province && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin size={20} />
                  Vị trí
                </h3>
                <p className="text-gray-700">
                  {currentListing.shipping_from_location.address && (
                    <>{currentListing.shipping_from_location.address}, </>
                  )}
                  {currentListing.shipping_from_location.ward && (
                    <>{currentListing.shipping_from_location.ward}, </>
                  )}
                  {currentListing.shipping_from_location.district && (
                    <>{currentListing.shipping_from_location.district}, </>
                  )}
                  {currentListing.shipping_from_location.province}
                </p>
              </div>
            )}
          </div>

          {/* Right: Seller Info & Actions */}
          <div className="lg:col-span-1 space-y-6">
            {/* Action Buttons - Sticky */}
            <div className="sticky top-20 space-y-4">
              {/* Price Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                {currentListing.listing_type !== "swap" ? (
                  <>
                    <p className="text-3xl font-bold text-pink-600">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(currentListing.selling_price)}
                    </p>
                    {currentListing.original_price &&
                      currentListing.original_price > currentListing.selling_price && (
                        <p className="text-sm text-gray-500 line-through mt-1">
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(currentListing.original_price)}
                        </p>
                      )}
                  </>
                ) : (
                  <p className="text-2xl font-bold text-purple-600">Chỉ Swap</p>
                )}

                {/* Shipping Fee */}
                {currentListing.shipping_fee > 0 && (
                  <p className="text-sm text-gray-600 mt-2">
                    Phí ship: {new Intl.NumberFormat("vi-VN").format(currentListing.shipping_fee)} đ
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              {!isOwner ? (
                <div className="space-y-3">
                  {canBuy && (
                    <button
                      onClick={() => setShowBuyModal(true)}
                      className="w-full py-3 rounded-xl bg-pink-500 text-white font-semibold hover:bg-pink-600 transition-colors shadow"
                    >
                      Mua ngay
                    </button>
                  )}

                  {canSwap && (
                    <button
                      onClick={() => setShowSwapModal(true)}
                      className="w-full py-3 rounded-xl bg-purple-500 text-white font-semibold hover:bg-purple-600 transition-colors shadow"
                    >
                      Đề xuất Swap
                    </button>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={handleFavorite}
                      className={`flex-1 py-3 rounded-xl border-2 font-semibold transition-colors ${
                        isFavorited
                          ? "border-red-500 bg-red-50 text-red-600"
                          : "border-gray-300 hover:border-red-500 hover:bg-red-50 hover:text-red-600"
                      }`}
                    >
                      <Heart
                        size={20}
                        fill={isFavorited ? "currentColor" : "none"}
                        className="inline mr-2"
                      />
                      Yêu thích
                    </button>

                    <button
                      onClick={handleShare}
                      className="px-4 py-3 rounded-xl border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-colors"
                    >
                      <Share2 size={20} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                  <p className="text-blue-800 font-medium">Đây là sản phẩm của bạn</p>
                </div>
              )}

              {/* Report */}
              {!isOwner && (
                <button className="w-full flex items-center justify-center gap-2 py-2 text-sm text-gray-500 hover:text-red-600 transition-colors">
                  <Flag size={16} />
                  Báo cáo vi phạm
                </button>
              )}
            </div>

            {/* Seller Profile */}
            <SellerProfile seller={currentListing.seller_id} />
          </div>
        </div>

        {/* Similar Items */}
        <SimilarItems
          categoryId={currentListing.item_id?.category_id?._id}
          currentListingId={currentListing._id}
        />

        {/* Modals */}
        {showBuyModal && (
          <BuyModal
            listing={currentListing}
            onClose={() => setShowBuyModal(false)}
          />
        )}

        {showSwapModal && (
          <SwapModal
            listing={currentListing}
            onClose={() => setShowSwapModal(false)}
          />
        )}
      </div>
    </LayoutUser>
  );
}