const express = require("express");
const router = express.Router();
const {
  getListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
  toggleFavorite,
  boostListing,
  getUserListings,
  getMarketplaceStats,
  searchListings,
} = require("../controllers/marketplaceController");

// Base URL: http://localhost:5000/api/marketplace/listings

// ========================================
// PUBLIC ROUTES (không cần auth)
// ========================================

// 1. GET /api/marketplace/listings - Lấy tất cả listings
//    Query params: listing_type, condition, status, category_id, brand_id, 
//                  color_id, min_price, max_price, seller_id, is_featured,
//                  search, sort_by, page, limit
//    Example: /api/marketplace/listings?status=active&sort_by=price_low&page=1&limit=20
router.get("/", getListings);

// 2. GET /api/marketplace/listings/search - Tìm kiếm listings
//    Query params: q, category, brand, min_price, max_price, condition, page, limit
//    Example: /api/marketplace/listings/search?q=nike&category=Giày&min_price=100000
router.get("/search", searchListings);

// 3. GET /api/marketplace/listings/stats - Thống kê marketplace
//    Response: totalListings, totalSold, totalSwapped, averagePrice, topSellers
router.get("/stats", getMarketplaceStats);

// 4. GET /api/marketplace/listings/user/:userId - Lấy listings của user
//    Query params: status, listing_type, page, limit
//    Example: /api/marketplace/listings/user/123?status=active&page=1
router.get("/user/:userId", getUserListings);

// 5. GET /api/marketplace/listings/:id - Lấy listing chi tiết
//    Query params: increment_view (true/false)
//    Example: /api/marketplace/listings/123?increment_view=true
router.get("/:id", getListingById);

// ========================================
// PROTECTED ROUTES (cần authentication)
// ========================================
// TODO: Thêm middleware xác thực ở đây
// const { authenticate } = require("../middlewares/authMiddleware");
// router.use(authenticate);

// 6. POST /api/marketplace/listings - Tạo listing mới
//    Body: {
//      seller_id, item_id, listing_type, selling_price, condition,
//      condition_note, description, swap_preferences, shipping_method,
//      shipping_fee, shipping_from_location
//    }
router.post("/", createListing);

// 7. PUT /api/marketplace/listings/:id - Cập nhật listing
//    Body: các fields muốn update (listing_type, selling_price, condition, etc.)
router.put("/:id", updateListing);

// 8. DELETE /api/marketplace/listings/:id - Xóa listing (soft delete)
router.delete("/:id", deleteListing);

// 9. POST /api/marketplace/listings/:id/favorite - Toggle favorite
//    Body: { increment: true/false }
router.post("/:id/favorite", toggleFavorite);

// 10. POST /api/marketplace/listings/:id/boost - Boost listing lên top
router.post("/:id/boost", boostListing);

module.exports = router;