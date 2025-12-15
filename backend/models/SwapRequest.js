const mongoose = require("mongoose");

const SwapRequestSchema = new mongoose.Schema(
  {
    // === Request Info ===
    swap_code: {
      type: String,
      unique: true,
      required: true,
      // Format: SWAP20250101ABCD
    },

    // === Parties ===
    requester_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Requester ID là bắt buộc"],
    },

    receiver_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Receiver ID là bắt buộc"],
    },

    // === Items ===
    requester_listing_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MarketplaceListing",
      required: [true, "Requester listing là bắt buộc"],
    },

    requester_item_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: [true, "Requester item là bắt buộc"],
    },

    receiver_listing_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MarketplaceListing",
      required: [true, "Receiver listing là bắt buộc"],
    },

    receiver_item_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: [true, "Receiver item là bắt buộc"],
    },

    // === Status ===
    status: {
      type: String,
      enum: [
        "pending",
        "accepted",
        "in_progress",
        "completed",
        "rejected",
        "cancelled",
        "expired",
      ],
      default: "pending",
    },

    // === Messages ===
    requester_message: {
      type: String,
      maxlength: [500, "Tin nhắn không quá 500 ký tự"],
      default: null,
    },

    receiver_message: {
      type: String,
      maxlength: [500, "Tin nhắn không quá 500 ký tự"],
      default: null,
    },

    rejection_reason: {
      type: String,
      maxlength: [500, "Lý do từ chối không quá 500 ký tự"],
      default: null,
    },

    // === Shipping Info ===
    requester_shipping: {
      method: {
        type: String,
        enum: ["ghn", "ghtk", "viettel_post", "self_delivery", "meetup"],
        default: null,
      },
      tracking_number: String,
      shipped_at: Date,
      delivered_at: Date,
    },

    receiver_shipping: {
      method: {
        type: String,
        enum: ["ghn", "ghtk", "viettel_post", "self_delivery", "meetup"],
        default: null,
      },
      tracking_number: String,
      shipped_at: Date,
      delivered_at: Date,
    },

    // === Shipping Addresses ===
    requester_address: {
      recipient_name: String,
      phone: String,
      province: String,
      district: String,
      ward: String,
      address: String,
    },

    receiver_address: {
      recipient_name: String,
      phone: String,
      province: String,
      district: String,
      ward: String,
      address: String,
    },

    // === Rating & Review ===
    requester_rating: {
      type: Number,
      min: [1, "Rating từ 1-5"],
      max: [5, "Rating từ 1-5"],
      default: null,
    },

    requester_review: {
      type: String,
      maxlength: [1000, "Review không quá 1000 ký tự"],
      default: null,
    },

    receiver_rating: {
      type: Number,
      min: [1, "Rating từ 1-5"],
      max: [5, "Rating từ 1-5"],
      default: null,
    },

    receiver_review: {
      type: String,
      maxlength: [1000, "Review không quá 1000 ký tự"],
      default: null,
    },

    // === Timestamps ===
    requested_at: {
      type: Date,
      default: Date.now,
    },

    responded_at: {
      type: Date,
      default: null,
    },

    completed_at: {
      type: Date,
      default: null,
    },

    expires_at: {
      type: Date,
      default: function() {
        return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      },
    },
  },
  {
    timestamps: { createdAt: "requested_at", updatedAt: "updated_at" },
  }
);

// === Indexes ===
// ❌ BỎ dòng này vì đã có unique: true ở trên
// SwapRequestSchema.index({ swap_code: 1 }, { unique: true });

SwapRequestSchema.index({ requester_id: 1, status: 1 });
SwapRequestSchema.index({ receiver_id: 1, status: 1 });
SwapRequestSchema.index({ status: 1, expires_at: 1 });

// === Pre-save: Generate swap_code ===
SwapRequestSchema.pre("save", function(next) {
  if (!this.swap_code) {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
    const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.swap_code = `SWAP${dateStr}${randomStr}`;
  }
  next();
});

// === Methods ===
SwapRequestSchema.methods.accept = function(message = null) {
  this.status = "accepted";
  this.responded_at = new Date();
  if (message) {
    this.receiver_message = message;
  }
  return this.save();
};

SwapRequestSchema.methods.reject = function(reason) {
  this.status = "rejected";
  this.responded_at = new Date();
  this.rejection_reason = reason;
  return this.save();
};

SwapRequestSchema.methods.cancel = function() {
  this.status = "cancelled";
  return this.save();
};

SwapRequestSchema.methods.updateShipping = function(party, shippingData) {
  if (party === "requester") {
    this.requester_shipping = {
      ...this.requester_shipping,
      ...shippingData,
    };
  } else if (party === "receiver") {
    this.receiver_shipping = {
      ...this.receiver_shipping,
      ...shippingData,
    };
  }
  
  if (
    this.requester_shipping?.shipped_at &&
    this.receiver_shipping?.shipped_at
  ) {
    this.status = "in_progress";
  }
  
  return this.save();
};

SwapRequestSchema.methods.markDelivered = function(party) {
  if (party === "requester") {
    this.requester_shipping.delivered_at = new Date();
  } else if (party === "receiver") {
    this.receiver_shipping.delivered_at = new Date();
  }
  
  if (
    this.requester_shipping?.delivered_at &&
    this.receiver_shipping?.delivered_at
  ) {
    this.status = "completed";
    this.completed_at = new Date();
  }
  
  return this.save();
};

SwapRequestSchema.methods.rate = function(party, rating, review = null) {
  if (rating < 1 || rating > 5) {
    throw new Error("Rating phải từ 1-5");
  }
  
  if (party === "requester") {
    this.requester_rating = rating;
    this.requester_review = review;
  } else if (party === "receiver") {
    this.receiver_rating = rating;
    this.receiver_review = review;
  }
  
  return this.save();
};

SwapRequestSchema.methods.checkExpired = function() {
  if (this.status === "pending" && new Date() > this.expires_at) {
    this.status = "expired";
    return this.save();
  }
  return this;
};

// Virtuals
SwapRequestSchema.virtual("requester", {
  ref: "User",
  localField: "requester_id",
  foreignField: "_id",
  justOne: true,
});

SwapRequestSchema.virtual("receiver", {
  ref: "User",
  localField: "receiver_id",
  foreignField: "_id",
  justOne: true,
});

SwapRequestSchema.virtual("requester_listing", {
  ref: "MarketplaceListing",
  localField: "requester_listing_id",
  foreignField: "_id",
  justOne: true,
});

SwapRequestSchema.virtual("receiver_listing", {
  ref: "MarketplaceListing",
  localField: "receiver_listing_id",
  foreignField: "_id",
  justOne: true,
});

SwapRequestSchema.set("toJSON", { virtuals: true });
SwapRequestSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("SwapRequest", SwapRequestSchema);