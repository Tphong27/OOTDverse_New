// backend/routes/paymentRoutes.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const {
  createVNPayPayment,
  handleVNPayReturn,
  createMoMoPayment,
  handleMoMoReturn,
  uploadTransferProof,
  getPaymentByOrderId,
  confirmCODPayment,
} = require("../controllers/paymentController");
const { authenticate } = require("../middlewares/authMiddleware");

// Multer config for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/payment-proofs/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `proof-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Chỉ cho phép upload ảnh (jpeg, jpg, png, gif)"));
  },
});

// Base URL: /api/marketplace/payment

// ========================================
// VNPAY ROUTES
// ========================================

// 1. POST /api/marketplace/payment/vnpay/create - Create VNPay payment
router.post("/vnpay/create", authenticate, createVNPayPayment);

// 2. GET /api/marketplace/payment/vnpay/return - VNPay return callback
router.get("/vnpay/return", handleVNPayReturn);

// ========================================
// MOMO ROUTES
// ========================================

// 3. POST /api/marketplace/payment/momo/create - Create MoMo payment
router.post("/momo/create", authenticate, createMoMoPayment);

// 4. GET /api/marketplace/payment/momo/return - MoMo return callback
router.get("/momo/return", handleMoMoReturn);

// 5. POST /api/marketplace/payment/momo/ipn - MoMo IPN callback
router.post("/momo/ipn", handleMoMoReturn);

// ========================================
// BANK TRANSFER ROUTES
// ========================================

// 6. POST /api/marketplace/payment/bank-transfer/:orderId/proof
//    Upload bank transfer proof
router.post(
  "/bank-transfer/:orderId/proof",
  authenticate,
  upload.single("image"),
  uploadTransferProof
);

// ========================================
// GENERAL ROUTES
// ========================================

// 7. GET /api/marketplace/payment/order/:orderId - Get payment by order ID
router.get("/order/:orderId", authenticate, getPaymentByOrderId);

// 8. POST /api/marketplace/payment/cod/:orderId/confirm - Confirm COD payment
router.post("/cod/:orderId/confirm", authenticate, confirmCODPayment);

module.exports = router;