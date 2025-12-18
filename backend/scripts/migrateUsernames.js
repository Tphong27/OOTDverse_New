// backend/scripts/migrateUsernames.js
// Script để generate username cho các user hiện tại chưa có username
// Chạy: node backend/scripts/migrateUsernames.js

require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const User = require("../models/User");
const { generateUniqueUsername } = require("../services/usernameService");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/ootdverse_db";

async function migrateUsernames() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Tìm tất cả users chưa có username
    const usersWithoutUsername = await User.find({
      $or: [
        { username: { $exists: false } },
        { username: null },
        { username: "" }
      ]
    });

    console.log(`📊 Found ${usersWithoutUsername.length} users without username`);

    let successCount = 0;
    let errorCount = 0;

    for (const user of usersWithoutUsername) {
      try {
        // Generate username từ email
        const generatedUsername = await generateUniqueUsername(user.email);
        
        // Cập nhật user
        user.username = generatedUsername;
        user.usernameDisplay = generatedUsername;
        await user.save();
        
        console.log(`  ✅ ${user.email} → @${generatedUsername}`);
        successCount++;
      } catch (err) {
        console.error(`  ❌ ${user.email}: ${err.message}`);
        errorCount++;
      }
    }

    console.log("\n📈 Migration Complete:");
    console.log(`  ✅ Success: ${successCount}`);
    console.log(`  ❌ Errors: ${errorCount}`);
    
  } catch (err) {
    console.error("Migration Error:", err);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
    process.exit(0);
  }
}

migrateUsernames();
