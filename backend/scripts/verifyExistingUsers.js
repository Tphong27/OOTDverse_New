/**
 * Migration Script: verifyExistingUsers.js
 * 
 * This script grandfathers existing users by setting isEmailVerified to true.
 * Use this to resolve the issue where old test/admin accounts are blocked by OTP verification.
 * 
 * Usage: node backend/scripts/verifyExistingUsers.js
 */

require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const User = require("../models/User");

async function verifyUsers() {
  console.log("━".repeat(60));
  console.log("🚀 BẮT ĐẦU MIGRATION: XÁC THỰC EMAIL CHO TẤT CẢ USER HIỆN CÓ");
  console.log("━".repeat(60));

  try {
    // Connect to MongoDB
    console.log("ℹ Đang kết nối MongoDB Atlas...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✓ Kết nối Database thành công!");

    // Find all users who are not verified
    const unverifiedUsers = await User.find({ isEmailVerified: { $ne: true } });
    console.log(`ℹ Tìm thấy ${unverifiedUsers.length} users chưa xác thực email.`);

    if (unverifiedUsers.length === 0) {
      console.log("✓ Tất cả user đã được xác thực. Không có gì để cập nhật.");
    } else {
      // Update all users
      const result = await User.updateMany(
        { isEmailVerified: { $ne: true } },
        { $set: { isEmailVerified: true } }
      );
      console.log(`✓ Đã cập nhật ${result.modifiedCount} users thành công!`);
    }

    console.log("━".repeat(60));
    console.log("🎉 MIGRATION HOÀN TẤT!");

  } catch (error) {
    console.error(`✖ Migration thất bại: ${error.message}`);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("ℹ Đã ngắt kết nối Database");
  }
}

verifyUsers();
