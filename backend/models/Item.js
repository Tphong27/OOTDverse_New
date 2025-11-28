// backend/models/Item.js
const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Ví dụ: "Áo thun trắng"
  category: { type: String, required: true }, // Ví dụ: "Áo", "Quần"
  brand: String, // Ví dụ: "Zara"
  imageUrl: { type: String, required: true }, // Link ảnh
  favorite: { type: Boolean, default: false }, // Trạng thái yêu thích
  createdAt: { type: Date, default: Date.now }, // Ngày tạo
});

module.exports = mongoose.model("Item", ItemSchema);
