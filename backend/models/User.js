// backend/models/User.js
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    // 1. Thông tin đăng nhập
    email: { type: String, required: true, unique: true },
    password: { type: String },
    fullName: { type: String, required: true },

    // Thêm trường avatar
    avatar: { type: String },

    // 2. Thông tin cơ bản
    age: { type: Number },
    gender: { type: String, enum: ["Nam", "Nữ", "Khác"] },
    phone: { type: String },
    location: { type: String },
    birthday: { type: Date },
    bio: { type: String },

    // 3. Số đo cơ thể
    height: { type: Number }, // cm
    weight: { type: Number }, // kg
    bust: { type: Number }, // Vòng 1
    waist: { type: Number }, // Vòng 2
    hips: { type: Number }, // Vòng 3

    // 4. Sở thích & Phong cách (Liên kết với bảng Setting)
    favoriteStyles: [{ type: mongoose.Schema.Types.ObjectId, ref: "Setting" }],
    favoriteBrands: [{ type: mongoose.Schema.Types.ObjectId, ref: "Setting" }],
    favoriteColors: [{ type: mongoose.Schema.Types.ObjectId, ref: "Setting" }],
    favoriteOccasions: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Setting" },
    ],

    budget: { type: String },

    // Màu ghét (Avoid)
    avoidColors: [{ type: mongoose.Schema.Types.ObjectId, ref: "Setting" }],

    // Cờ kiểm tra đã điền profile chưa
    hasProfile: { type: Boolean, default: false },
  },
  {
    timestamps: true, // <--- Đã sửa: Tự động tạo createdAt và updatedAt
  }
);

module.exports = mongoose.model("User", UserSchema);
