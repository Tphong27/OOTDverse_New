const mongoose = require("mongoose");

const OutfitItemSchema = new mongoose.Schema(
  {
    // === References ===
    outfit_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Outfit",
      required: [true, "Outfit ID là bắt buộc"],
      index: true,
    },

    item_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: [true, "Item ID là bắt buộc"],
    },

    // === Layer Position ===
    layer_position: {
      type: String,
      enum: ["base", "mid", "outer", null],
      default: null,
      // base: áo trong, mid: áo giữa, outer: áo ngoài
    },

    // === Styling Details ===
    styling_note: {
      type: String,
      maxlength: [255, "Ghi chú styling không được quá 255 ký tự"],
      default: null,
    },

    is_optional: {
      type: Boolean,
      default: false,
      // Item có thể bỏ qua trong outfit không
    },

    display_order: {
      type: Number,
      default: 0,
      min: [0, "Display order không được âm"],
      // Thứ tự hiển thị item trong outfit
    },

    // === Timestamps ===
    added_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: { createdAt: "added_at", updatedAt: "updated_at" },
  }
);

// === Indexes ===
// Đảm bảo 1 item chỉ xuất hiện 1 lần trong 1 outfit
OutfitItemSchema.index({ outfit_id: 1, item_id: 1 }, { unique: true });
OutfitItemSchema.index({ outfit_id: 1, display_order: 1 });
OutfitItemSchema.index({ item_id: 1 }); // Để tìm item thuộc outfits nào

// === Virtuals ===
OutfitItemSchema.virtual("outfit", {
  ref: "Outfit",
  localField: "outfit_id",
  foreignField: "_id",
  justOne: true,
});

OutfitItemSchema.virtual("item", {
  ref: "Item",
  localField: "item_id",
  foreignField: "_id",
  justOne: true,
});

// === Static Methods ===
// Lấy tất cả items của một outfit
OutfitItemSchema.statics.getItemsByOutfit = async function (outfitId) {
  return this.find({ outfit_id: outfitId })
    .populate({
      path: "item",
      populate: {
        path: "category_id", // Populate category để biết vị trí
        select: "name value priority"
      }
    })
    .sort({ display_order: 1 });
};

// Lấy tất cả outfits chứa một item
OutfitItemSchema.statics.getOutfitsByItem = async function (itemId) {
  return this.find({ item_id: itemId }).populate("outfit");
};

// Đếm số lượng items trong outfit
OutfitItemSchema.statics.countItemsInOutfit = async function (outfitId) {
  return this.countDocuments({ outfit_id: outfitId });
};

// === Instance Methods ===
// Update display order
OutfitItemSchema.methods.updateOrder = function (newOrder) {
  this.display_order = newOrder;
  return this.save();
};

// Toggle optional status
OutfitItemSchema.methods.toggleOptional = function () {
  this.is_optional = !this.is_optional;
  return this.save();
};

// Ensure virtuals are included in JSON
OutfitItemSchema.set("toJSON", { virtuals: true });
OutfitItemSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("OutfitItem", OutfitItemSchema);