// backend/server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const axios = require("axios");

require("dotenv").config({ path: path.resolve(__dirname, ".env") });
// require("dotenv").config(); // Load .env file nếu deploy (Render / Railway)

const app = express();
const PORT = process.env.PORT || 5000;

// MIDDLEWARE
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

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
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.indexOf(origin) !== -1 ||
        origin.endsWith(".vercel.app")
      ) {
        callback(null, true);
      } else {
        console.log("Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// DATABASE CONNECTION
mongoose
  .connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000, // Timeout tìm primary
    socketTimeoutMS: 45000, // Timeout socket
    retryWrites: true, // RẤT QUAN TRỌNG cho Atlas
  })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => {
    console.error("❌ Database connection error:", err);
    process.exit(1);
  });

mongoose.connection.on("connected", () => {
  console.log("🟢 MongoDB connected");
});

mongoose.connection.on("error", (err) => {
  console.error("🔴 MongoDB error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("🟡 MongoDB disconnected");
});

// ROUTES
const wardrobeRoutes = require("./routes/wardrobeRoutes");
const settingRoutes = require("./routes/settingRoutes");
const outfitRoutes = require("./routes/outfitRoutes");
const outfitItemRoutes = require("./routes/outfitItemRoutes");
const userRoutes = require("./routes/userRoutes");
const marketplaceRoutes = require("./routes/marketplaceRoutes");
const orderRoutes = require("./routes/orderRoutes");
const swapRequestRoutes = require("./routes/swapRequestRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const addressRoutes = require("./routes/addressRoutes");
const geocodeRoutes = require("./routes/geocode");
const shippingRoutes = require("./routes/shippingRoutes");

// Register routes
app.use("/api/wardrobe", wardrobeRoutes);
app.use("/api/setting", settingRoutes);
app.use("/api/outfits", outfitRoutes);
app.use("/api/outfit-items", outfitItemRoutes);
app.use("/api/users", userRoutes);
app.use("/api/marketplace/listings", marketplaceRoutes);
app.use("/api/marketplace/orders", orderRoutes);
app.use("/api/marketplace/swap-requests", swapRequestRoutes);
app.use("/api/marketplace/payment", paymentRoutes);
app.use("/api/marketplace/shipping", shippingRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/geocode", geocodeRoutes);
app.use("/api/shipping", shippingRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// Test marketplace endpoint
app.get("/api/test-marketplace", (req, res) => {
  res.json({
    success: true,
    message: "Marketplace routes are working",
    availableRoutes: [
      "GET /api/marketplace/listings",
      "GET /api/marketplace/listings/:id",
      "POST /api/marketplace/listings",
      "GET /api/marketplace/orders",
      "GET /api/marketplace/swap-requests",
    ],
  });
});

// Catch-all for 404
app.use((req, res) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.url}`);
  res.status(404).json({
    success: false,
    error: "Route not found",
    path: req.url,
    method: req.method,
  });
});

// KEEP-ALIVE MECHANISM
const pingAiService = async () => {
  try {
    let aiUrl = process.env.AI_SERVICE_URL || "http://localhost:8000";
    if (aiUrl.endsWith("/analyze")) {
      aiUrl = aiUrl.replace("/analyze", "");
    }
    if (aiUrl.endsWith("/")) {
      aiUrl = aiUrl.slice(0, -1);
    }

    console.log(`⏰ [Keep-Alive] Pinging AI Service at ${aiUrl}/health ...`);
    await axios.get(`${aiUrl}/health`);
    console.log("✅ [Keep-Alive] AI Service is awake");
  } catch (error) {
    console.log(`⚠️ [Keep-Alive] AI Service ping failed: ${error.message}`);
  }
};

setTimeout(pingAiService, 5000);
setInterval(pingAiService, 10 * 60 * 1000);

// ERROR HANDLER
app.use((error, req, res, next) => {
  console.error("❌ Server Error:", error);
  res.status(error.status || 500).json({
    success: false,
    error: error.message || "Internal Server Error",
  });
});

// START SERVER
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("🛑 Server shutting down...");
  await mongoose.connection.close();
  process.exit(0);
});
