const express = require("express");
const router = express.Router();
const {
  createSwapRequest,
  getSwapRequestById,
  getUserSwapRequests,
  acceptSwapRequest,
  rejectSwapRequest,
  cancelSwapRequest,
  updateShipping,
  markDelivered,
  rateSwapPartner,
  getSwapStats,
} = require("../controllers/swapRequestController");

// Base URL: http://localhost:5000/api/marketplace/swap-requests

// ========================================
// PROTECTED ROUTES (tất cả đều cần auth)
// ========================================
// TODO: Thêm middleware xác thực
// const { authenticate } = require("../middlewares/authMiddleware");
// router.use(authenticate);

// 1. POST /api/marketplace/swap-requests - Tạo yêu cầu swap
//    Body: {
//      requester_id, receiver_id,
//      requester_listing_id, receiver_listing_id,
//      requester_message?, requester_address
//    }
//    requester_address: {
//      recipient_name, phone, province, district, ward, address
//    }
router.post("/", createSwapRequest);

// 2. GET /api/marketplace/swap-requests/:id - Lấy swap request chi tiết
//    Response: Thông tin đầy đủ của swap request, 2 bên user, 2 listings
router.get("/:id", getSwapRequestById);

// 3. GET /api/marketplace/swap-requests/user/:userId - Lấy swap requests của user
//    Query params: role (requester/receiver), status, page, limit
//    Example: /api/marketplace/swap-requests/user/123?role=receiver&status=pending
router.get("/user/:userId", getUserSwapRequests);

// 4. GET /api/marketplace/swap-requests/:userId/stats - Thống kê swap
//    Response: totalSwaps, completedSwaps, pendingSwaps, rejectedSwaps
router.get("/:userId/stats", getSwapStats);

// 5. POST /api/marketplace/swap-requests/:id/accept - Chấp nhận swap
//    Body: { receiver_message?, receiver_address }
//    receiver_address: {
//      recipient_name, phone, province, district, ward, address
//    }
//    Chỉ receiver mới có thể accept
router.post("/:id/accept", acceptSwapRequest);

// 6. POST /api/marketplace/swap-requests/:id/reject - Từ chối swap
//    Body: { rejection_reason }
//    Chỉ receiver mới có thể reject
router.post("/:id/reject", rejectSwapRequest);

// 7. POST /api/marketplace/swap-requests/:id/cancel - Hủy swap
//    Chỉ requester mới có thể cancel
//    Chỉ có thể cancel khi status = pending hoặc accepted
router.post("/:id/cancel", cancelSwapRequest);

// 8. PUT /api/marketplace/swap-requests/:id/shipping - Cập nhật thông tin vận chuyển
//    Body: { party, shipping_method, tracking_number }
//    party: requester | receiver
//    shipping_method: ghn | ghtk | viettel_post | self_delivery | meetup
//    Khi cả 2 bên đều shipped → status = in_progress
router.put("/:id/shipping", updateShipping);

// 9. POST /api/marketplace/swap-requests/:id/delivered - Xác nhận đã nhận hàng
//    Body: { party }
//    party: requester | receiver
//    Khi cả 2 bên đều delivered → status = completed
router.post("/:id/delivered", markDelivered);

// 10. POST /api/marketplace/swap-requests/:id/rate - Đánh giá đối tác swap
//    Body: { party, rating, review? }
//    party: requester | receiver
//    rating: 1-5
//    Chỉ có thể rate khi status = completed
router.post("/:id/rate", rateSwapPartner);

module.exports = router;