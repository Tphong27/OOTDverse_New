const mongoose = require("mongoose");

const OutfitSchema = new mongoose.Schema(
  {
    // === User Reference ===
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID là bắt buộc"],
      index: true,
    },

    // === Basic Information ===
    outfit_name: {
      type: String,
      required: [true, "Tên outfit là bắt buộc"],
      trim: true,
      minlength: [2, "Tên phải có ít nhất 2 ký tự"],
      maxlength: [150, "Tên không được quá 150 ký tự"],
    },

    // === References to Settings ===
    style_id: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Setting",
      default: [],
    },

    occasion_id: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Setting",
      default: [],
    },

    season_id: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Setting",
      default: [],
    },

    weather_id: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Setting",
      default: [],
    },

    // === Visibility & Features ===
    is_public: {
      type: Boolean,
      default: true,
    },

    is_featured: {
      type: Boolean,
      default: false,
    },

    // === Images ===
    thumbnail_url: {
      type: String,
      maxlength: [5000000, "URL ảnh không được quá 5MB"],
      default: null,
    },

    full_image_url: {
      type: String,
      maxlength: [5000000, "URL ảnh không được quá 5MB"],
      default: null,
    },

    // === Engagement Metrics ===
    view_count: {
      type: Number,
      default: 0,
      min: [0, "View count không được âm"],
    },

    like_count: {
      type: Number,
      default: 0,
      min: [0, "Like count không được âm"],
    },

    save_count: {
      type: Number,
      default: 0,
      min: [0, "Save count không được âm"],
    },

    wear_count: {
      type: Number,
      default: 0,
      min: [0, "Wear count không được âm"],
    },

    last_worn_date: {
      type: Date,
      default: null,
    },

    // === AI Features ===
    ai_suggested: {
      type: Boolean,
      default: false,
    },

    ai_confidence_score: {
      type: Number,
      min: [0, "Confidence score phải từ 0-1"],
      max: [1, "Confidence score phải từ 0-1"],
      default: null,
    },

    user_rating: {
      type: Number,
      min: [1, "Rating phải từ 1-5"],
      max: [5, "Rating phải từ 1-5"],
      default: null,
    },

    color_harmony_score: {
      type: Number,
      min: [0, "Score phải từ 0-1"],
      max: [1, "Score phải từ 0-1"],
      default: null,
    },

    style_consistency_score: {
      type: Number,
      min: [0, "Score phải từ 0-1"],
      max: [1, "Score phải từ 0-1"],
      default: null,
    },

    // === Tags & Notes ===
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: function (arr) {
          return arr.length <= 20;
        },
        message: "Không được thêm quá 20 tags",
      },
    },

    description: {
      type: String,
      maxlength: [1000, "Mô tả không được quá 1000 ký tự"],
      default: null,
    },

    notes: {
      type: String,
      maxlength: [1000, "Ghi chú không được quá 1000 ký tự"],
      default: null,
    },

    // === Timestamps ===
    created_date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: { createdAt: "created_date", updatedAt: "updated_at" },
  }
);

// === Indexes for Performance ===
OutfitSchema.index({ user_id: 1, is_public: 1 });
OutfitSchema.index({ user_id: 1, created_date: -1 });
OutfitSchema.index({ style_id: 1 });
OutfitSchema.index({ occasion_id: 1 });
OutfitSchema.index({ season_id: 1 });
OutfitSchema.index({ user_rating: -1 });
OutfitSchema.index({ view_count: -1, like_count: -1 }); // For popularity sorting

// === Virtuals for Population ===
OutfitSchema.virtual("style", {
  ref: "Setting",
  localField: "style_id",
  foreignField: "_id",
  justOne: true,
});

OutfitSchema.virtual("occasion", {
  ref: "Setting",
  localField: "occasion_id",
  foreignField: "_id",
  justOne: true,
});

OutfitSchema.virtual("season", {
  ref: "Setting",
  localField: "season_id",
  foreignField: "_id",
  justOne: true,
});

OutfitSchema.virtual("weather", {
  ref: "Setting",
  localField: "weather_id",
  foreignField: "_id",
  justOne: true,
});

// Virtual để lấy items của outfit (từ OutfitItem model)
OutfitSchema.virtual("items", {
  ref: "OutfitItem",
  localField: "_id",
  foreignField: "outfit_id",
});

// === Methods ===
// Increment view count
OutfitSchema.methods.incrementViewCount = function () {
  this.view_count += 1;
  return this.save();
};

// Increment like count
OutfitSchema.methods.toggleLike = function (increment = true) {
  this.like_count += increment ? 1 : -1;
  if (this.like_count < 0) this.like_count = 0;
  return this.save();
};

// Increment save count
OutfitSchema.methods.toggleSave = function (increment = true) {
  this.save_count += increment ? 1 : -1;
  if (this.save_count < 0) this.save_count = 0;
  return this.save();
};

// Record wear
OutfitSchema.methods.recordWear = function () {
  this.wear_count += 1;
  this.last_worn_date = new Date();
  return this.save();
};

// Update rating
OutfitSchema.methods.updateRating = function (rating) {
  if (rating >= 1 && rating <= 5) {
    this.user_rating = rating;
    return this.save();
  }
  throw new Error("Rating phải từ 1-5");
};

// Ensure virtuals are included in JSON
OutfitSchema.set("toJSON", { virtuals: true });
OutfitSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Outfit", OutfitSchema);
