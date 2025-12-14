"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import {
  createOrder,
  getOrderById,
  getUserOrders,
  getOrderStats,
  updateOrderStatus,
  updatePaymentStatus,
  cancelOrder,
  rateSeller,
  rateBuyer,
} from "@/services/marketplace-index";

const OrderContext = createContext();

export function OrderProvider({ children }) {
  const { user } = useAuth();

  // ========================================
  // STATE
  // ========================================
  const [myOrders, setMyOrders] = useState([]); // Orders as buyer
  const [mySales, setMySales] = useState([]); // Orders as seller
  const [currentOrder, setCurrentOrder] = useState(null);
  const [buyerStats, setBuyerStats] = useState(null);
  const [sellerStats, setSellerStats] = useState(null);

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
  // LOAD MY ORDERS (as Buyer)
  // ========================================
  const loadMyOrders = async (customFilters = {}) => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const response = await getUserOrders(user._id, {
        role: "buyer",
        ...filters,
        ...customFilters,
      });

      setMyOrders(response.data);
      setPagination(response.pagination);
    } catch (err) {
      console.error("Error loading orders:", err);
      setError(err.error || "Không thể tải đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // LOAD MY SALES (as Seller)
  // ========================================
  const loadMySales = async (customFilters = {}) => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const response = await getUserOrders(user._id, {
        role: "seller",
        ...filters,
        ...customFilters,
      });

      setMySales(response.data);
      setPagination(response.pagination);
    } catch (err) {
      console.error("Error loading sales:", err);
      setError(err.error || "Không thể tải đơn bán");
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // LOAD ORDER BY ID
  // ========================================
  const loadOrderById = async (id) => {
    try {
      setLoading(true);
      setError(null);

      const response = await getOrderById(id);
      setCurrentOrder(response.data);
      return response.data;
    } catch (err) {
      console.error("Error loading order:", err);
      setError(err.error || "Không thể tải đơn hàng");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // CREATE ORDER
  // ========================================
  const placeOrder = async (orderData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await createOrder({
        ...orderData,
        buyer_id: user._id,
      });

      // Add to myOrders
      setMyOrders((prev) => [response.data, ...prev]);

      return response.data;
    } catch (err) {
      console.error("Error creating order:", err);
      setError(err.error || "Không thể tạo đơn hàng");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // UPDATE ORDER STATUS
  // ========================================
  const changeOrderStatus = async (id, status, trackingNumber = null) => {
    try {
      setLoading(true);
      setError(null);

      const response = await updateOrderStatus(id, status, trackingNumber);

      // Update in myOrders or mySales
      const updateOrder = (prev) =>
        prev.map((o) => (o._id === id ? response.data : o));

      setMyOrders(updateOrder);
      setMySales(updateOrder);

      // Update current order
      if (currentOrder?._id === id) {
        setCurrentOrder(response.data);
      }

      return response.data;
    } catch (err) {
      console.error("Error updating order status:", err);
      setError(err.error || "Không thể cập nhật trạng thái");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // UPDATE PAYMENT STATUS
  // ========================================
  const changePaymentStatus = async (id, paymentStatus, transactionId = null) => {
    try {
      setLoading(true);
      setError(null);

      const response = await updatePaymentStatus(id, paymentStatus, transactionId);

      // Update in myOrders
      setMyOrders((prev) =>
        prev.map((o) => (o._id === id ? response.data : o))
      );

      // Update current order
      if (currentOrder?._id === id) {
        setCurrentOrder(response.data);
      }

      return response.data;
    } catch (err) {
      console.error("Error updating payment status:", err);
      setError(err.error || "Không thể cập nhật thanh toán");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // CANCEL ORDER
  // ========================================
  const cancelOrderFunc = async (id, reason, cancelledBy) => {
    try {
      setLoading(true);
      setError(null);

      const response = await cancelOrder(id, reason, cancelledBy);

      // Update in myOrders or mySales
      const updateOrder = (prev) =>
        prev.map((o) => (o._id === id ? response.data : o));

      setMyOrders(updateOrder);
      setMySales(updateOrder);

      // Update current order
      if (currentOrder?._id === id) {
        setCurrentOrder(response.data);
      }

      return response.data;
    } catch (err) {
      console.error("Error cancelling order:", err);
      setError(err.error || "Không thể hủy đơn hàng");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // RATE SELLER (Buyer rates Seller)
  // ========================================
  const rateSellerFunc = async (id, rating, review = null) => {
    try {
      setLoading(true);
      setError(null);

      const response = await rateSeller(id, rating, review);

      // Update in myOrders
      setMyOrders((prev) =>
        prev.map((o) =>
          o._id === id
            ? { ...o, buyer_rating: rating, buyer_review: review }
            : o
        )
      );

      return response.data;
    } catch (err) {
      console.error("Error rating seller:", err);
      setError(err.error || "Không thể đánh giá");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // RATE BUYER (Seller rates Buyer)
  // ========================================
  const rateBuyerFunc = async (id, rating, review = null) => {
    try {
      setLoading(true);
      setError(null);

      const response = await rateBuyer(id, rating, review);

      // Update in mySales
      setMySales((prev) =>
        prev.map((o) =>
          o._id === id
            ? { ...o, seller_rating: rating, seller_review: review }
            : o
        )
      );

      return response.data;
    } catch (err) {
      console.error("Error rating buyer:", err);
      setError(err.error || "Không thể đánh giá");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // LOAD STATS
  // ========================================
  const loadBuyerStats = async () => {
    if (!user) return;

    try {
      const response = await getOrderStats(user._id, "buyer");
      setBuyerStats(response.data);
    } catch (err) {
      console.error("Error loading buyer stats:", err);
    }
  };

  const loadSellerStats = async () => {
    if (!user) return;

    try {
      const response = await getOrderStats(user._id, "seller");
      setSellerStats(response.data);
    } catch (err) {
      console.error("Error loading seller stats:", err);
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
  // LOAD ORDERS ON USER LOGIN
  // ========================================
  useEffect(() => {
    if (user) {
      loadMyOrders();
      loadMySales();
      loadBuyerStats();
      loadSellerStats();
    }
  }, [user]);

  return (
    <OrderContext.Provider
      value={{
        // State
        myOrders,
        mySales,
        currentOrder,
        buyerStats,
        sellerStats,
        filters,
        pagination,
        loading,
        error,

        // Functions
        loadMyOrders,
        loadMySales,
        loadOrderById,
        placeOrder,
        changeOrderStatus,
        changePaymentStatus,
        cancelOrder: cancelOrderFunc,
        rateSeller: rateSellerFunc,
        rateBuyer: rateBuyerFunc,
        loadBuyerStats,
        loadSellerStats,
        updateFilters,
        resetFilters,

        // Pagination
        goToPage,
        nextPage,
        prevPage,

        // Helpers
        setCurrentOrder,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrder() {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error("useOrder must be used within OrderProvider");
  }
  return context;
}