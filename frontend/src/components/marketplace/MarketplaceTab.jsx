import { useMarketplace } from "@/context/MarketplaceContext";
import ListingGrid from "@/components/marketplace/ListingGrid";

export default function MarketplaceTab() {
  const { refreshListings } = useMarketplace();

  return (
    <div className="space-y-6">
      <ListingGrid />
    </div>
  );
}
