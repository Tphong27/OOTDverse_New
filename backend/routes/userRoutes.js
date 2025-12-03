// backend/routes/userRoutes.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.post("/register", userController.register);
router.post("/login", userController.login);
router.post("/google-login", userController.googleLogin);
router.post("/profile", userController.updateProfile);
router.get("/profile", userController.getProfile);
router.post("/changePass", userController.changePassword); // Đổi mật khẩu

router.get("/all", userController.getAllUsers);              // Lấy danh sách users
router.get("/:id", userController.getUserById);              // Lấy chi tiết 1 user
router.put("/:id/role", userController.updateUserRole);      // Cập nhật role
router.put("/:id/status", userController.updateUserStatus);  // Cập nhật status
router.put("/:id/info", userController.updateUserInfo);      // Cập nhật thông tin
router.delete("/:id", userController.deleteUser);            // Xóa (soft delete)

module.exports = router;
