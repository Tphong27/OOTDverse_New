const express = require("express");
const router = express.Router();
const {
  getOutfits,
  getOutfitById,
  createOutfit,
  updateOutfit,
  deleteOutfit,
  toggleLike,
  toggleSave,
  recordWear,
  updateRating,
  getUserOutfits,
  getOutfitsByItem,
  getOutfitStats,
} = require("../controllers/outfitController");

// ========================================
// OUTFIT CRUD OPERATIONS
// ========================================

// 1. GET /api/outfits - Lấy danh sách outfits
//    Query params: user_id, style_id, occasion_id, season_id, weather_id, 
//                  is_public, is_featured, ai_suggested, min_rating, 
//                  sort_by (popular/rating/recent_worn), page, limit
router.get("/", getOutfits);

// 2. GET /api/outfits/user/:userId - Lấy outfits của 1 user cụ thể
//    Query params: is_public, page, limit
router.get("/user/:userId", getUserOutfits);

// 3. GET /api/outfits/item/:itemId - Lấy outfits chứa item cụ thể
router.get("/item/:itemId", getOutfitsByItem);

// 4. GET /api/outfits/stats/:userId - Lấy thống kê outfits của user
router.get("/stats/:userId", getOutfitStats);

// 5. GET /api/outfits/:id - Lấy chi tiết 1 outfit
//    Query params: increment_view (true/false)
router.get("/:id", getOutfitById);

// 6. POST /api/outfits - Tạo outfit mới
//    Body: { user_id, outfit_name, style_id, occasion_id, season_id, weather_id,
//            is_public, thumbnail_url, full_image_url, tags, description, notes,
//            items: [{ item_id, body_position_id, layer_position, display_order, styling_note, is_optional }] }
router.post("/", createOutfit);

// 7. PUT /api/outfits/:id - Cập nhật outfit
//    Body: { outfit_name, style_id, occasion_id, season_id, weather_id,
//            is_public, is_featured, thumbnail_url, full_image_url, tags, 
//            description, notes, user_rating, items (optional) }
router.put("/:id", updateOutfit);

// 8. DELETE /api/outfits/:id - Xóa outfit
router.delete("/:id", deleteOutfit);

// ========================================
// OUTFIT INTERACTIONS
// ========================================

// 9. POST /api/outfits/:id/like - Toggle like outfit
//    Body: { increment: true/false }
router.post("/:id/like", toggleLike);

// 10. POST /api/outfits/:id/save - Toggle save outfit
//     Body: { increment: true/false }
router.post("/:id/save", toggleSave);

// 11. POST /api/outfits/:id/wear - Ghi nhận mặc outfit
router.post("/:id/wear", recordWear);

// 12. POST /api/outfits/:id/rating - Cập nhật rating outfit
//     Body: { rating: 1-5 }
router.post("/:id/rating", updateRating);

module.exports = router;