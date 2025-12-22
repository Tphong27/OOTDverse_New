const express = require("express");
const router = express.Router();
const {
  createOrder,
  getOrderById,
  getUserOrders,
  updateOrderStatus,
  updatePaymentStatus,
  cancelOrder,
  rateSeller,
  rateBuyer,
  getOrderStats,
} = require("../controllers/orderController");
const { authenticate, checkOrderAccess } = require("../middlewares/authMiddleware");

// Base URL: http://localhost:5000/api/marketplace/orders

// ========================================
// PROTECTED ROUTES (tất cả đều cần auth)
// ========================================
router.use(authenticate);

// 1. POST /api/marketplace/orders - Tạo đơn hàng mới
//    Body: {
//      buyer_id, listing_id, shipping_address, 
//      shipping_method, payment_method, buyer_note
//    }
//    shipping_address: addressObjectId
router.post("/", createOrder);

// 2. GET /api/marketplace/orders/:id - Lấy order chi tiết
//    Response: Thông tin đầy đủ của order, buyer, seller, item
router.get("/:id", checkOrderAccess, getOrderById);

// 3. GET /api/marketplace/orders/user/:userId - Lấy orders của user
//    Query params: role (buyer/seller), status, page, limit
//    Example: /api/marketplace/orders/user/123?role=buyer&status=completed&page=1
router.get("/user/:userId", getUserOrders);

// 4. GET /api/marketplace/orders/:userId/stats - Thống kê orders
//    Query params: role (buyer/seller)
//    Response: totalOrders, completedOrders, cancelledOrders, 
//              totalRevenue, averageOrderValue
router.get("/:userId/stats", getOrderStats);

// 5. PUT /api/marketplace/orders/:id/status - Cập nhật trạng thái order
//    Body: { status, tracking_number? }
//    Status flow: pending_payment → paid → preparing → shipping → delivered → completed
//    Chỉ seller có thể update status (trừ completed - do buyer)
router.put("/:id/status", checkOrderAccess, updateOrderStatus);

// 6. PUT /api/marketplace/orders/:id/payment - Cập nhật trạng thái thanh toán
//    Body: { payment_status, transaction_id? }
//    payment_status: pending | paid | failed | refunded
//    Được gọi từ payment gateway callback
router.put("/:id/payment", checkOrderAccess, updatePaymentStatus);

// 7. POST /api/marketplace/orders/:id/cancel - Hủy đơn hàng
//    Body: { reason, cancelled_by }
//    cancelled_by: buyer | seller | admin
//    Chỉ có thể cancel khi status <= preparing
router.post("/:id/cancel", checkOrderAccess, cancelOrder);

// 8. POST /api/marketplace/orders/:id/rate-seller - Buyer đánh giá seller
//    Body: { rating, review? }
//    rating: 1-5
//    Chỉ có thể rate khi order status = completed
router.post("/:id/rate-seller", checkOrderAccess, rateSeller);

// 9. POST /api/marketplace/orders/:id/rate-buyer - Seller đánh giá buyer
//    Body: { rating, review? }
//    rating: 1-5
//    Chỉ có thể rate khi order status = completed
router.post("/:id/rate-buyer", checkOrderAccess, rateBuyer);

module.exports = router;