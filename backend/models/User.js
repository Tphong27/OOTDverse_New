// backend/models/User.js
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  // 1. Thông tin đăng nhập
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Lưu ý: Thực tế nên mã hóa (hash) mật khẩu
  fullName: { type: String, required: true },

  // 2. Thông tin cơ bản
  age: { type: Number },
  gender: { type: String, enum: ["Nam", "Nữ", "Khác"] },
  occupation: { type: String }, // Nghề nghiệp

  // 3. Số đo cơ thể (Quan trọng cho Try-On)
  height: { type: Number }, // cm
  weight: { type: Number }, // kg
  bust: { type: Number }, // Vòng 1
  waist: { type: Number }, // Vòng 2
  hips: { type: Number }, // Vòng 3

  // 4. Sở thích & Phong cách
  favoriteStyles: [{ type: String }], // VD: ["Minimalist", "Streetwear"]
  favoriteBrands: [{ type: String }], // VD: ["Zara", "Uniqlo"]
  budget: { type: String }, // VD: "1-3 triệu"
  avoidColors: [{ type: String }], // Màu không thích

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", UserSchema);
