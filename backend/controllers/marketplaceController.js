// backend/controllers/marketplaceController.js
const MarketplaceListing = require("../models/Marketplace");
const Item = require("../models/Item");
const User = require("../models/User");
const mongoose = require("mongoose");

// ========================================
// 1. GET ALL LISTINGS (với filters & pagination)
// ========================================
exports.getListings = async (req, res) => {
  try {
    const {
      listing_type,
      condition,
      status,
      category_id,
      brand_id,
      color_id,
      min_price,
      max_price,
      seller_id,
      is_featured,
      search,
      sort_by,
      page = 1,
      limit = 20,
    } = req.query;

    const filter = {};

    // Basic filters
    if (listing_type) filter.listing_type = listing_type;
    if (condition) filter.condition = condition;
    if (status) filter.status = status;
    else filter.status = "active"; // Default: chỉ lấy active
    if (seller_id) filter.seller_id = seller_id;
    if (is_featured !== undefined) filter.is_featured = is_featured === "true";

    // Price range
    if (min_price || max_price) {
      filter.selling_price = {};
      if (min_price) filter.selling_price.$gte = parseFloat(min_price);
      if (max_price) filter.selling_price.$lte = parseFloat(max_price);
    }

    // Search by item name/description
    if (search) {
      filter.$or = [{ description: { $regex: search, $options: "i" } }];
    }

    // Sort options
    let sortOption = { listed_at: -1 }; // Default: newest
    if (sort_by === "price_low") sortOption = { selling_price: 1 };
    if (sort_by === "price_high") sortOption = { selling_price: -1 };
    if (sort_by === "popular")
      sortOption = { view_count: -1, favorite_count: -1 };
    if (sort_by === "featured")
      sortOption = { is_featured: -1, last_boosted_at: -1 };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Populate item info để filter theo category, brand, color
    let listings = await MarketplaceListing.find(filter)
      .populate({
        path: "seller_id",
        select: "fullName avatar seller_rating total_sales is_verified_seller",
      })
      .populate({
        path: "item_id",
        populate: [
          { path: "category_id", select: "name value" },
          { path: "brand_id", select: "name value" },
          { path: "color_id", select: "name value" },
        ],
      })
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

    // Filter sau populate (nếu có category/brand/color)
    if (category_id || brand_id || color_id) {
      listings = listings.filter((listing) => {
        if (!listing.item_id) return false;

        if (
          category_id &&
          listing.item_id.category_id?._id.toString() !== category_id
        ) {
          return false;
        }
        if (brand_id && listing.item_id.brand_id?._id.toString() !== brand_id) {
          return false;
        }
        if (
          color_id &&
          !listing.item_id.color_id?.some((c) => c._id.toString() === color_id)
        ) {
          return false;
        }
        return true;
      });
    }

    const total = await MarketplaceListing.countDocuments(filter);

    res.json({
      success: true,
      data: listings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Lỗi khi lấy listings:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========================================
// 2. GET LISTING BY ID (với increment view)
// ========================================
exports.getListingById = async (req, res) => {
  try {
    const { id } = req.params;
    const { increment_view } = req.query;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid listing id",
      });
    }

    const listing = await MarketplaceListing.findById(id)
      .populate({
        path: "seller_id",
        select:
          "fullName avatar bio seller_rating total_sales is_verified_seller",
      })
      .populate({
        path: "item_id",
        populate: [
          { path: "category_id", select: "name value priority" },
          { path: "brand_id", select: "name value" },
          { path: "color_id", select: "name value" },
          { path: "season_id", select: "name value" },
          { path: "material_id", select: "name value" },
        ],
      })
      .populate(
        "swap_preferences.categories swap_preferences.brands",
        "name value"
      );

    if (!listing) {
      return res.status(404).json({
        success: false,
        error: "Listing không tồn tại",
      });
    }

    // Increment view count
    if (increment_view === "true") {
      await listing.incrementView();
    }

    res.json({
      success: true,
      data: listing,
    });
  } catch (error) {
    console.error("Error in getListingById:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========================================
// 3. CREATE LISTING
// ========================================
exports.createListing = async (req, res) => {
  try {
    const {
      seller_id,
      item_id,
      listing_type,
      selling_price,
      condition,
      condition_note,
      description,
      swap_preferences,
      shipping_method,
      shipping_fee,
      shipping_from_location,
    } = req.body;

    // Validation: Item phải tồn tại và thuộc về seller
    const item = await Item.findOne({ _id: item_id, user_id: seller_id });
    if (!item) {
      return res.status(404).json({
        success: false,
        error: "Item không tồn tại hoặc không thuộc về bạn",
      });
    }

    // Validation: Item không được đang bán/swap
    const existingListing = await MarketplaceListing.findOne({
      item_id,
      status: { $in: ["active", "pending"] },
    });

    if (existingListing) {
      return res.status(400).json({
        success: false,
        error: "Item này đã được đăng bán/swap",
      });
    }

    // Validation: Nếu listing_type = sell hoặc both, phải có selling_price
    if (
      (listing_type === "sell" || listing_type === "both") &&
      !selling_price
    ) {
      return res.status(400).json({
        success: false,
        error: "Giá bán là bắt buộc khi đăng bán",
      });
    }

    // Tạo listing
    const listing = new MarketplaceListing({
      seller_id,
      item_id,
      listing_type,
      original_price: item.price,
      selling_price: listing_type === "swap" ? undefined : selling_price,
      condition,
      condition_note,
      description,
      swap_preferences: listing_type === "sell" ? undefined : swap_preferences,
      shipping_method: shipping_method || "ghn",
      shipping_fee: shipping_fee || 0,
      shipping_from_location,
    });

    await listing.save();

    // Populate và trả về
    const populatedListing = await MarketplaceListing.findById(listing._id)
      .populate("seller_id", "fullName avatar seller_rating")
      .populate({
        path: "item_id",
        populate: [
          { path: "category_id", select: "name value" },
          { path: "brand_id", select: "name value" },
          { path: "color_id", select: "name value" },
        ],
      });

    res.status(201).json({
      success: true,
      message: "Đăng bán/swap thành công",
      data: populatedListing,
    });
  } catch (error) {
    console.error("Lỗi khi tạo listing:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========================================
// 4. UPDATE LISTING
// ========================================
exports.updateListing = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      listing_type,
      selling_price,
      condition,
      condition_note,
      description,
      swap_preferences,
      shipping_method,
      shipping_fee,
      shipping_from_location,
      status,
    } = req.body;

    const listing = await MarketplaceListing.findById(id);
    if (!listing) {
      return res.status(404).json({
        success: false,
        error: "Listing không tồn tại",
      });
    }

    // Không cho phép update nếu đã sold/swapped
    if (listing.status === "sold" || listing.status === "swapped") {
      return res.status(400).json({
        success: false,
        error: "Không thể sửa listing đã bán/swap",
      });
    }

    // Update fields
    if (listing_type) listing.listing_type = listing_type;
    if (selling_price !== undefined) listing.selling_price = selling_price;
    if (condition) listing.condition = condition;
    if (condition_note !== undefined) listing.condition_note = condition_note;
    if (description) listing.description = description;
    if (swap_preferences) listing.swap_preferences = swap_preferences;
    if (shipping_method) listing.shipping_method = shipping_method;
    if (shipping_fee !== undefined) listing.shipping_fee = shipping_fee;
    if (shipping_from_location)
      listing.shipping_from_location = shipping_from_location;
    if (status) listing.status = status;

    await listing.save();

    const updatedListing = await MarketplaceListing.findById(id)
      .populate("seller_id", "fullName avatar")
      .populate({
        path: "item_id",
        populate: [
          { path: "category_id", select: "name value" },
          { path: "brand_id", select: "name value" },
        ],
      });

    res.json({
      success: true,
      message: "Cập nhật listing thành công",
      data: updatedListing,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật listing:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========================================
// 5. DELETE LISTING (soft delete - set inactive)
// ========================================
exports.deleteListing = async (req, res) => {
  try {
    const { id } = req.params;

    const listing = await MarketplaceListing.findById(id);
    if (!listing) {
      return res.status(404).json({
        success: false,
        error: "Listing không tồn tại",
      });
    }

    // Chỉ cho phép delete nếu status = active hoặc pending
    if (listing.status !== "active" && listing.status !== "pending") {
      return res.status(400).json({
        success: false,
        error: "Không thể xóa listing này",
      });
    }

    listing.status = "inactive";
    await listing.save();

    res.json({
      success: true,
      message: "Xóa listing thành công",
    });
  } catch (error) {
    console.error("Lỗi khi xóa listing:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========================================
// 6. TOGGLE FAVORITE LISTING
// ========================================
exports.toggleFavorite = async (req, res) => {
  try {
    const { id } = req.params;
    const { increment = true } = req.body;

    const listing = await MarketplaceListing.findById(id);
    if (!listing) {
      return res.status(404).json({
        success: false,
        error: "Listing không tồn tại",
      });
    }

    await listing.toggleFavorite(increment);

    res.json({
      success: true,
      message: increment ? "Đã thêm vào yêu thích" : "Đã bỏ yêu thích",
      data: { favorite_count: listing.favorite_count },
    });
  } catch (error) {
    console.error("Lỗi toggle favorite:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========================================
// 7. BOOST LISTING (đẩy lên top)
// ========================================
exports.boostListing = async (req, res) => {
  try {
    const { id } = req.params;

    const listing = await MarketplaceListing.findById(id);
    if (!listing) {
      return res.status(404).json({
        success: false,
        error: "Listing không tồn tại",
      });
    }

    if (listing.status !== "active") {
      return res.status(400).json({
        success: false,
        error: "Chỉ có thể boost listing đang active",
      });
    }

    await listing.boost();

    res.json({
      success: true,
      message: "Boost listing thành công",
      data: {
        boost_count: listing.boost_count,
        last_boosted_at: listing.last_boosted_at,
      },
    });
  } catch (error) {
    console.error("Lỗi boost listing:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========================================
// 8. GET USER'S LISTINGS
// ========================================
exports.getUserListings = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, listing_type, page = 1, limit = 20 } = req.query;

    const filter = { seller_id: userId };
    if (status) filter.status = status;
    if (listing_type) filter.listing_type = listing_type;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const listings = await MarketplaceListing.find(filter)
      .populate({
        path: "item_id",
        populate: [
          { path: "category_id", select: "name value" },
          { path: "brand_id", select: "name value" },
        ],
      })
      .sort({ listed_at: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await MarketplaceListing.countDocuments(filter);

    res.json({
      success: true,
      data: listings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Lỗi lấy listings của user:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========================================
// 9. GET MARKETPLACE STATISTICS
// ========================================
exports.getMarketplaceStats = async (req, res) => {
  try {
    const totalListings = await MarketplaceListing.countDocuments({
      status: "active",
    });

    const totalSold = await MarketplaceListing.countDocuments({
      status: "sold",
    });

    const totalSwapped = await MarketplaceListing.countDocuments({
      status: "swapped",
    });

    const avgPrice = await MarketplaceListing.aggregate([
      { $match: { status: "active", selling_price: { $exists: true } } },
      { $group: { _id: null, avg: { $avg: "$selling_price" } } },
    ]);

    const topSellers = await MarketplaceListing.aggregate([
      { $match: { status: "sold" } },
      {
        $group: {
          _id: "$seller_id",
          total_sales: { $sum: 1 },
        },
      },
      { $sort: { total_sales: -1 } },
      { $limit: 10 },
    ]);

    // Populate seller info
    await User.populate(topSellers, {
      path: "_id",
      select: "fullName avatar seller_rating",
    });

    res.json({
      success: true,
      data: {
        totalListings,
        totalSold,
        totalSwapped,
        averagePrice: avgPrice[0]?.avg || 0,
        topSellers: topSellers.map((s) => ({
          seller: s._id,
          total_sales: s.total_sales,
        })),
      },
    });
  } catch (error) {
    console.error("Lỗi lấy thống kê marketplace:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========================================
// 10. SEARCH LISTINGS (Advanced)
// ========================================
exports.searchListings = async (req, res) => {
  try {
    const {
      q,
      category,
      brand,
      min_price,
      max_price,
      condition,
      page = 1,
      limit = 20,
    } = req.query;

    const filter = { status: "active" };

    // Price range
    if (min_price || max_price) {
      filter.selling_price = {};
      if (min_price) filter.selling_price.$gte = parseFloat(min_price);
      if (max_price) filter.selling_price.$lte = parseFloat(max_price);
    }

    if (condition) filter.condition = condition;

    // Text search
    if (q) {
      filter.$or = [{ description: { $regex: q, $options: "i" } }];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    let listings = await MarketplaceListing.find(filter)
      .populate({
        path: "seller_id",
        select: "fullName avatar seller_rating",
      })
      .populate({
        path: "item_id",
        populate: [
          { path: "category_id", select: "name value" },
          { path: "brand_id", select: "name value" },
          { path: "color_id", select: "name value" },
        ],
      })
      .sort({ view_count: -1, listed_at: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Filter by category/brand after populate
    if (category || brand) {
      listings = listings.filter((listing) => {
        if (!listing.item_id) return false;
        if (category && listing.item_id.category_id?.name !== category)
          return false;
        if (brand && listing.item_id.brand_id?.name !== brand) return false;
        return true;
      });
    }

    res.json({
      success: true,
      data: listings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: listings.length,
      },
    });
  } catch (error) {
    console.error("Lỗi search listings:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
