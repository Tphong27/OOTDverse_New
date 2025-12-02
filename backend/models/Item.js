const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema(
  {
    // === User Reference ===
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID là bắt buộc"],
    },

    // === Basic Information ===
    item_name: {
      type: String,
      required: [true, "Tên món đồ là bắt buộc"],
      trim: true,
      minlength: [2, "Tên phải có ít nhất 2 ký tự"],
      maxlength: [150, "Tên không được quá 150 ký tự"],
    },

    // === References to Settings ===
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Setting",
      required: [true, "Danh mục là bắt buộc"],
    },

    brand_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Setting",
      default: null,
    },

    color_id: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Setting",
      default: [],
    },

    season_id: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Setting",
      default: [],
    },

    material_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Setting",
      default: null,
    },

    // pattern_id: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Setting",
    //   default: null
    // },

    // condition_id: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Setting",
    //   default: null
    // },

    // === Item Details ===
    size: {
      type: String,
      maxlength: [20, "Size không được quá 20 ký tự"],
    },

    purchase_date: {
      type: Date,
      default: null,
    },

    // purchase_store: {
    //   type: String,
    //   maxlength: [100, 'Tên cửa hàng không được quá 100 ký tự']
    // },

    price: {
      type: Number,
      min: [0, "Giá không được âm"],
      default: null,
    },

    // === Images ===
    image_url: {
      type: String,
      required: [true, "Ảnh chính là bắt buộc"],
      maxlength: [5000000, "URL ảnh không được quá 5MB"], // Tăng lên để chứa base64
    },

    additional_images: {
      type: [String], // Array of image URLs
      default: [],
      validate: {
        validator: function (arr) {
          return arr.length <= 10; // Giới hạn 10 ảnh phụ
        },
        message: "Không được thêm quá 10 ảnh phụ",
      },
    },

    // === Status Flags ===
    is_active: {
      type: Boolean,
      default: true,
    },

    is_favorite: {
      type: Boolean,
      default: false,
    },

    // === Usage Tracking ===
    wear_count: {
      type: Number,
      default: 0,
      min: [0, "Số lần mặc không được âm"],
    },

    last_worn_date: {
      type: Date,
      default: null,
    },

    // === Style Tags ===
    style_tags: {
      type: [String], // ["casual", "streetwear", "formal"]
      default: [],
      validate: {
        validator: function (arr) {
          return arr.length <= 20;
        },
        message: "Không được thêm quá 20 style tags",
      },
    },

    // === AI Features ===
    ai_analyzed: {
      type: Boolean,
      default: false,
    },

    ai_features: {
      type: mongoose.Schema.Types.Mixed, // Flexible JSON object
      default: null,
      // Example: { dominant_color: "#FF0000", pattern: "striped", style: "casual" }
    },

    // === Notes ===
    notes: {
      type: String,
      maxlength: [1000, "Ghi chú không được quá 1000 ký tự"],
    },

    // === Timestamps ===
    added_date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: { createdAt: "added_date", updatedAt: "updated_at" },
  }
);

// === Indexes for Performance ===
ItemSchema.index({ user_id: 1, is_active: 1 });
ItemSchema.index({ user_id: 1, category_id: 1 });
ItemSchema.index({ user_id: 1, is_favorite: 1 });
ItemSchema.index({ category_id: 1, color_id: 1 });
ItemSchema.index({ brand_id: 1 });

// === Virtual for Full Item Info (Populate) ===
ItemSchema.virtual("category", {
  ref: "Setting",
  localField: "category_id",
  foreignField: "_id",
  justOne: true,
});

ItemSchema.virtual("brand", {
  ref: "Setting",
  localField: "brand_id",
  foreignField: "_id",
  justOne: true,
});

ItemSchema.virtual("color", {
  ref: "Setting",
  localField: "color_id",
  foreignField: "_id",
  justOne: true,
});

// === Methods ===
// Increment wear count
ItemSchema.methods.incrementWearCount = function () {
  this.wear_count += 1;
  this.last_worn_date = new Date();
  return this.save();
};

// Toggle favorite
ItemSchema.methods.toggleFavorite = function () {
  this.is_favorite = !this.is_favorite;
  return this.save();
};

module.exports = mongoose.model("Item", ItemSchema);
