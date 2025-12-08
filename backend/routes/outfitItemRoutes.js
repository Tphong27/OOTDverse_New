const express = require("express");
const router = express.Router();
const {
  addItemToOutfit,
  removeItemFromOutfit,
  updateOutfitItem,
  reorderOutfitItems,
  getOutfitItems,
  toggleOptional,
  bulkAddItems,
} = require("../controllers/outfitItemController");

// ========================================
// OUTFIT ITEM MANAGEMENT
// ========================================

// 1. GET /api/outfit-items/outfit/:outfitId - Lấy tất cả items của outfit
router.get("/outfit/:outfitId", getOutfitItems);

// 2. POST /api/outfit-items/outfit/:outfitId - Thêm 1 item vào outfit
//    Body: { item_id, body_position_id, layer_position, display_order, styling_note, is_optional }
router.post("/outfit/:outfitId", addItemToOutfit);

// 3. POST /api/outfit-items/outfit/:outfitId/bulk - Thêm nhiều items cùng lúc
//    Body: { items: [{ item_id, body_position_id, layer_position, display_order, styling_note, is_optional }] }
router.post("/outfit/:outfitId/bulk", bulkAddItems);

// 4. PUT /api/outfit-items/outfit/:outfitId/reorder - Sắp xếp lại thứ tự items
//    Body: { items: [{ item_id, display_order }] }
router.put("/outfit/:outfitId/reorder", reorderOutfitItems);

// 5. PUT /api/outfit-items/:id - Cập nhật 1 outfit item
//    Body: { body_position_id, layer_position, display_order, styling_note, is_optional }
router.put("/:id", updateOutfitItem);

// 6. POST /api/outfit-items/:id/toggle-optional - Toggle optional status
router.post("/:id/toggle-optional", toggleOptional);

// 7. DELETE /api/outfit-items/outfit/:outfitId/item/:itemId - Xóa item khỏi outfit
router.delete("/outfit/:outfitId/item/:itemId", removeItemFromOutfit);

module.exports = router;