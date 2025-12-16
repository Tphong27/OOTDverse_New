// backend/middlewares/validationMiddleware.js
const { body, param, query, validationResult } = require("express-validator");

// ========================================
// HELPER: Xử lý validation errors
// ========================================
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: "Validation failed",
      details: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

// ========================================
// 1. VALIDATE LISTING
// ========================================
exports.validateCreateListing = [
  body("seller_id")
    .notEmpty()
    .withMessage("Seller ID là bắt buộc")
    .isMongoId()
    .withMessage("Seller ID không hợp lệ"),

  body("item_id")
    .notEmpty()
    .withMessage("Item ID là bắt buộc")
    .isMongoId()
    .withMessage("Item ID không hợp lệ"),

  body("listing_type")
    .notEmpty()
    .withMessage("Listing type là bắt buộc")
    .isIn(["sell", "swap", "both"])
    .withMessage("Listing type phải là sell, swap hoặc both"),

  body("selling_price")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Giá bán phải >= 0"),

  body("condition")
    .notEmpty()
    .withMessage("Tình trạng là bắt buộc")
    .isIn(["new", "like_new", "good", "fair", "worn"])
    .withMessage("Condition phải là: new, like_new, good, fair, worn"),

  body("description")
    .notEmpty()
    .withMessage("Mô tả là bắt buộc")
    .isLength({ min: 10, max: 2000 })
    .withMessage("Mô tả phải từ 10-2000 ký tự"),

  body("shipping_method")
    .optional()
    .isIn(["ghn", "ghtk", "viettel_post", "self_delivery", "meetup"])
    .withMessage("Shipping method không hợp lệ"),

  body("shipping_fee")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Phí ship phải >= 0"),

  handleValidationErrors,
];

exports.validateUpdateListing = [
  param("id").isMongoId().withMessage("Listing ID không hợp lệ"),

  body("selling_price")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Giá bán phải >= 0"),

  body("condition")
    .optional()
    .isIn(["new", "like_new", "good", "fair", "worn"])
    .withMessage("Condition không hợp lệ"),

  body("description")
    .optional()
    .isLength({ min: 10, max: 2000 })
    .withMessage("Mô tả phải từ 10-2000 ký tự"),

  handleValidationErrors,
];

// ========================================
// 2. VALIDATE ORDER
// ========================================
exports.validateCreateOrder = [
  body("buyer_id")
    .notEmpty()
    .withMessage("Buyer ID là bắt buộc")
    .isMongoId()
    .withMessage("Buyer ID không hợp lệ"),

  body("listing_id")
    .notEmpty()
    .withMessage("Listing ID là bắt buộc")
    .isMongoId()
    .withMessage("Listing ID không hợp lệ"),

  body("payment_method")
    .notEmpty()
    .withMessage("Phương thức thanh toán là bắt buộc")
    .isIn(["vnpay", "momo", "cod", "bank_transfer"])
    .withMessage("Payment method không hợp lệ"),

  body("shipping_address.recipient_name")
    .notEmpty()
    .withMessage("Tên người nhận là bắt buộc")
    .isLength({ min: 2, max: 100 })
    .withMessage("Tên người nhận từ 2-100 ký tự"),

  body("shipping_address.phone")
    .notEmpty()
    .withMessage("Số điện thoại là bắt buộc")
    .matches(/^(0|\+84)[0-9]{9,10}$/)
    .withMessage("Số điện thoại không hợp lệ"),

  body("shipping_address.address")
    .notEmpty()
    .withMessage("Địa chỉ là bắt buộc")
    .isLength({ min: 10, max: 200 })
    .withMessage("Địa chỉ từ 10-200 ký tự"),

  handleValidationErrors,
];

exports.validateUpdateOrderStatus = [
  param("id").isMongoId().withMessage("Order ID không hợp lệ"),

  body("status")
    .notEmpty()
    .withMessage("Status là bắt buộc")
    .isIn([
      "pending_payment",
      "paid",
      "preparing",
      "shipping",
      "delivered",
      "completed",
      "cancelled",
      "refunded",
    ])
    .withMessage("Status không hợp lệ"),

  body("tracking_number")
    .optional()
    .isLength({ min: 5, max: 50 })
    .withMessage("Tracking number từ 5-50 ký tự"),

  handleValidationErrors,
];

exports.validateRating = [
  param("id").isMongoId().withMessage("Order ID không hợp lệ"),

  body("rating")
    .notEmpty()
    .withMessage("Rating là bắt buộc")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating phải từ 1-5"),

  body("review")
    .optional()
    .isLength({ max: 1000 })
    .withMessage("Review không quá 1000 ký tự"),

  handleValidationErrors,
];

// ========================================
// 3. VALIDATE SWAP REQUEST
// ========================================
exports.validateCreateSwapRequest = [
  body("requester_id")
    .notEmpty()
    .withMessage("Requester ID là bắt buộc")
    .isMongoId()
    .withMessage("Requester ID không hợp lệ"),

  body("receiver_id")
    .notEmpty()
    .withMessage("Receiver ID là bắt buộc")
    .isMongoId()
    .withMessage("Receiver ID không hợp lệ"),

  body("requester_listing_id")
    .notEmpty()
    .withMessage("Requester listing ID là bắt buộc")
    .isMongoId()
    .withMessage("Requester listing ID không hợp lệ"),

  body("receiver_listing_id")
    .notEmpty()
    .withMessage("Receiver listing ID là bắt buộc")
    .isMongoId()
    .withMessage("Receiver listing ID không hợp lệ"),

  body("requester_message")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Message không quá 500 ký tự"),

  body("requester_address.recipient_name")
    .notEmpty()
    .withMessage("Tên người nhận là bắt buộc"),

  body("requester_address.phone")
    .notEmpty()
    .withMessage("Số điện thoại là bắt buộc")
    .matches(/^(0|\+84)[0-9]{9,10}$/)
    .withMessage("Số điện thoại không hợp lệ"),

  body("requester_address.address")
    .notEmpty()
    .withMessage("Địa chỉ là bắt buộc"),

  handleValidationErrors,
];

exports.validateUpdateShipping = [
  param("id").isMongoId().withMessage("Swap ID không hợp lệ"),

  body("party")
    .notEmpty()
    .withMessage("Party là bắt buộc")
    .isIn(["requester", "receiver"])
    .withMessage("Party phải là requester hoặc receiver"),

  body("shipping_method")
    .notEmpty()
    .withMessage("Shipping method là bắt buộc")
    .isIn(["ghn", "ghtk", "viettel_post", "self_delivery", "meetup"])
    .withMessage("Shipping method không hợp lệ"),

  body("tracking_number")
    .optional()
    .isLength({ min: 5, max: 50 })
    .withMessage("Tracking number từ 5-50 ký tự"),

  handleValidationErrors,
];

// ========================================
// 4. VALIDATE COMMON PARAMS
// ========================================
exports.validateListingId = [
  param("id").isMongoId().withMessage("Listing ID không hợp lệ"),
  handleValidationErrors,
];

exports.validateMongoId = [
  // param("userId").isMongoId().withMessage("ID không hợp lệ"),
  param("id").isMongoId().withMessage("ID không hợp lệ"),
  handleValidationErrors,
];

exports.validateUserId = [
  param("userId").isMongoId().withMessage("User ID không hợp lệ"),
  handleValidationErrors,
];

exports.validatePagination = [
  query("page").optional().isInt({ min: 1 }).withMessage("Page phải >= 1"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit phải từ 1-100"),

  handleValidationErrors,
];

// ========================================
// 5. CUSTOM VALIDATORS
// ========================================
exports.validatePriceRange = [
  query("min_price")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Min price phải >= 0"),

  query("max_price")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Max price phải >= 0")
    .custom((value, { req }) => {
      if (
        req.query.min_price &&
        parseFloat(value) < parseFloat(req.query.min_price)
      ) {
        throw new Error("Max price phải >= Min price");
      }
      return true;
    }),

  handleValidationErrors,
];
