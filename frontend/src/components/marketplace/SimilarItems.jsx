//frontend/src/pages/marketplace/components/SimilarItems.jsx
import { useEffect, useState } from "react";
import { getListings } from "@/services/marketplace-index";
import ListingCard from "@/components/marketplace/ListingCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function SimilarItems({ categoryId, currentListingId }) {
  const [similarItems, setSimilarItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    loadSimilarItems();
  }, [categoryId]);

  const loadSimilarItems = async () => {
    if (!categoryId) return;

    try {
      setLoading(true);
      const response = await getListings({
        category_id: categoryId,
        status: "active",
        limit: 8,
      });

      // Filter out current listing
      const filtered = response.data.filter(
        (item) => item._id !== currentListingId
      );

      setSimilarItems(filtered);
    } catch (error) {
      console.error("Error loading similar items:", error);
    } finally {
      setLoading(false);
    }
  };

  const scrollContainer = (direction) => {
    const container = document.getElementById("similar-items-scroll");
    if (!container) return;

    const scrollAmount = 300;
    const newPosition =
      direction === "left"
        ? scrollPosition - scrollAmount
        : scrollPosition + scrollAmount;

    container.scrollTo({
      left: newPosition,
      behavior: "smooth",
    });

    setScrollPosition(newPosition);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Sản phẩm tương tự</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square bg-gray-200 rounded-xl mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (similarItems.length === 0) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">Sản phẩm tương tự</h2>

      {/* Desktop: Grid */}
      <div className="hidden lg:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {similarItems.slice(0, 4).map((item) => (
          <ListingCard key={item._id} listing={item} showSellerInfo={false} />
        ))}
      </div>

      {/* Mobile: Horizontal Scroll */}
      <div className="lg:hidden relative">
        <div
          id="similar-items-scroll"
          className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {similarItems.map((item) => (
            <div
              key={item._id}
              className="flex-shrink-0 w-64 snap-start"
            >
              <ListingCard listing={item} showSellerInfo={false} />
            </div>
          ))}
        </div>

        {/* Scroll Buttons */}
        {similarItems.length > 2 && (
          <>
            <button
              onClick={() => scrollContainer("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white shadow-lg hover:bg-gray-50 transition-colors z-10"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => scrollContainer("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white shadow-lg hover:bg-gray-50 transition-colors z-10"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}