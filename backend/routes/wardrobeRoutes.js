// backend/routes/wardrobeRoutes.js
const express = require("express");
const router = express.Router();
const {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  toggleFavorite,
  incrementWearCount,
  getStatistics,
  analyzeImage,
} = require("../controllers/wardrobeController");

// GET /api/wardrobe - Lấy danh sách tất cả items của user
// Query params: ?userId=xxx
router.get("/", getItems);

// GET /api/wardrobe/statistics - Thống kê tủ đồ
// Query params: ?userId=xxx
router.get("/statistics", getStatistics);

// POST /api/wardrobe/analyze - Phân tích ảnh bằng AI
router.post("/analyze", analyzeImage);

// GET /api/wardrobe/:id - Lấy chi tiết 1 item
// Query params: ?userId=xxx
router.get("/:id", getItemById);

// POST /api/wardrobe - Tạo item mới
// Body: { userId, item_name, category_id, image_url, ... }
router.post("/", createItem);

// PUT /api/wardrobe/:id - Cập nhật item
// Body: { userId, item_name, price, ... }
router.put("/:id", updateItem);

// DELETE /api/wardrobe/:id - Xóa item (soft delete)
// Query params: ?userId=xxx
router.delete("/:id", deleteItem);

// PATCH /api/wardrobe/:id/favorite - Toggle favorite
// Body: { userId }
router.patch("/:id/favorite", toggleFavorite);

// PATCH /api/wardrobe/:id/wear - Tăng wear count
// Body: { userId }
router.patch("/:id/wear", incrementWearCount);

module.exports = router;
