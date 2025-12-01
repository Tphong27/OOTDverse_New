const express = require("express");
const router = express.Router();
const {
  getSettings,
  getSettingsByType,
  getSettingById,
  createSetting,
  updateSetting,
  deleteSetting,
  permanentDeleteSetting,
  getSettingTypes,
  getTypesWithCount
} = require("../controllers/settingController");

// Base URL: http://localhost:5000/api/setting

// 1. GET /api/setting - Lấy tất cả settings
//    VD: /api/settings?type=brand&status=Active
router.get("/", getSettings);

// 2. GET /api/setting/types - Lấy danh sách các type có sẵn
router.get("/types", getSettingTypes);

// 3. GET /api/setting/types-with-count - Lấy types với count (MỚI)
//PHẢI ĐẶT TRƯỚC /:id để tránh conflict
router.get("/types-with-count", getTypesWithCount);

// 4. GET /api/setting/type/:type - Lấy settings theo type cụ thể
router.get("/type/:type", getSettingsByType);

// 5. GET /api/setting/:id - Lấy 1 setting theo ID
router.get("/:id", getSettingById);

// 6. POST /api/setting - Tạo setting mới
router.post("/", createSetting);

// 7. PUT /api/setting/:id - Cập nhật setting
//    Body: { name, type, priority, value, description, status }
router.put("/:id", updateSetting);

// 8. DELETE /api/setting/:id - Xóa mềm (chuyển status thành Inactive)
router.delete("/:id", deleteSetting);

// 9. DELETE /api/setting/:id/permanent - Xóa vĩnh viễn
router.delete("/:id/permanent", permanentDeleteSetting);

module.exports = router;