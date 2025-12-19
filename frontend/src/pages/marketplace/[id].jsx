// frontend/src/pages/marketplace/[id].jsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import LayoutUser from "@/components/layout/LayoutUser";
import { useMarketplace } from "@/context/MarketplaceContext";
import { useAuth } from "@/context/AuthContext";
import ImageGallery from "@/components/marketplace/ImageGallery";
import SellerProfile from "@/components/marketplace/SellerProfile";
import ListingInfo from "@/components/marketplace/ListingInfo";
import SimilarItems from "@/components/marketplace/SimilarItems";
import AddToCartModal from "@/components/marketplace/AddToCartModal";
import SwapModal from "@/components/marketplace/SwapModal";
import { ArrowLeft, Heart, Share2, MapPin, ShoppingCart, RefreshCw, Shield, TrendingUp } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function ListingDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const { loadListingById, currentListing, loading, toggleListingFavorite } = useMarketplace();

  const [isFavorited, setIsFavorited] = useState(false);
  const [showAddToCart, setShowAddToCart] = useState(false);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const { cartItems } = useCart();

  // Check if already in cart
  const isInCart = cartItems.some(item => item.listing_id === currentListing?._id);

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

  const formatPrice = (price) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

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
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-20">
              {/* Price */}
              {currentListing.listing_type !== "swap" ? (
                <div className="mb-6">
                  <p className="text-sm text-gray-600 mb-1">Giá bán</p>
                  <p className="text-3xl font-bold text-pink-600">
                    {formatPrice(currentListing.selling_price)}
                  </p>
                  {currentListing.original_price && currentListing.original_price > currentListing.selling_price && (
                    <p className="text-sm text-gray-500 line-through mt-1">
                      {formatPrice(currentListing.original_price)}
                    </p>
                  )}
                </div>
              ) : (
                <div className="mb-6">
                  <p className="text-2xl font-bold text-purple-600">Chỉ trao đổi (Swap)</p>
                </div>
              )}
              {/* Action Buttons */}
              {user && user._id !== currentListing.seller_id._id ? (
                <div className="space-y-3">
                  {/* Add to Cart - Only for sell/both */}
                  {(currentListing.listing_type === "sell" || currentListing.listing_type === "both") && (
                    <button
                      onClick={() => setShowAddToCart(true)}
                      disabled={isInCart}
                      className={`w-full py-4 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 ${
                        isInCart
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700"
                      }`}
                    >
                      <ShoppingCart size={20} />
                      {isInCart ? "Đã có trong giỏ hàng" : "Thêm vào giỏ hàng"}
                    </button>
                  )}
                  {/* Swap Request - Only for swap/both */}
                  {(currentListing.listing_type === "swap" || currentListing.listing_type === "both") && (
                    <button
                      onClick={() => setShowSwapModal(true)}
                      className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg flex items-center justify-center gap-2"
                    >
                      <RefreshCw size={20} />
                      Đề xuất Swap
                    </button>
                  )}
                  {/* Favorite & Share */}
                  <div className="flex gap-3">
                    <button
                      onClick={handleFavorite}
                      className={`flex-1 py-3 rounded-lg border-2 font-semibold transition-colors flex items-center justify-center gap-2 ${
                        isFavorited
                          ? "border-pink-500 bg-pink-50 text-pink-600"
                          : "border-gray-300 text-gray-700 hover:border-pink-500 hover:bg-pink-50 hover:text-pink-700"
                      }`}
                    >
                      <Heart
                        size={18}
                        fill={isFavorited ? "currentColor" : "none"}
                      />
                      Yêu thích
                    </button>
                    <button
                      onClick={handleShare}
                      className="flex-1 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Share2 size={18} />
                      Chia sẻ
                    </button>
                  </div>
                </div>
              ) : user && user._id === currentListing.seller_id._id ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800 text-center">
                    Đây là món đồ của bạn
                  </p>
                </div>
              ) : (
                <button
                  onClick={() => router.push("/login")}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold hover:from-pink-600 hover:to-purple-700 transition-all shadow-lg"
                >
                  Đăng nhập để mua
                </button>
              )}
              {/* Trust Indicators */}
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Shield size={16} className="text-green-600" />
                  <span>Thanh toán an toàn & bảo mật</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <TrendingUp size={16} className="text-blue-600" />
                  <span>Hoàn tiền nếu không đúng mô tả</span>
                </div>
              </div>
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
        {showAddToCart && (
          <AddToCartModal
            listing={currentListing}
            onClose={() => setShowAddToCart(false)}
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