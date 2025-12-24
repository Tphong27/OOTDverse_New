const mongoose = require("mongoose");
const Outfit = require("../models/Outfit");
const OutfitItem = require("../models/OutfitItem");
const Item = require("../models/Item");
const User = require("../models/User");
const { uploadOutfitImage, isBase64Image } = require("../config/cloudinaryConfig");
const axios = require("axios");

// ========================================
// 1. GET ALL OUTFITS (với filters)
// ========================================
exports.getOutfits = async (req, res) => {
  try {
    const {
      user_id,
      style_id,
      occasion_id,
      season_id,
      weather_id,
      is_public,
      is_featured,
      ai_suggested,
      min_rating,
      sort_by,
      page = 1,
      limit = 20,
    } = req.query;

    const filter = {};

    if (user_id) filter.user_id = user_id;
    if (style_id) filter.style_id = { $in: style_id.split(",") };
    if (occasion_id) filter.occasion_id = { $in: occasion_id.split(",") };
    if (season_id) filter.season_id = { $in: season_id.split(",") };
    if (weather_id) filter.weather_id = { $in: weather_id.split(",") };
    if (is_public !== undefined) filter.is_public = is_public === "true";
    if (is_featured !== undefined) filter.is_featured = is_featured === "true";
    if (ai_suggested !== undefined)
      filter.ai_suggested = ai_suggested === "true";
    if (min_rating) filter.user_rating = { $gte: parseInt(min_rating) };

    let sortOption = { created_date: -1 };
    if (sort_by === "popular") sortOption = { view_count: -1, like_count: -1 };
    if (sort_by === "rating") sortOption = { user_rating: -1 };
    if (sort_by === "recent_worn") sortOption = { last_worn_date: -1 };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const outfits = await Outfit.find(filter)
      .populate("user_id", "fullName avatar")
      .populate("style_id occasion_id season_id weather_id", "name value")
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Outfit.countDocuments(filter);

    res.json({
      success: true,
      data: outfits,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Lỗi khi lấy outfits:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========================================
// 2. GET OUTFIT BY ID (với items)
// ========================================
exports.getOutfitById = async (req, res) => {
  try {
    const { id } = req.params;
    const { increment_view } = req.query;

    const outfit = await Outfit.findById(id)
      .populate("user_id", "fullName avatar bio")
      .populate("style_id occasion_id season_id weather_id", "name value");

    if (!outfit) {
      return res
        .status(404)
        .json({ success: false, error: "Outfit không tồn tại" });
    }

    // Get outfit items - Populate category từ item
    const outfitItems = await OutfitItem.find({ outfit_id: id })
      .populate({
        path: "item_id",
        populate: [
          { path: "category_id", select: "name value priority" }, // Category đã đủ xác định vị trí
          { path: "brand_id", select: "name value" },
          { path: "color_id", select: "name value" },
        ],
      })
      .sort({ display_order: 1 });

    if (increment_view === "true") {
      await outfit.incrementViewCount();
    }

    res.json({
      success: true,
      data: {
        ...outfit.toObject(),
        items: outfitItems,
      },
    });
  } catch (error) {
    console.error("Lỗi khi lấy outfit:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========================================
// 3. CREATE OUTFIT
// ========================================
exports.createOutfit = async (req, res) => {
  try {
    const {
      user_id,
      outfit_name,
      style_id,
      occasion_id,
      season_id,
      weather_id,
      is_public,
      thumbnail_url,
      full_image_url,
      tags,
      description,
      notes,
      items, // Array of { item_id, layer_position, display_order, styling_note, is_optional }
    } = req.body;

    // Validation: Kiểm tra items
    if (!items || items.length < 2) {
      return res.status(400).json({
        success: false,
        error: "Outfit phải có ít nhất 2 items",
      });
    }

    if (items.length > 15) {
      return res.status(400).json({
        success: false,
        error: "Outfit không được vượt quá 15 items",
      });
    }

    // Kiểm tra user tồn tại
    const user = await User.findById(user_id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, error: "User không tồn tại" });
    }

    // Kiểm tra tất cả items tồn tại và thuộc về user
    const itemIds = items.map((i) => i.item_id);
    const validItems = await Item.find({
      _id: { $in: itemIds },
      user_id: user_id,
      is_active: true,
    }).populate("category_id");

    if (validItems.length !== itemIds.length) {
      return res.status(400).json({
        success: false,
        error: "Một hoặc nhiều items không hợp lệ hoặc không thuộc về user",
      });
    }

    // Upload thumbnail URL if base64
    let finalThumbnailUrl = thumbnail_url;
    if (isBase64Image(thumbnail_url)) {
      try {
        console.log("📤 Uploading outfit thumbnail...");
        finalThumbnailUrl = await uploadOutfitImage(thumbnail_url, user_id, null, 'thumb');
      } catch (err) {
        console.error("❌ Thumbnail upload error:", err.message);
        // Continue creating outfit even if image upload fails? 
        // Better to fail and let user retry or handle gracefully.
        return res.status(500).json({ success: false, error: "Thumbnail upload failed: " + err.message });
      }
    }

    // Upload full image URL if base64
    let finalFullImageUrl = full_image_url;
    if (isBase64Image(full_image_url)) {
      try {
        console.log("📤 Uploading outfit full image...");
        finalFullImageUrl = await uploadOutfitImage(full_image_url, user_id, null, 'full');
      } catch (err) {
        console.error("❌ Full image upload error:", err.message);
        return res.status(500).json({ success: false, error: "Full image upload failed: " + err.message });
      }
    }

    // Tạo outfit
    const outfit = new Outfit({
      user_id,
      outfit_name,
      style_id,
      occasion_id,
      season_id,
      weather_id,
      is_public: is_public !== undefined ? is_public : true,
      thumbnail_url: finalThumbnailUrl,
      full_image_url: finalFullImageUrl,
      tags: tags || [],
      description,
      notes,
    });

    await outfit.save();

    // Tạo outfit items (KHÔNG CẦN body_position_id nữa)
    const outfitItemsData = items.map((item, index) => ({
      outfit_id: outfit._id,
      item_id: item.item_id,
      layer_position: item.layer_position || null,
      display_order:
        item.display_order !== undefined ? item.display_order : index,
      styling_note: item.styling_note || null,
      is_optional: item.is_optional || false,
    }));

    await OutfitItem.insertMany(outfitItemsData);

    // Populate và trả về
    const populatedOutfit = await Outfit.findById(outfit._id)
      .populate("user_id", "fullName avatar")
      .populate("style_id occasion_id season_id weather_id", "name value");

    const outfitItems = await OutfitItem.find({ outfit_id: outfit._id })
      .populate({
        path: "item_id",
        populate: { path: "category_id", select: "name value priority" },
      })
      .sort({ display_order: 1 });

    res.status(201).json({
      success: true,
      message: "Tạo outfit thành công",
      data: {
        ...populatedOutfit.toObject(),
        items: outfitItems,
      },
    });
  } catch (error) {
    console.error("Lỗi khi tạo outfit:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========================================
// 4. UPDATE OUTFIT
// ========================================
exports.updateOutfit = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      outfit_name,
      style_id,
      occasion_id,
      season_id,
      weather_id,
      is_public,
      is_featured,
      thumbnail_url,
      full_image_url,
      tags,
      description,
      notes,
      user_rating,
      items,
    } = req.body;

    const outfit = await Outfit.findById(id);
    if (!outfit) {
      return res
        .status(404)
        .json({ success: false, error: "Outfit không tồn tại" });
    }

    // Update outfit fields
    if (outfit_name) outfit.outfit_name = outfit_name;
    if (style_id !== undefined) outfit.style_id = style_id;
    if (occasion_id !== undefined) outfit.occasion_id = occasion_id;
    if (season_id !== undefined) outfit.season_id = season_id;
    if (weather_id !== undefined) outfit.weather_id = weather_id;
    if (is_public !== undefined) outfit.is_public = is_public;
    if (is_featured !== undefined) outfit.is_featured = is_featured;
    
    // Upload & update thumbnail
    if (thumbnail_url) {
      if (isBase64Image(thumbnail_url)) {
        try {
          console.log("📤 Uploading updated outfit thumbnail...");
          outfit.thumbnail_url = await uploadOutfitImage(thumbnail_url, outfit.user_id, id, 'thumb');
        } catch (err) {
          console.error("❌ Thumbnail update error:", err.message);
          return res.status(500).json({ success: false, error: "Thumbnail upload failed: " + err.message });
        }
      } else {
        outfit.thumbnail_url = thumbnail_url;
      }
    }

    // Upload & update full image
    if (full_image_url) {
      if (isBase64Image(full_image_url)) {
        try {
          console.log("📤 Uploading updated outfit full image...");
          outfit.full_image_url = await uploadOutfitImage(full_image_url, outfit.user_id, id, 'full');
        } catch (err) {
          console.error("❌ Full image update error:", err.message);
          return res.status(500).json({ success: false, error: "Full image upload failed: " + err.message });
        }
      } else {
        outfit.full_image_url = full_image_url;
      }
    }

    if (tags) outfit.tags = tags;
    if (description !== undefined) outfit.description = description;
    if (notes !== undefined) outfit.notes = notes;
    if (user_rating) outfit.user_rating = user_rating;

    await outfit.save();

    // Nếu có update items
    if (items && Array.isArray(items)) {
      if (items.length < 2) {
        return res.status(400).json({
          success: false,
          error: "Outfit phải có ít nhất 2 items",
        });
      }

      if (items.length > 15) {
        return res.status(400).json({
          success: false,
          error: "Outfit không được vượt quá 15 items",
        });
      }

      // Xóa tất cả outfit items cũ
      await OutfitItem.deleteMany({ outfit_id: id });

      // Tạo outfit items mới
      const outfitItemsData = items.map((item, index) => ({
        outfit_id: id,
        item_id: item.item_id,
        layer_position: item.layer_position || null,
        display_order:
          item.display_order !== undefined ? item.display_order : index,
        styling_note: item.styling_note || null,
        is_optional: item.is_optional || false,
      }));

      await OutfitItem.insertMany(outfitItemsData);
    }

    // Populate và trả về
    const updatedOutfit = await Outfit.findById(id)
      .populate("user_id", "fullName avatar")
      .populate("style_id occasion_id season_id weather_id", "name value");

    const outfitItems = await OutfitItem.find({ outfit_id: id })
      .populate({
        path: "item_id",
        populate: { path: "category_id", select: "name value priority" },
      })
      .sort({ display_order: 1 });

    res.json({
      success: true,
      message: "Cập nhật outfit thành công",
      data: {
        ...updatedOutfit.toObject(),
        items: outfitItems,
      },
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật outfit:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========================================
// 5. DELETE OUTFIT
// ========================================
exports.deleteOutfit = async (req, res) => {
  try {
    const { id } = req.params;

    const outfit = await Outfit.findById(id);
    if (!outfit) {
      return res
        .status(404)
        .json({ success: false, error: "Outfit không tồn tại" });
    }

    await OutfitItem.deleteMany({ outfit_id: id });
    await Outfit.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Xóa outfit thành công",
    });
  } catch (error) {
    console.error("Lỗi khi xóa outfit:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========================================
// 6. TOGGLE LIKE OUTFIT
// ========================================
exports.toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    const { increment = true } = req.body;

    const outfit = await Outfit.findById(id);
    if (!outfit) {
      return res
        .status(404)
        .json({ success: false, error: "Outfit không tồn tại" });
    }

    await outfit.toggleLike(increment);

    res.json({
      success: true,
      message: increment ? "Liked outfit" : "Unliked outfit",
      data: { like_count: outfit.like_count },
    });
  } catch (error) {
    console.error("Lỗi toggle like:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========================================
// 7. TOGGLE SAVE OUTFIT
// ========================================
exports.toggleSave = async (req, res) => {
  try {
    const { id } = req.params;
    const { increment = true } = req.body;

    const outfit = await Outfit.findById(id);
    if (!outfit) {
      return res
        .status(404)
        .json({ success: false, error: "Outfit không tồn tại" });
    }

    await outfit.toggleSave(increment);

    res.json({
      success: true,
      message: increment ? "Saved outfit" : "Unsaved outfit",
      data: { save_count: outfit.save_count },
    });
  } catch (error) {
    console.error("Lỗi toggle save:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========================================
// 8. RECORD WEAR
// ========================================
exports.recordWear = async (req, res) => {
  try {
    const { id } = req.params;

    const outfit = await Outfit.findById(id);
    if (!outfit) {
      return res
        .status(404)
        .json({ success: false, error: "Outfit không tồn tại" });
    }

    await outfit.recordWear();

    res.json({
      success: true,
      message: "Đã ghi nhận mặc outfit",
      data: {
        wear_count: outfit.wear_count,
        last_worn_date: outfit.last_worn_date,
      },
    });
  } catch (error) {
    console.error("Lỗi record wear:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========================================
// 9. UPDATE RATING
// ========================================
exports.updateRating = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: "Rating phải từ 1-5",
      });
    }

    const outfit = await Outfit.findById(id);
    if (!outfit) {
      return res
        .status(404)
        .json({ success: false, error: "Outfit không tồn tại" });
    }

    await outfit.updateRating(rating);

    res.json({
      success: true,
      message: "Cập nhật rating thành công",
      data: { user_rating: outfit.user_rating },
    });
  } catch (error) {
    console.error("Lỗi update rating:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========================================
// 10. GET USER'S OUTFITS
// ========================================
exports.getUserOutfits = async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      is_public,
      page = 1,
      limit = 20,
      style_id,
      occasion_id,
      season_id,
      weather_id,
      sort_by = "newest",
    } = req.query;

    const filter = { user_id: userId };

    // Optional filters
    if (is_public !== undefined) filter.is_public = is_public === "true";
    if (style_id) filter.style_id = style_id;
    if (occasion_id) filter.occasion_id = occasion_id;
    if (season_id) filter.season_id = season_id;
    if (weather_id) filter.weather_id = weather_id;

    // Sort options
    let sortOption = { created_date: -1 }; // Default: newest
    if (sort_by === "popular") sortOption = { view_count: -1, like_count: -1 };
    if (sort_by === "rating") sortOption = { user_rating: -1 };
    if (sort_by === "most_worn") sortOption = { wear_count: -1 };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const outfits = await Outfit.find(filter)
      .populate("user_id", "fullName avatar") // ← Populate user info
      .populate("style_id occasion_id season_id weather_id", "name value")
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Outfit.countDocuments(filter);

    res.json({
      success: true,
      data: outfits,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Lỗi lấy outfits của user:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========================================
// 11. GET OUTFITS CONTAINING ITEM
// ========================================
exports.getOutfitsByItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    const outfitItems = await OutfitItem.find({ item_id: itemId }).populate({
      path: "outfit_id",
      populate: [
        { path: "user_id", select: "fullName avatar" },
        {
          path: "style_id occasion_id season_id weather_id",
          select: "name value",
        },
      ],
    });

    const outfits = outfitItems.map((oi) => oi.outfit_id);

    res.json({
      success: true,
      data: outfits,
    });
  } catch (error) {
    console.error("Lỗi lấy outfits chứa item:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========================================
// 12. GET OUTFIT STATISTICS
// ========================================
exports.getOutfitStats = async (req, res) => {
  try {
    const { userId } = req.params;

    const totalOutfits = await Outfit.countDocuments({ user_id: userId });
    const publicOutfits = await Outfit.countDocuments({
      user_id: userId,
      is_public: true,
    });
    const privateOutfits = totalOutfits - publicOutfits;

    const totalViews = await Outfit.aggregate([
      { $match: { user_id: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, total: { $sum: "$view_count" } } },
    ]);

    const totalLikes = await Outfit.aggregate([
      { $match: { user_id: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, total: { $sum: "$like_count" } } },
    ]);

    const avgRating = await Outfit.aggregate([
      {
        $match: {
          user_id: new mongoose.Types.ObjectId(userId),
          user_rating: { $ne: null },
        },
      },
      { $group: { _id: null, avg: { $avg: "$user_rating" } } },
    ]);

    res.json({
      success: true,
      data: {
        totalOutfits,
        publicOutfits,
        privateOutfits,
        totalViews: totalViews[0]?.total || 0,
        totalLikes: totalLikes[0]?.total || 0,
        averageRating: avgRating[0]?.avg || 0,
      },
    });
  } catch (error) {
    console.error("Lỗi lấy thống kê outfit:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========================================
// 13. AI SUGGEST OUTFITS
// ========================================
exports.aiSuggest = async (req, res) => {
  try {
    const { userId, style, occasion, weather, skin_tone } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: "userId là bắt buộc" });
    }

    // 1. Lấy tất cả items của user
    const items = await Item.find({ user_id: userId, is_active: true })
      .populate("category_id", "name")
      .populate("color_id", "name");

    if (items.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Tủ đồ của bạn đang trống. Hãy thêm đồ trước khi sử dụng AI Stylist." 
      });
    }

    // 2. Chuyển đổi dữ liệu sang format AI Service cần
    const wardrobeForAI = items.map(item => ({
      id: item._id,
      name: item.item_name,
      category: item.category_id?.name || "Khác",
      color: item.color_id.map(c => c.name),
      tags: item.tags || []
    }));

    // 3. Gọi AI Service
    const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";
    const response = await axios.post(`${AI_SERVICE_URL}/suggest`, {
      style,
      occasion,
      weather,
      skin_tone,
      wardrobe: wardrobeForAI
    });

    if (response.data.success) {
      // 4. Bổ sung thông tin item (hình ảnh, tên) vào kết quả trả về cho frontend
      const suggestionsWithDetails = await Promise.all(response.data.suggestions.map(async (suggestion) => {
        const itemDetails = await Item.find({ _id: { $in: suggestion.item_ids } })
          .select("item_name image_url category_id")
          .populate("category_id", "name");
        
        // 4.1 Gọi AI Service để tạo ảnh ghép (Visualization) + Lookbook
        let visualPreview = null;
        let lookbookUrl = null;
        try {
          const vizResponse = await axios.post(`${AI_SERVICE_URL}/visualize`, {
            items: itemDetails.map(it => ({
              image_url: it.image_url,
              category: it.category_id?.name || "Khác"
            })),
            outfit_name: suggestion.outfit_name,
            description: suggestion.description,
            rationale: suggestion.rationale
          });
          if (vizResponse.data.success) {
            visualPreview = `data:image/png;base64,${vizResponse.data.image_base64}`;
            lookbookUrl = vizResponse.data.lookbook_url;
          }
        } catch (vizError) {
          console.error("Lỗi tạo ảnh ghép/lookbook:", vizError.message);
        }

        return {
          ...suggestion,
          items: itemDetails,
          visual_preview: visualPreview,
          lookbook_url: lookbookUrl
        };
      }));

      res.json({
        success: true,
        suggestions: suggestionsWithDetails
      });
    } else {
      res.status(500).json({ success: false, error: response.data.error });
    }

  } catch (error) {
    console.error("Lỗi AI Stylist:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
