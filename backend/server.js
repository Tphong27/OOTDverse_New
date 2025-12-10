// backend/server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const axios = require("axios"); // Import axios

// 2. Sửa dòng config dotenv này:
// Nó sẽ luôn tìm file .env nằm cùng thư mục với file server.js
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// 1. Middleware
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5000",
  "https://ootdverse.vercel.app",
  "https://ootdverse-new.onrender.com",
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith(".vercel.app")) {
        callback(null, true);
      } else {
        console.log("Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
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
const outfitRoutes = require("./routes/outfitRoutes");
const outfitItemRoutes = require("./routes/outfitItemRoutes");
const userRoutes = require("./routes/userRoutes");

// Đăng ký route
app.use("/api/wardrobe", wardrobeRoutes);
app.use("/api/setting", settingRoutes);
app.use("/api/outfits", outfitRoutes);
app.use("/api/outfit-items", outfitItemRoutes);
app.use("/api/users", userRoutes);



// ===== KEEP-ALIVE MECHANISM =====
const pingAiService = async () => {
  try {
    // Lấy URL từ env, mặc định là localhost
    // Lưu ý: AI_SERVICE_URL thường là .../analyze, ta cần ping vào root / hoặc /health
    let aiUrl = process.env.AI_SERVICE_URL || "http://localhost:8000";

    // Nếu URL có đuôi /analyze thì cắt bỏ để lấy base
    if (aiUrl.endsWith("/analyze")) {
      aiUrl = aiUrl.replace("/analyze", "");
    }

    // Đảm bảo không có dấu / ở cuối để nối chuỗi cho đẹp (tùy chọn)
    if (aiUrl.endsWith("/")) {
      aiUrl = aiUrl.slice(0, -1);
    }

    console.log(`⏰ [Keep-Alive] Pinging AI Service at ${aiUrl}/health ...`);
    await axios.get(`${aiUrl}/health`);
    console.log("✅ [Keep-Alive] AI Service is awake");
  } catch (error) {
    // Không log lỗi quá to để tránh rác log, chỉ warning nhẹ
    console.log(`⚠️ [Keep-Alive] AI Service ping failed: ${error.message}`);
  }
};

// Ping ngay khi khởi động
// Sử dụng setTimeout để không block quá trình khởi động server
setTimeout(pingAiService, 5000);

// Ping định kỳ mỗi 10 phút (600,000 ms)
setInterval(pingAiService, 10 * 60 * 1000);
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});
