"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import {
  createSwapRequest,
  getSwapRequestById,
  getUserSwapRequests,
  getSwapStats,
  acceptSwapRequest,
  rejectSwapRequest,
  cancelSwapRequest,
  updateShipping,
  markDelivered,
  rateSwapPartner,
} from "@/services/marketplace-index";

const SwapContext = createContext();

export function SwapProvider({ children }) {
  const { user } = useAuth();

  // ========================================
  // STATE
  // ========================================
  const [sentRequests, setSentRequests] = useState([]); // Swap requests sent by user
  const [receivedRequests, setReceivedRequests] = useState([]); // Swap requests received by user
  const [currentSwap, setCurrentSwap] = useState(null);
  const [stats, setStats] = useState(null);

  const [filters, setFilters] = useState({
    status: null,
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

  // ========================================
  // LOAD SENT REQUESTS (as Requester)
  // ========================================
  const loadSentRequests = async (customFilters = {}) => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const response = await getUserSwapRequests(user._id, {
        role: "requester",
        ...filters,
        ...customFilters,
      });

      setSentRequests(response.data);
      setPagination(response.pagination);
    } catch (err) {
      console.error("Error loading sent requests:", err);
      setError(err.error || "Không thể tải yêu cầu đã gửi");
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // LOAD RECEIVED REQUESTS (as Receiver)
  // ========================================
  const loadReceivedRequests = async (customFilters = {}) => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const response = await getUserSwapRequests(user._id, {
        role: "receiver",
        ...filters,
        ...customFilters,
      });

      setReceivedRequests(response.data);
      setPagination(response.pagination);
    } catch (err) {
      console.error("Error loading received requests:", err);
      setError(err.error || "Không thể tải yêu cầu đã nhận");
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // LOAD SWAP BY ID
  // ========================================
  const loadSwapById = async (id) => {
    try {
      setLoading(true);
      setError(null);

      const response = await getSwapRequestById(id);
      setCurrentSwap(response.data);
      return response.data;
    } catch (err) {
      console.error("Error loading swap:", err);
      setError(err.error || "Không thể tải swap request");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // CREATE SWAP REQUEST
  // ========================================
  const sendSwapRequest = async (swapData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await createSwapRequest({
        ...swapData,
        requester_id: user._id,
      });

      // Add to sentRequests
      setSentRequests((prev) => [response.data, ...prev]);

      return response.data;
    } catch (err) {
      console.error("Error creating swap request:", err);
      setError(err.error || "Không thể gửi yêu cầu swap");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // ACCEPT SWAP REQUEST
  // ========================================
  const acceptSwap = async (id, receiverMessage = null, receiverAddress) => {
    try {
      setLoading(true);
      setError(null);

      const response = await acceptSwapRequest(id, receiverMessage, receiverAddress);

      // Update in receivedRequests
      setReceivedRequests((prev) =>
        prev.map((s) => (s._id === id ? response.data : s))
      );

      // Update current swap
      if (currentSwap?._id === id) {
        setCurrentSwap(response.data);
      }

      return response.data;
    } catch (err) {
      console.error("Error accepting swap:", err);
      setError(err.error || "Không thể chấp nhận swap");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // REJECT SWAP REQUEST
  // ========================================
  const rejectSwap = async (id, rejectionReason) => {
    try {
      setLoading(true);
      setError(null);

      const response = await rejectSwapRequest(id, rejectionReason);

      // Update in receivedRequests
      setReceivedRequests((prev) =>
        prev.map((s) => (s._id === id ? response.data : s))
      );

      // Update current swap
      if (currentSwap?._id === id) {
        setCurrentSwap(response.data);
      }

      return response.data;
    } catch (err) {
      console.error("Error rejecting swap:", err);
      setError(err.error || "Không thể từ chối swap");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // CANCEL SWAP REQUEST
  // ========================================
  const cancelSwap = async (id) => {
    try {
      setLoading(true);
      setError(null);

      const response = await cancelSwapRequest(id);

      // Update in sentRequests
      setSentRequests((prev) =>
        prev.map((s) => (s._id === id ? response.data : s))
      );

      // Update current swap
      if (currentSwap?._id === id) {
        setCurrentSwap(response.data);
      }

      return response.data;
    } catch (err) {
      console.error("Error cancelling swap:", err);
      setError(err.error || "Không thể hủy swap");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // UPDATE SHIPPING
  // ========================================
  const updateSwapShipping = async (id, party, shippingMethod, trackingNumber = null) => {
    try {
      setLoading(true);
      setError(null);

      const response = await updateShipping(id, party, shippingMethod, trackingNumber);

      // Update in sentRequests or receivedRequests
      const updateSwap = (prev) =>
        prev.map((s) => (s._id === id ? response.data : s));

      setSentRequests(updateSwap);
      setReceivedRequests(updateSwap);

      // Update current swap
      if (currentSwap?._id === id) {
        setCurrentSwap(response.data);
      }

      return response.data;
    } catch (err) {
      console.error("Error updating shipping:", err);
      setError(err.error || "Không thể cập nhật vận chuyển");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // MARK AS DELIVERED
  // ========================================
  const markSwapDelivered = async (id, party) => {
    try {
      setLoading(true);
      setError(null);

      const response = await markDelivered(id, party);

      // Update in sentRequests or receivedRequests
      const updateSwap = (prev) =>
        prev.map((s) => (s._id === id ? response.data : s));

      setSentRequests(updateSwap);
      setReceivedRequests(updateSwap);

      // Update current swap
      if (currentSwap?._id === id) {
        setCurrentSwap(response.data);
      }

      return response.data;
    } catch (err) {
      console.error("Error marking delivered:", err);
      setError(err.error || "Không thể xác nhận nhận hàng");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // RATE SWAP PARTNER
  // ========================================
  const ratePartner = async (id, party, rating, review = null) => {
    try {
      setLoading(true);
      setError(null);

      const response = await rateSwapPartner(id, party, rating, review);

      // Update in sentRequests or receivedRequests
      const updateSwap = (prev) =>
        prev.map((s) => (s._id === id ? response.data : s));

      setSentRequests(updateSwap);
      setReceivedRequests(updateSwap);

      return response.data;
    } catch (err) {
      console.error("Error rating partner:", err);
      setError(err.error || "Không thể đánh giá");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // LOAD STATS
  // ========================================
  const loadSwapStats = async () => {
    if (!user) return;

    try {
      const response = await getSwapStats(user._id);
      setStats(response.data);
    } catch (err) {
      console.error("Error loading swap stats:", err);
    }
  };

  // ========================================
  // UPDATE FILTERS
  // ========================================
  const updateFilters = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const resetFilters = () => {
    setFilters({
      status: null,
      page: 1,
      limit: 20,
    });
  };

  // ========================================
  // PAGINATION
  // ========================================
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

  // ========================================
  // LOAD SWAPS ON USER LOGIN
  // ========================================
  useEffect(() => {
    if (user) {
      loadSentRequests();
      loadReceivedRequests();
      loadSwapStats();
    }
  }, [user]);

  return (
    <SwapContext.Provider
      value={{
        // State
        sentRequests,
        receivedRequests,
        currentSwap,
        stats,
        filters,
        pagination,
        loading,
        error,

        // Functions
        loadSentRequests,
        loadReceivedRequests,
        loadSwapById,
        sendSwapRequest,
        acceptSwap,
        rejectSwap,
        cancelSwap,
        updateSwapShipping,
        markSwapDelivered,
        ratePartner,
        loadSwapStats,
        updateFilters,
        resetFilters,

        // Pagination
        goToPage,
        nextPage,
        prevPage,

        // Helpers
        setCurrentSwap,
      }}
    >
      {children}
    </SwapContext.Provider>
  );
}

export function useSwap() {
  const context = useContext(SwapContext);
  if (!context) {
    throw new Error("useSwap must be used within SwapProvider");
  }
  return context;
}