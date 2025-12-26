// backend/models/Order.js
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
    },

    total_amount: {
      type: Number,
      required: [true, "Tổng tiền là bắt buộc"],
      min: [0, "Tổng tiền không được âm"],
      // total_amount = item_price + shipping_fee + platform_fee
    },

    // ===Shipping Info (Buyer's Choice) ===
    shipping_info: {
      // Phương thức do buyer chọn
      method: {
        type: String,
        enum: ["ghn", "ghtk", "viettel_post", "self_delivery", "meetup"],
        required: [true, "Phương thức vận chuyển là bắt buộc"],
      },

      // Tên đơn vị vận chuyển
      provider_name: String,

      // Mã vận đơn
      tracking_number: String,

      // Thời gian dự kiến
      estimated_delivery: {
        min_days: Number,
        max_days: Number,
      },

      // Địa chỉ lấy hàng (from seller)
      pickup_address: {
        full_name: String,
        phone: String,
        province: String,
        district: String,
        ward: String,
        street: String,
      },

      // Địa chỉ giao hàng (to buyer)
      delivery_address: {
        full_name: String,
        phone: String,
        province: String,
        district: String,
        ward: String,
        street: String,
        location: {
          type: {
            type: String,
            enum: ["Point"],
            default: "Point",
          },
          coordinates: [Number], // [lng, lat]
        },
      },

      // Ghi chú về giao hàng
      delivery_note: String,
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
        "pending_payment",
        "paid",
        "preparing",
        "shipping",
        "delivered",
        "completed",
        "cancelled",
        "refunded",
      ],
      default: "pending_payment",
      index: true,
    },

    // === Status Timestamps ===
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

    // === Meet Up Info ===
    meetup_info: {
      // Nếu shipping_method = "meetup"
      status: {
        type: String,
        enum: ["pending", "proposed", "confirmed", "completed", "cancelled"],
        default: "pending",
      },

      // Địa điểm đề xuất bởi buyer
      buyer_proposal: {
        location_name: String,
        address: String,
        coordinates: {
          lat: Number,
          lng: Number,
        },
        proposed_time: Date,
        note: String,
      },

      // Phản hồi từ seller
      seller_response: {
        accepted: Boolean,
        counter_proposal: {
          location_name: String,
          address: String,
          coordinates: {
            lat: Number,
            lng: Number,
          },
          proposed_time: Date,
          note: String,
        },
        responded_at: Date,
      },

      // Địa điểm cuối cùng (sau khi cả 2 đồng ý)
      confirmed_location: {
        location_name: String,
        address: String,
        coordinates: {
          lat: Number,
          lng: Number,
        },
        meeting_time: Date,
        confirmed_at: Date,
      },

      // Chat/messages giữa buyer và seller
      messages: [
        {
          sender: {
            type: String,
            enum: ["buyer", "seller"],
          },
          message: String,
          created_at: {
            type: Date,
            default: Date.now,
          },
        },
      ],

      // Xác nhận đã gặp
      met_confirmation: {
        buyer_confirmed: {
          type: Boolean,
          default: false,
        },
        buyer_confirmed_at: Date,
        seller_confirmed: {
          type: Boolean,
          default: false,
        },
        seller_confirmed_at: Date,
      },
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

// === Pre-save ===
OrderSchema.pre("save", function () {
  if (!this.order_code) {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomStr = Math.random().toString(36).slice(2, 6).toUpperCase();
    this.order_code = `ORD${dateStr}${randomStr}`;
  }
});

// === Methods ===
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

OrderSchema.methods.cancelOrder = function (reason, cancelledBy) {
  this.order_status = "cancelled";
  this.cancelled_at = new Date();
  this.cancellation_reason = reason;
  this.cancelled_by = cancelledBy;
  return this.save();
};

OrderSchema.methods.rateSeller = function (rating, review = null) {
  if (rating < 1 || rating > 5) {
    throw new Error("Rating phải từ 1-5");
  }
  this.buyer_rating = rating;
  this.buyer_review = review;
  return this.save();
};

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
