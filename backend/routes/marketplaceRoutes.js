// backend/routes/marketplaceRoutes.js
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

const {
  authenticate,
  optionalAuth,
  checkListingOwnership,
} = require("../middlewares/authMiddleware");
const {
  validateCreateListing,
  validateUpdateListing,
  validateMongoId,
  validatePagination,
  validatePriceRange,
  validateUserId,
} = require("../middlewares/validationMiddleware");

// Base URL: http://localhost:5000/api/marketplace/listings

// ========================================
// PUBLIC ROUTES (không cần auth)
// ========================================

// 1. GET /api/marketplace/listings - Lấy tất cả listings
router.get("/", validatePagination, validatePriceRange, getListings);

// 2. GET /api/marketplace/listings/search - Tìm kiếm listings
router.get("/search", validatePagination, validatePriceRange, searchListings);

// 3. GET /api/marketplace/listings/stats - Thống kê marketplace
router.get("/stats", getMarketplaceStats);

// 4. GET /api/marketplace/listings/user/:userId - Lấy listings của user
router.get("/user/:userId", validateUserId, validatePagination, getUserListings);

// 5. GET /api/marketplace/listings/:id - Lấy listing chi tiết
// router.get("/:id", validateMongoId, getListingById);
router.get("/:id", getListingById);

// ========================================
// PROTECTED ROUTES (cần authentication)
// ========================================

// 6. POST /api/marketplace/listings - Tạo listing mới
router.post("/", authenticate, validateCreateListing, createListing);

// 7. PUT /api/marketplace/listings/:id - Cập nhật listing
router.put(
  "/:id",
  authenticate,
  validateUpdateListing,
  checkListingOwnership,
  updateListing
);

// 8. DELETE /api/marketplace/listings/:id - Xóa listing
router.delete(
  "/:id",
  authenticate,
  validateMongoId,
  checkListingOwnership,
  deleteListing
);

// 9. POST /api/marketplace/listings/:id/favorite - Toggle favorite
router.post("/:id/favorite", authenticate, validateMongoId, toggleFavorite);

// 10. POST /api/marketplace/listings/:id/boost - Boost listing
router.post(
  "/:id/boost",
  authenticate,
  validateMongoId,
  checkListingOwnership,
  boostListing
);

module.exports = router;