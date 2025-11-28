// backend/server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// 1. Middleware
app.use(cors({ origin: "http://localhost:3000", credentials: true })); // Cho phép Frontend gọi
//app.use(express.json()); // Để đọc JSON từ body request

// 2. Kết nối Database
// Lấy chuỗi kết nối từ file .env cũ của bạn
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Đã kết nối MongoDB"))
  .catch((err) => console.error("❌ Lỗi kết nối DB:", err));

// 3. Routes
const wardrobeRoutes = require("./routes/wardrobeRoutes"); // Import route
app.use("/api/wardrobe", wardrobeRoutes); // Đăng ký route

// 4. Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});
