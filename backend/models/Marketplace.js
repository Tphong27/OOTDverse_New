// backend/models/Marketplace.js
const mongoose = require("mongoose");

const MarketplaceListingSchema = new mongoose.Schema(
  {
    // === References ===
    seller_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Seller ID là bắt buộc"],
      index: true,
    },

    item_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: [true, "Item ID là bắt buộc"],
    },

    // === Listing Type ===
    listing_type: {
      type: String,
      enum: ["sell", "swap", "both"],
      default: "sell",
      // sell: chỉ bán, swap: chỉ đổi, both: cả 2
    },

    // === Pricing ===
    original_price: {
      type: Number,
      min: [0, "Giá gốc không được âm"],
      default: null,
      // Giá mua ban đầu (từ Item model)
    },

    selling_price: {
      type: Number,
      required: function() {
        return this.listing_type === "sell" || this.listing_type === "both";
      },
      min: [0, "Giá bán không được âm"],
    },

    // === Condition & Details ===
    condition: {
      type: String,
      enum: ["new", "like_new", "good", "fair", "worn"],
      required: [true, "Tình trạng là bắt buộc"],
      // new: Mới 100%, like_new: 95-99%, good: 80-94%, fair: 60-79%, worn: <60%
    },

    condition_note: {
      type: String,
      maxlength: [500, "Ghi chú tình trạng không quá 500 ký tự"],
      default: null,
    },

    description: {
      type: String,
      maxlength: [2000, "Mô tả không quá 2000 ký tự"],
      required: [true, "Mô tả là bắt buộc"],
    },

    // === Swap Preferences (nếu listing_type = swap hoặc both) ===
    swap_preferences: {
      categories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Setting",
      }],
      brands: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Setting",
      }],
      sizes: [String],
      note: {
        type: String,
        maxlength: [500, "Ghi chú swap không quá 500 ký tự"],
      },
    },

    // === Shipping ===
    shipping_method: {
      type: String,
      enum: ["ghn", "ghtk", "viettel_post", "self_delivery", "meetup"],
      default: "ghn",
    },

    shipping_fee: {
      type: Number,
      min: [0, "Phí ship không được âm"],
      default: 0,
    },

    shipping_from_location: {
      province: String,
      district: String,
      ward: String,
      address: String,
    },

    // === Status ===
    status: {
      type: String,
      enum: ["active", "sold", "swapped", "pending", "inactive"],
      default: "active",
      index: true,
    },

    // === Engagement Metrics ===
    view_count: {
      type: Number,
      default: 0,
      min: [0, "View count không được âm"],
    },

    favorite_count: {
      type: Number,
      default: 0,
      min: [0, "Favorite count không được âm"],
    },

    inquiry_count: {
      type: Number,
      default: 0,
      min: [0, "Inquiry count không được âm"],
    },

    // === Boost & Featured ===
    is_featured: {
      type: Boolean,
      default: false,
    },

    featured_until: {
      type: Date,
      default: null,
    },

    boost_count: {
      type: Number,
      default: 0,
      // Số lần boost (đẩy tin lên top)
    },

    last_boosted_at: {
      type: Date,
      default: null,
    },

    // === Moderation ===
    is_approved: {
      type: Boolean,
      default: true, // Auto-approve, admin review later
    },

    rejection_reason: {
      type: String,
      default: null,
    },

    // === Timestamps ===
    listed_at: {
      type: Date,
      default: Date.now,
    },

    sold_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: { createdAt: "listed_at", updatedAt: "updated_at" },
  }
);

// === Indexes ===
MarketplaceListingSchema.index({ status: 1, listed_at: -1 });
MarketplaceListingSchema.index({ seller_id: 1, status: 1 });
MarketplaceListingSchema.index({ listing_type: 1, status: 1 });
MarketplaceListingSchema.index({ selling_price: 1 });
MarketplaceListingSchema.index({ is_featured: 1, last_boosted_at: -1 });

// === Pre-save: Validation ===
MarketplaceListingSchema.pre("save", function(next) {
  // Nếu listing_type = swap thì selling_price không bắt buộc
  if (this.listing_type === "swap") {
    this.selling_price = undefined;
  }
  
  // Nếu sold/swapped thì set sold_at
  if ((this.status === "sold" || this.status === "swapped") && !this.sold_at) {
    this.sold_at = new Date();
  }
  
  next();
});

// === Methods ===
// Increment view count
MarketplaceListingSchema.methods.incrementView = function() {
  this.view_count += 1;
  return this.save();
};

// Increment favorite count
MarketplaceListingSchema.methods.toggleFavorite = function(increment = true) {
  this.favorite_count += increment ? 1 : -1;
  if (this.favorite_count < 0) this.favorite_count = 0;
  return this.save();
};

// Increment inquiry count
MarketplaceListingSchema.methods.incrementInquiry = function() {
  this.inquiry_count += 1;
  return this.save();
};

// Boost listing (đẩy lên top)
MarketplaceListingSchema.methods.boost = function() {
  this.boost_count += 1;
  this.last_boosted_at = new Date();
  return this.save();
};

// Mark as sold
MarketplaceListingSchema.methods.markAsSold = function() {
  this.status = "sold";
  this.sold_at = new Date();
  return this.save();
};

// Mark as swapped
MarketplaceListingSchema.methods.markAsSwapped = function() {
  this.status = "swapped";
  this.sold_at = new Date();
  return this.save();
};

// Virtuals
MarketplaceListingSchema.virtual("seller", {
  ref: "User",
  localField: "seller_id",
  foreignField: "_id",
  justOne: true,
});

MarketplaceListingSchema.virtual("item", {
  ref: "Item",
  localField: "item_id",
  foreignField: "_id",
  justOne: true,
});

MarketplaceListingSchema.set("toJSON", { virtuals: true });
MarketplaceListingSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Marketplace", MarketplaceListingSchema);