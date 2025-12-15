"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import {
  getListings,
  getListingById,
  searchListings,
  getUserListings,
  createListing,
  updateListing,
  deleteListing,
  toggleFavorite,
  boostListing,
  getMarketplaceStats,
} from "@/services/marketplace-index";

const MarketplaceContext = createContext();

export function MarketplaceProvider({ children }) {
  const { user } = useAuth();

  // STATE
  const [listings, setListings] = useState([]);
  const [myListings, setMyListings] = useState([]);
  const [currentListing, setCurrentListing] = useState(null);
  const [stats, setStats] = useState(null);
  
  const [filters, setFilters] = useState({
    status: "active",
    listing_type: null,
    condition: null,
    category_id: null,
    brand_id: null,
    color_id: null,
    min_price: null,
    max_price: null,
    sort_by: "newest",
    page: 1,
    limit: 20,
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // LOAD LISTINGS
  const loadListings = async (customFilters = {}) => {
    try {
      setLoading(true);
      setError(null);

      const filterToUse = { ...filters, ...customFilters };
      const response = await getListings(filterToUse);

      setListings(response.data || []);
      setPagination(response.pagination || {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
      });
    } catch (err) {
      console.error("Error loading listings:", err);
      setError(err.error || err.message || "Không thể tải danh sách");
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  // LOAD MY LISTINGS
  const loadMyListings = async (customFilters = {}) => {
    if (!user?._id) {
      console.log("No user ID, skipping loadMyListings");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await getUserListings(user._id, customFilters);
      setMyListings(response.data || []);
    } catch (err) {
      console.error("Error loading my listings:", err);
      setError(err.error || err.message || "Không thể tải listings của bạn");
      setMyListings([]);
    } finally {
      setLoading(false);
    }
  };

  // LOAD LISTING BY ID
  const loadListingById = async (id, incrementView = true) => {
    try {
      setLoading(true);
      setError(null);

      const response = await getListingById(id, incrementView);
      setCurrentListing(response.data);
      return response.data;
    } catch (err) {
      console.error("Error loading listing:", err);
      setError(err.error || err.message || "Không thể tải listing");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // SEARCH LISTINGS
  const searchListingsFunc = async (searchParams) => {
    try {
      setLoading(true);
      setError(null);

      const response = await searchListings(searchParams);
      setListings(response.data || []);
      setPagination(response.pagination || {});
    } catch (err) {
      console.error("Error searching listings:", err);
      setError(err.error || err.message || "Không thể tìm kiếm");
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  // CREATE LISTING
  const addListing = async (listingData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await createListing({
        ...listingData,
        seller_id: user._id,
      });

      setMyListings((prev) => [response.data, ...prev]);
      return response.data;
    } catch (err) {
      console.error("Error creating listing:", err);
      setError(err.error || err.message || "Không thể tạo listing");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // UPDATE LISTING
  const editListing = async (id, listingData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await updateListing(id, listingData);

      setListings((prev) =>
        prev.map((l) => (l._id === id ? response.data : l))
      );

      setMyListings((prev) =>
        prev.map((l) => (l._id === id ? response.data : l))
      );

      if (currentListing?._id === id) {
        setCurrentListing(response.data);
      }

      return response.data;
    } catch (err) {
      console.error("Error updating listing:", err);
      setError(err.error || err.message || "Không thể cập nhật listing");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // DELETE LISTING
  const removeListing = async (id) => {
    try {
      setLoading(true);
      setError(null);

      await deleteListing(id);

      setListings((prev) => prev.filter((l) => l._id !== id));
      setMyListings((prev) => prev.filter((l) => l._id !== id));

      return true;
    } catch (err) {
      console.error("Error deleting listing:", err);
      setError(err.error || err.message || "Không thể xóa listing");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // TOGGLE FAVORITE
  const toggleListingFavorite = async (id, isFavorite) => {
    try {
      const response = await toggleFavorite(id, !isFavorite);

      setListings((prev) =>
        prev.map((l) =>
          l._id === id
            ? { ...l, favorite_count: response.data.favorite_count }
            : l
        )
      );

      if (currentListing?._id === id) {
        setCurrentListing((prev) => ({
          ...prev,
          favorite_count: response.data.favorite_count,
        }));
      }

      return response.data;
    } catch (err) {
      console.error("Error toggling favorite:", err);
      throw err;
    }
  };

  // BOOST LISTING
  const boostListingFunc = async (id) => {
    try {
      setLoading(true);
      setError(null);

      const response = await boostListing(id);

      setMyListings((prev) =>
        prev.map((l) =>
          l._id === id
            ? {
                ...l,
                boost_count: response.data.boost_count,
                last_boosted_at: response.data.last_boosted_at,
              }
            : l
        )
      );

      return response.data;
    } catch (err) {
      console.error("Error boosting listing:", err);
      setError(err.error || err.message || "Không thể boost listing");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // LOAD STATS
  const loadStats = async () => {
    try {
      const response = await getMarketplaceStats();
      setStats(response.data);
    } catch (err) {
      console.error("Error loading stats:", err);
    }
  };

  // UPDATE FILTERS
  const updateFilters = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const resetFilters = () => {
    setFilters({
      status: "active",
      listing_type: null,
      condition: null,
      category_id: null,
      brand_id: null,
      color_id: null,
      min_price: null,
      max_price: null,
      sort_by: "newest",
      page: 1,
      limit: 20,
    });
  };

  // PAGINATION
  const goToPage = (page) => {
    updateFilters({ page });
  };

  const nextPage = () => {
    if (pagination.page < pagination.totalPages) {
      goToPage(pagination.page + 1);
    }
  };

  const prevPage = () => {
    if (pagination.page > 1) {
      goToPage(pagination.page - 1);
    }
  };

  // Refresh function
  const refreshListings = () => {
    loadListings();
    if (user?._id) {
      loadMyListings();
    }
  };

  // LOAD LISTINGS ON MOUNT & FILTER CHANGE
  useEffect(() => {
    loadListings();
  }, [filters.page, filters.sort_by, filters.status]);

  // Load my listings when user logs in
  useEffect(() => {
    if (user?._id) {
      loadMyListings();
    } else {
      setMyListings([]);
    }
  }, [user?._id]);

  return (
    <MarketplaceContext.Provider
      value={{
        // State
        listings,
        myListings,
        currentListing,
        stats,
        filters,
        pagination,
        loading,
        error,

        // Functions
        loadListings,
        loadMyListings,
        loadListingById,
        searchListings: searchListingsFunc,
        addListing,
        editListing,
        removeListing,
        toggleListingFavorite,
        boostListing: boostListingFunc,
        loadStats,
        updateFilters,
        resetFilters,
        refreshListings,

        // Pagination
        goToPage,
        nextPage,
        prevPage,

        // Helpers
        setCurrentListing,
      }}
    >
      {children}
    </MarketplaceContext.Provider>
  );
}

export function useMarketplace() {
  const context = useContext(MarketplaceContext);
  if (!context) {
    throw new Error("useMarketplace must be used within MarketplaceProvider");
  }
  return context;
}