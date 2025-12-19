// backend/routes/addressRoutes.js
const express = require("express");
const router = express.Router();
const addressController = require("../controllers/addressController");
const { authenticate } = require("../middlewares/authMiddleware");

router.use(authenticate);

router.post("/", addressController.createAddress);
router.get("/", addressController.getMyAddresses);
router.get("/default", addressController.getDefaultAddress);
router.put("/:addressId/default", addressController.setDefaultAddress);

module.exports = router;
