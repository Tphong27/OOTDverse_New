// backend/server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path"); // <--- 1. Thêm dòng này

// 2. Sửa dòng config dotenv này:
// Nó sẽ luôn tìm file .env nằm cùng thư mục với file server.js
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// 1. Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
//app.use(express.json()); // Để đọc JSON từ body request

// 2. Kết nối Database
// Lấy chuỗi kết nối từ file .env cũ của bạn
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Đã kết nối MongoDB"))
  .catch((err) => console.error("❌ Lỗi kết nối DB:", err));

// 3. Routes
// Import route
const wardrobeRoutes = require("./routes/wardrobeRoutes");
const settingRoutes = require("./routes/settingRoutes");

// Đăng ký route
app.use("/api/wardrobe", wardrobeRoutes);
app.use("/api/setting", settingRoutes);

const userRoutes = require("./routes/userRoutes"); // Import
app.use("/api/users", userRoutes);

// 4. Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});
