// backend/models/User.js
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    // 1. Thông tin đăng nhập
    email: { type: String, required: true }, // Removed unique, use compound index instead
    password: { type: String },
    fullName: { type: String, required: true },
    
    // Username cho đăng nhập & hiển thị
    username: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 30,
      lowercase: true,  // Auto chuyển về lowercase khi save
    },
    usernameDisplay: {
      type: String,     // Lưu username gốc (có hoa thường) để hiển thị
      maxlength: 30,
    },

    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Setting",
      default: null,
    },

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

    // budget: { type: String },
    budget: {
      min: Number,
      max: Number,
    },

    // Màu ghét (Avoid)
    avoidColors: [{ type: mongoose.Schema.Types.ObjectId, ref: "Setting" }],

    // Cờ kiểm tra đã điền profile chưa
    hasProfile: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
    authType: {
      type: String,
      enum: ["local", "google", "both"],  // "both" = linked account
      default: "local",
    },
    // Google account ID (for linked accounts)
    googleId: {
      type: String,
      default: null,
    },
    // Email verification
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationCode: {
      type: String,
    },
    emailVerificationExpires: {
      type: Date,
    },
    // Password reset (Quên mật khẩu)
    passwordResetCode: {
      type: String,
    },
    passwordResetExpires: {
      type: Date,
    },
    //Thông tin Marketplace và Swap
    seller_rating: {
      type: Number,
      min: [0, "Rating không được âm"],
      max: [5, "Rating từ 0-5"],
      default: 0,
    },

    total_sales: {
      type: Number,
      default: 0,
    },

    total_purchases: {
      type: Number,
      default: 0,
    },

    total_swaps: {
      type: Number,
      default: 0,
    },

    is_verified_seller: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Unique email - một email chỉ có 1 account (có thể login bằng local hoặc google)
UserSchema.index({ email: 1 }, { unique: true });

// Unique username - case insensitive (đã lowercase trong schema)
UserSchema.index({ username: 1 }, { unique: true });

module.exports = mongoose.model("User", UserSchema);
