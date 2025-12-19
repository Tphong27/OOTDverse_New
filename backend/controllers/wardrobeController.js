// backend/controllers/wardrobeController.js
const Item = require("../models/Item");
const mongoose = require("mongoose");
const axios = require("axios"); // [MỚI] Import axios để gọi AI Service
const Setting = require("../models/setting"); // [MỚI] Import Setting để map dữ liệu
const { uploadWardrobeImage, isBase64Image } = require("../config/cloudinaryConfig");

// ===== 1. GET ALL ITEMS (Lấy danh sách món đồ của user) =====
exports.getItems = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId là bắt buộc",
      });
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "userId không hợp lệ",
      });
    }

    // Lấy items và populate các reference
    const items = await Item.find({
      user_id: userId,
      is_active: true,
    })
      .populate("category_id", "name value")
      .populate("brand_id", "name value")
      .populate("color_id", "name value")
      .populate("season_id", "name value")
      .populate("material_id", "name value")
      .sort({ added_date: -1 });

    res.json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (err) {
    console.error("Error in getItems:", err);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: err.message,
    });
  }
};

// ===== 2. GET SINGLE ITEM (Lấy chi tiết 1 món đồ) =====
exports.getItemById = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "ID không hợp lệ",
      });
    }

    const item = await Item.findOne({
      _id: id,
      user_id: userId,
    })
      .populate("category_id", "name value")
      .populate("brand_id", "name value")
      .populate("color_id", "name value")
      .populate("season_id", "name value")
      .populate("material_id", "name value");

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy món đồ",
      });
    }

    res.json({
      success: true,
      data: item,
    });
  } catch (err) {
    console.error("Error in getItemById:", err);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: err.message,
    });
  }
};

// ===== 3. CREATE ITEM (Thêm món đồ mới) =====
exports.createItem = async (req, res) => {
  try {
    const { userId, ...itemData } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId là bắt buộc",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "userId không hợp lệ",
      });
    }

    // Validate required fields
    if (!itemData.item_name || !itemData.category_id || !itemData.image_url) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin bắt buộc: item_name, category_id, image_url",
      });
    }

    // Upload image to Cloudinary if it's base64
    let finalImageUrl = itemData.image_url;
    if (isBase64Image(itemData.image_url)) {
      try {
        console.log("📤 Uploading wardrobe image to Cloudinary...");
        finalImageUrl = await uploadWardrobeImage(itemData.image_url, userId);
        console.log("✅ Image uploaded:", finalImageUrl.substring(0, 60) + "...");
      } catch (uploadError) {
        console.error("❌ Cloudinary upload error:", uploadError.message);
        return res.status(500).json({
          success: false,
          message: "Lỗi upload ảnh lên Cloudinary",
          error: uploadError.message,
        });
      }
    }

    // Tạo item mới với Cloudinary URL
    const newItem = new Item({
      user_id: userId,
      ...itemData,
      image_url: finalImageUrl,
    });

    const savedItem = await newItem.save();

    // Populate trước khi trả về
    await savedItem.populate([
      { path: "category_id", select: "name value" },
      { path: "brand_id", select: "name value" },
      { path: "color_id", select: "name value" },
      { path: "season_id", select: "name value" },
      { path: "material_id", select: "name value" },
    ]);

    res.status(201).json({
      success: true,
      message: "Thêm món đồ thành công",
      data: savedItem,
    });
  } catch (err) {
    console.error("Error in createItem:", err);

    // Handle validation errors
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: "Dữ liệu không hợp lệ",
        errors: messages,
      });
    }

    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: err.message,
    });
  }
};

// ===== 4. UPDATE ITEM (Cập nhật món đồ) =====
exports.updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, ...updateData } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "ID không hợp lệ",
      });
    }

    // Upload new image to Cloudinary if it's base64
    if (updateData.image_url && isBase64Image(updateData.image_url)) {
      try {
        console.log("📤 Uploading updated wardrobe image to Cloudinary...");
        updateData.image_url = await uploadWardrobeImage(updateData.image_url, userId, id);
        console.log("✅ Image updated:", updateData.image_url.substring(0, 60) + "...");
      } catch (uploadError) {
        console.error("❌ Cloudinary upload error:", uploadError.message);
        return res.status(500).json({
          success: false,
          message: "Lỗi upload ảnh lên Cloudinary",
          error: uploadError.message,
        });
      }
    }

    // Tìm và update (chỉ update nếu item thuộc về user)
    const updatedItem = await Item.findOneAndUpdate(
      { _id: id, user_id: userId },
      { $set: updateData },
      {
        new: true, // Trả về document sau khi update
        runValidators: true, // Chạy validation
      }
    )
      .populate("category_id", "name value")
      .populate("brand_id", "name value")
      .populate("color_id", "name value")
      .populate("season_id", "name value")
      .populate("material_id", "name value");

    if (!updatedItem) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy món đồ hoặc bạn không có quyền chỉnh sửa",
      });
    }

    res.json({
      success: true,
      message: "Cập nhật thành công",
      data: updatedItem,
    });
  } catch (err) {
    console.error("Error in updateItem:", err);

    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: "Dữ liệu không hợp lệ",
        errors: messages,
      });
    }

    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: err.message,
    });
  }
};

// ===== 5. DELETE ITEM (Xóa mềm - set is_active = false) =====
exports.deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "ID không hợp lệ",
      });
    }

    // Soft delete: Set is_active = false
    const deletedItem = await Item.findOneAndUpdate(
      { _id: id, user_id: userId },
      { $set: { is_active: false } },
      { new: true }
    );

    if (!deletedItem) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy món đồ hoặc bạn không có quyền xóa",
      });
    }

    res.json({
      success: true,
      message: "Xóa món đồ thành công",
      data: deletedItem,
    });
  } catch (err) {
    console.error("Error in deleteItem:", err);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: err.message,
    });
  }
};

// ===== 6. TOGGLE FAVORITE (Đánh dấu yêu thích) =====
exports.toggleFavorite = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "ID không hợp lệ",
      });
    }

    const item = await Item.findOne({ _id: id, user_id: userId });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy món đồ",
      });
    }

    // Sử dụng method từ schema
    await item.toggleFavorite();

    res.json({
      success: true,
      message: item.is_favorite ? "Đã thêm vào yêu thích" : "Đã bỏ yêu thích",
      data: item,
    });
  } catch (err) {
    console.error("Error in toggleFavorite:", err);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: err.message,
    });
  }
};

// ===== 7. INCREMENT WEAR COUNT (Tăng số lần mặc) =====
exports.incrementWearCount = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "ID không hợp lệ",
      });
    }

    const item = await Item.findOne({ _id: id, user_id: userId });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy món đồ",
      });
    }

    // Sử dụng method từ schema
    await item.incrementWearCount();

    res.json({
      success: true,
      message: "Đã cập nhật số lần mặc",
      data: {
        wear_count: item.wear_count,
        last_worn_date: item.last_worn_date,
      },
    });
  } catch (err) {
    console.error("Error in incrementWearCount:", err);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: err.message,
    });
  }
};

// ===== 8. GET STATISTICS (Thống kê tủ đồ) =====
exports.getStatistics = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "userId không hợp lệ",
      });
    }

    const stats = await Item.aggregate([
      {
        $match: {
          user_id: new mongoose.Types.ObjectId(userId),
          is_active: true,
        },
      },
      {
        $group: {
          _id: null,
          total_items: { $sum: 1 },
          favorite_count: {
            $sum: { $cond: ["$is_favorite", 1, 0] },
          },
          total_value: { $sum: "$price" },
          avg_wear_count: { $avg: "$wear_count" },
        },
      },
    ]);

    // Đếm theo category
    const categoryStats = await Item.aggregate([
      {
        $match: {
          user_id: new mongoose.Types.ObjectId(userId),
          is_active: true,
        },
      },
      {
        $group: {
          _id: "$category_id",
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "settings",
          localField: "_id",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" },
      {
        $project: {
          category_name: "$category.name",
          count: 1,
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        overview: stats[0] || {
          total_items: 0,
          favorite_count: 0,
          total_value: 0,
          avg_wear_count: 0,
        },
        by_category: categoryStats,
      },
    });
  } catch (err) {
    console.error("Error in getStatistics:", err);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: err.message,
    });
  }
};

// ===== 9. AI ANALYZE IMAGE (NÂNG CẤP) =====
exports.analyzeImage = async (req, res) => {
  try {
    const { imageBase64 } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ success: false, message: "Không có ảnh" });
    }

    // 1. Gọi AI Service
    const aiServiceUrl =
      process.env.AI_SERVICE_URL || "http://localhost:8000/analyze";
    console.log("Đang gửi ảnh tới AI Service...");

    let aiResponse;
    try {
      aiResponse = await axios.post(
        aiServiceUrl,
        { image_base64: imageBase64 },
        { timeout: 50000 }
      );
      console.log("✅ [2/4] AI Service đã phản hồi");
    } catch (aiError) {
      console.error("AI Service Lỗi:", aiError.message);
      return res
        .status(503)
        .json({ success: false, message: "Không kết nối được AI Service" });
    }

    const aiResult = aiResponse.data.data;
    console.log("AI Trả về:", JSON.stringify(aiResult, null, 2));

    // 2. CHIẾN THUẬT TÌM KIẾM THÔNG MINH (Fuzzy Match)

    // --- Hàm hỗ trợ tìm kiếm ---
    const findBestMatch = async (type, keyword) => {
      if (!keyword) return null;
      const keywordLower = keyword.toLowerCase().trim();

      // Lấy tất cả setting đang Active của loại này
      const allSettings = await Setting.find({ type: type, status: "Active" });

      // Lọc tìm cái khớp nhất
      const match = allSettings.find((s) => {
        const dbName = s.name.toLowerCase();
        // 1. Khớp chính xác
        if (dbName === keywordLower) return true;
        // 2. DB chứa từ khóa AI (VD: DB="Màu đỏ(Red)", AI="Đỏ" -> Khớp)
        if (dbName.includes(keywordLower)) return true;
        // 3. Từ khóa AI chứa DB (VD: AI="Áo khoác", DB="Áo" -> Khớp)
        if (keywordLower.includes(dbName)) return true;
        return false;
      });

      return match;
    };

    // --- Thực hiện tìm kiếm ---
    const category = await findBestMatch("category", aiResult.category);
    const color = await findBestMatch("color", aiResult.color);
    const season = await findBestMatch("season", aiResult.season);

    // --- Log kết quả map để kiểm tra ---
    console.log("✅ KẾT QUẢ MAP:");
    console.log(
      `   - Category: "${aiResult.category}" -> DB: ${
        category ? category.name : "KHÔNG TÌM THẤY"
      }`
    );
    console.log(
      `   - Color:    "${aiResult.color}"    -> DB: ${
        color ? color.name : "KHÔNG TÌM THẤY"
      }`
    );
    console.log(
      `   - Season:   "${aiResult.season}"   -> DB: ${
        season ? season.name : "KHÔNG TÌM THẤY"
      }`
    );

    // 3. Trả về Frontend
    res.json({
      success: true,
      data: {
        // Nếu tìm thấy thì lấy ID, không thì để chuỗi rỗng
        category_id: category ? category._id : "",
        // Form yêu cầu mảng ID cho color và season
        color_id: color ? [color._id] : [],
        season_id: season ? [season._id] : [],

        style_tags: aiResult.tags || [],
        notes: aiResult.notes || "",

        // Gửi kèm dữ liệu gốc để debug ở frontend nếu cần
        raw_ai: aiResult,
      },
    });
  } catch (err) {
    console.error("Lỗi Server:", err);
    res.status(500).json({
      success: false,
      message: "Lỗi xử lý backend",
      error: err.message,
    });
  }
};

// Hàm tính độ tương đồng giữa 2 chuỗi (0-1)
const stringSimilarity = (str1, str2) => {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();

  if (s1 === s2) return 1;
  if (s1.includes(s2) || s2.includes(s1)) return 0.8;

  // Levenshtein distance đơn giản
  const len1 = s1.length;
  const len2 = s2.length;
  const matrix = Array(len1 + 1)
    .fill(null)
    .map(() => Array(len2 + 1).fill(0));

  for (let i = 0; i <= len1; i++) matrix[i][0] = i;
  for (let j = 0; j <= len2; j++) matrix[0][j] = j;

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  const distance = matrix[len1][len2];
  return 1 - distance / Math.max(len1, len2);
};

// Hàm tìm kiếm NÂNG CẤP
const findBestMatch = async (type, keyword) => {
  if (!keyword) return null;

  const allSettings = await Setting.find({ type: type, status: "Active" });

  let bestMatch = null;
  let highestScore = 0;

  for (const setting of allSettings) {
    const score = stringSimilarity(setting.name, keyword);

    // Nếu độ tương đồng > 60% và cao hơn kết quả trước
    if (score > 0.6 && score > highestScore) {
      highestScore = score;
      bestMatch = setting;
    }
  }

  console.log(
    `Tìm "${keyword}" → "${bestMatch?.name || "KHÔNG TÌM THẤY"}" (Score: ${(
      highestScore * 100
    ).toFixed(0)}%)`
  );
  return bestMatch;
};

// ===== HÀM HỖ TRỢ: TÌM KIẾM NHIỀU KEYWORDS (CHO COLOR/SEASON) =====
const findMultipleMatches = async (type, keywords) => {
  if (!keywords) return [];

  // Đảm bảo input là mảng
  const keywordList = Array.isArray(keywords) ? keywords : [keywords];
  const matchedIds = [];

  for (const keyword of keywordList) {
    const match = await findBestMatch(type, keyword);
    if (match) {
      matchedIds.push(match._id);
    }
  }

  // Loại bỏ ID trùng lặp
  return [...new Set(matchedIds.map((id) => id.toString()))];
};

exports.analyzeImage = async (req, res) => {
  try {
    const { imageBase64 } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ success: false, message: "Không có ảnh" });
    }

    console.log("📡 [1/4] Đang gửi ảnh tới AI Service...");

    const aiServiceUrl =
      process.env.AI_SERVICE_URL || "http://localhost:8000/analyze";

    let aiResponse;

    try {
      aiResponse = await axios.post(
        aiServiceUrl,
        { image_base64: imageBase64 },
        { timeout: 60000 } // Tăng timeout lên 60s cho xử lý ảnh nặng
      );
      console.log("✅ [2/4] AI Service đã phản hồi");
    } catch (aiError) {
      console.error("AI Service Lỗi:", {
        message: aiError.message,
        code: aiError.code,
      });
      return res.status(503).json({
        success: false,
        message:
          "Không kết nối được AI Service. Vui lòng kiểm tra xem AI Service đã chạy chưa.",
      });
    }

    const aiResponseData = aiResponse.data;

    if (!aiResponseData.success) {
      return res.status(400).json({
        success: false,
        message: "Lỗi từ AI: " + aiResponseData.error,
      });
    }

    const aiResult = aiResponseData.data;
    console.log("📝 [3/4] AI Raw Data:", JSON.stringify(aiResult, null, 2));

    // 1. Tìm Category (Single)
    const category = await findBestMatch("category", aiResult.category);

    // 2. Tìm Colors (Multiple)
    const colorIds = await findMultipleMatches("color", aiResult.color);

    // 3. Tìm Seasons (Multiple)
    const seasonIds = await findMultipleMatches("season", aiResult.season);

    console.log("✅ [4/4] Mapping hoàn tất:");
    console.log(`   - Category ID: ${category?._id || "null"}`);
    console.log(`   - Color IDs: [${colorIds.join(", ")}]`);
    console.log(`   - Season IDs: [${seasonIds.join(", ")}]`);

    res.json({
      success: true,
      data: {
        category_id: category?._id || "",
        color_id: colorIds, // Trả về mảng ID
        season_id: seasonIds, // Trả về mảng ID
        style_tags: aiResult.tags || [],
        notes: aiResult.notes || "",
        raw_ai: aiResult,
      },
    });
  } catch (err) {
    console.error("🔥 Lỗi Server (analyzeImage):", err);
    res.status(500).json({
      success: false,
      message: "Lỗi xử lý backend",
      error: err.message,
    });
  }
};
