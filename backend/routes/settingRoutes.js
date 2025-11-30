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
  getSettingTypes
} = require("../controllers/settingController");

// Base URL: http://localhost:5000/api/setting

// 1. GET /api/setting - Lấy tất cả settings
//    VD: /api/settings?type=brand&status=Active
router.get("/", getSettings);

// 2. GET /api/setting/types - Lấy danh sách các type có sẵn
router.get("/types", getSettingTypes);

// 3. GET /api/setting/type/:type - Lấy settings theo type cụ thể
router.get("/type/:type", getSettingsByType);

// 4. GET /api/setting/:id - Lấy 1 setting theo ID
router.get("/:id", getSettingById);

// 5. POST /api/setting - Tạo setting mới
router.post("/", createSetting);

// 6. PUT /api/setting/:id - Cập nhật setting
//    Body: { name, type, priority, value, description, status }
router.put("/:id", updateSetting);

// 7. DELETE /api/setting/:id - Xóa mềm (chuyển status thành Inactive)
router.delete("/:id", deleteSetting);

// 8. DELETE /api/setting/:id/permanent - Xóa vĩnh viễn
router.delete("/:id/permanent", permanentDeleteSetting);

module.exports = router;