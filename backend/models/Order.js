const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    // === Order Info ===
    order_code: {
      type: String,
      unique: true,
      required: true,
      // Format: ORD20250101ABCD
    },

    // === References ===
    buyer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Buyer ID là bắt buộc"],
      index: true,
    },

    seller_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Seller ID là bắt buộc"],
      index: true,
    },

    listing_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Marketplace",
      required: [true, "Listing ID là bắt buộc"],
      index: true,
    },

    item_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: [true, "Item ID là bắt buộc"],
    },

    // === Pricing ===
    item_price: {
      type: Number,
      required: [true, "Giá item là bắt buộc"],
      min: [0, "Giá không được âm"],
    },

    shipping_fee: {
      type: Number,
      default: 0,
      min: [0, "Phí ship không được âm"],
    },

    platform_fee: {
      type: Number,
      default: 0,
      min: [0, "Phí platform không được âm"],
      // VD: 5% của item_price
    },

    total_amount: {
      type: Number,
      required: [true, "Tổng tiền là bắt buộc"],
      min: [0, "Tổng tiền không được âm"],
      // total_amount = item_price + shipping_fee + platform_fee
    },

    // === Shipping Info ===
    shipping_method: {
      type: String,
      enum: ["ghn", "ghtk", "viettel_post", "self_delivery", "meetup"],
      required: [true, "Phương thức vận chuyển là bắt buộc"],
    },

    shipping_address: {
      recipient_name: {
        type: String,
        required: [true, "Tên người nhận là bắt buộc"],
      },
      phone: {
        type: String,
        required: [true, "Số điện thoại là bắt buộc"],
      },
      province: String,
      district: String,
      ward: String,
      address: {
        type: String,
        required: [true, "Địa chỉ là bắt buộc"],
      },
    },

    tracking_number: {
      type: String,
      default: null,
      // Mã vận đơn từ GHN/GHTK
    },

    // === Payment ===
    payment_method: {
      type: String,
      enum: ["vnpay", "momo", "cod", "bank_transfer"],
      required: [true, "Phương thức thanh toán là bắt buộc"],
    },

    payment_status: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
      index: true,
    },

    payment_transaction_id: {
      type: String,
      default: null,
    },

    paid_at: {
      type: Date,
      default: null,
    },

    // === Order Status ===
    order_status: {
      type: String,
      enum: [
        "pending_payment", // Chờ thanh toán
        "paid", // Đã thanh toán
        "preparing", // Đang chuẩn bị hàng
        "shipping", // Đang vận chuyển
        "delivered", // Đã giao hàng
        "completed", // Hoàn thành (buyer confirm)
        "cancelled", // Đã hủy
        "refunded", // Đã hoàn tiền
      ],
      default: "pending_payment",
      index: true,
    },

    // === Status Timestamps ===
    paid_at: { type: Date, default: null },
    preparing_at: { type: Date, default: null },
    shipping_at: { type: Date, default: null },
    delivered_at: { type: Date, default: null },
    completed_at: { type: Date, default: null },
    cancelled_at: { type: Date, default: null },

    // === Cancellation ===
    cancellation_reason: {
      type: String,
      default: null,
    },

    cancelled_by: {
      type: String,
      enum: ["buyer", "seller", "admin", null],
      default: null,
    },

    // === Rating & Review ===
    buyer_rating: {
      type: Number,
      min: [1, "Rating từ 1-5"],
      max: [5, "Rating từ 1-5"],
      default: null,
    },

    buyer_review: {
      type: String,
      maxlength: [1000, "Review không quá 1000 ký tự"],
      default: null,
    },

    seller_rating: {
      type: Number,
      min: [1, "Rating từ 1-5"],
      max: [5, "Rating từ 1-5"],
      default: null,
    },

    seller_review: {
      type: String,
      maxlength: [1000, "Review không quá 1000 ký tự"],
      default: null,
    },

    // === Notes ===
    buyer_note: {
      type: String,
      maxlength: [500, "Ghi chú không quá 500 ký tự"],
      default: null,
    },

    seller_note: {
      type: String,
      maxlength: [500, "Ghi chú không quá 500 ký tự"],
      default: null,
    },

    // === Timestamps ===
    created_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

// === Indexes ===
OrderSchema.index({ buyer_id: 1, order_status: 1 });
OrderSchema.index({ seller_id: 1, order_status: 1 });
OrderSchema.index({ payment_status: 1, order_status: 1 });
OrderSchema.index({ created_at: -1 });

// === Pre-save: Generate order_code ===
OrderSchema.pre("save", function () {
  if (!this.order_code) {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomStr = Math.random().toString(36).slice(2, 6).toUpperCase();

    this.order_code = `ORD${dateStr}${randomStr}`;
  }
});

// === Methods ===
// Update order status
OrderSchema.methods.updateStatus = function (newStatus) {
  this.order_status = newStatus;

  const timestampMap = {
    paid: "paid_at",
    preparing: "preparing_at",
    shipping: "shipping_at",
    delivered: "delivered_at",
    completed: "completed_at",
    cancelled: "cancelled_at",
  };

  if (timestampMap[newStatus]) {
    this[timestampMap[newStatus]] = new Date();
  }

  return this.save();
};

// Update payment status
OrderSchema.methods.updatePaymentStatus = function (
  status,
  transactionId = null
) {
  this.payment_status = status;
  if (transactionId) {
    this.payment_transaction_id = transactionId;
  }
  if (status === "paid") {
    this.paid_at = new Date();
    this.order_status = "paid";
  }
  return this.save();
};

// Cancel order
OrderSchema.methods.cancelOrder = function (reason, cancelledBy) {
  this.order_status = "cancelled";
  this.cancelled_at = new Date();
  this.cancellation_reason = reason;
  this.cancelled_by = cancelledBy;
  return this.save();
};

// Add buyer rating
OrderSchema.methods.rateSeller = function (rating, review = null) {
  if (rating < 1 || rating > 5) {
    throw new Error("Rating phải từ 1-5");
  }
  this.buyer_rating = rating;
  this.buyer_review = review;
  return this.save();
};

// Add seller rating
OrderSchema.methods.rateBuyer = function (rating, review = null) {
  if (rating < 1 || rating > 5) {
    throw new Error("Rating phải từ 1-5");
  }
  this.seller_rating = rating;
  this.seller_review = review;
  return this.save();
};

// Virtuals
OrderSchema.virtual("buyer", {
  ref: "User",
  localField: "buyer_id",
  foreignField: "_id",
  justOne: true,
});

OrderSchema.virtual("seller", {
  ref: "User",
  localField: "seller_id",
  foreignField: "_id",
  justOne: true,
});

OrderSchema.virtual("listing", {
  ref: "Marketplace",
  localField: "listing_id",
  foreignField: "_id",
  justOne: true,
});

OrderSchema.virtual("item", {
  ref: "Item",
  localField: "item_id",
  foreignField: "_id",
  justOne: true,
});

OrderSchema.set("toJSON", { virtuals: true });
OrderSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Order", OrderSchema);
