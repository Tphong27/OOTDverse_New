// backend/routes/userRoutes.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.post("/register", userController.register);
router.post("/login", userController.login);
// --- THÊM DÒNG NÀY ---
router.post("/google-login", userController.googleLogin);
router.post("/profile", userController.updateProfile); // API cập nhật hồ sơ
router.get("/profile", userController.getProfile); // API lấy hồ sơ

module.exports = router;
