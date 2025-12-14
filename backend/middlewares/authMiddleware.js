// backend/middlewares/authMiddleware.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ========================================
// 1. AUTHENTICATE - Xác thực user
// ========================================
exports.authenticate = async (req, res, next) => {
  try {
    // Lấy token từ header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized - Token không tồn tại",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized - Token không hợp lệ",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Lấy thông tin user từ database
    const user = await User.findById(decoded.id)
      .select("-password")
      .populate("role", "name");

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "User không tồn tại",
      });
    }

    if (user.status !== "Active") {
      return res.status(403).json({
        success: false,
        error: "Tài khoản đã bị vô hiệu hóa",
      });
    }

    // Gắn user vào request
    req.user = user;
    next();
  } catch (error) {
    console.error("Auth error:", error);
    
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        error: "Token không hợp lệ",
      });
    }
    
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        error: "Token đã hết hạn",
      });
    }

    return res.status(500).json({
      success: false,
      error: "Lỗi xác thực",
    });
  }
};

// ========================================
// 2. AUTHORIZE - Phân quyền theo role
// ========================================
exports.authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized - Vui lòng đăng nhập",
      });
    }

    const userRole = req.user.role?.name;

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: `Forbidden - Chỉ ${allowedRoles.join(", ")} mới có quyền truy cập`,
      });
    }

    next();
  };
};

// ========================================
// 3. CHECK OWNERSHIP - Kiểm tra quyền sở hữu
// ========================================
// Dùng cho listing, order, swap request
exports.checkOwnership = (Model, paramKey = "id", ownerField = "seller_id") => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[paramKey];
      const resource = await Model.findById(resourceId);

      if (!resource) {
        return res.status(404).json({
          success: false,
          error: "Resource không tồn tại",
        });
      }

      // Admin có full quyền
      if (req.user.role?.name === "Admin") {
        req.resource = resource;
        return next();
      }

      // Kiểm tra ownership
      const ownerId = resource[ownerField]?.toString();
      const userId = req.user._id.toString();

      if (ownerId !== userId) {
        return res.status(403).json({
          success: false,
          error: "Forbidden - Bạn không có quyền truy cập resource này",
        });
      }

      req.resource = resource;
      next();
    } catch (error) {
      console.error("Ownership check error:", error);
      return res.status(500).json({
        success: false,
        error: "Lỗi kiểm tra quyền sở hữu",
      });
    }
  };
};

// ========================================
// 4. CHECK LISTING OWNERSHIP - Cho marketplace listings
// ========================================
exports.checkListingOwnership = async (req, res, next) => {
  try {
    const MarketplaceListing = require("../models/MarketplaceListing");
    const listingId = req.params.id;
    
    const listing = await MarketplaceListing.findById(listingId);

    if (!listing) {
      return res.status(404).json({
        success: false,
        error: "Listing không tồn tại",
      });
    }

    // Admin có full quyền
    if (req.user.role?.name === "Admin") {
      req.listing = listing;
      return next();
    }

    // Kiểm tra seller
    if (listing.seller_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: "Bạn không phải chủ của listing này",
      });
    }

    req.listing = listing;
    next();
  } catch (error) {
    console.error("Listing ownership error:", error);
    return res.status(500).json({
      success: false,
      error: "Lỗi kiểm tra quyền sở hữu listing",
    });
  }
};

// ========================================
// 5. CHECK ORDER ACCESS - Cho orders (buyer hoặc seller)
// ========================================
exports.checkOrderAccess = async (req, res, next) => {
  try {
    const Order = require("../models/Order");
    const orderId = req.params.id;
    
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order không tồn tại",
      });
    }

    // Admin có full quyền
    if (req.user.role?.name === "Admin") {
      req.order = order;
      return next();
    }

    const userId = req.user._id.toString();
    const isBuyer = order.buyer_id.toString() === userId;
    const isSeller = order.seller_id.toString() === userId;

    if (!isBuyer && !isSeller) {
      return res.status(403).json({
        success: false,
        error: "Bạn không có quyền truy cập order này",
      });
    }

    req.order = order;
    req.isBuyer = isBuyer;
    req.isSeller = isSeller;
    next();
  } catch (error) {
    console.error("Order access error:", error);
    return res.status(500).json({
      success: false,
      error: "Lỗi kiểm tra quyền truy cập order",
    });
  }
};

// ========================================
// 6. CHECK SWAP ACCESS - Cho swap requests
// ========================================
exports.checkSwapAccess = async (req, res, next) => {
  try {
    const SwapRequest = require("../models/SwapRequest");
    const swapId = req.params.id;
    
    const swapRequest = await SwapRequest.findById(swapId);

    if (!swapRequest) {
      return res.status(404).json({
        success: false,
        error: "Swap request không tồn tại",
      });
    }

    // Admin có full quyền
    if (req.user.role?.name === "Admin") {
      req.swapRequest = swapRequest;
      return next();
    }

    const userId = req.user._id.toString();
    const isRequester = swapRequest.requester_id.toString() === userId;
    const isReceiver = swapRequest.receiver_id.toString() === userId;

    if (!isRequester && !isReceiver) {
      return res.status(403).json({
        success: false,
        error: "Bạn không có quyền truy cập swap request này",
      });
    }

    req.swapRequest = swapRequest;
    req.isRequester = isRequester;
    req.isReceiver = isReceiver;
    next();
  } catch (error) {
    console.error("Swap access error:", error);
    return res.status(500).json({
      success: false,
      error: "Lỗi kiểm tra quyền truy cập swap",
    });
  }
};

// ========================================
// 7. OPTIONAL AUTH - Middleware không bắt buộc đăng nhập
// ========================================
exports.optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      // Không có token -> Tiếp tục nhưng req.user = null
      req.user = null;
      return next();
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.id)
      .select("-password")
      .populate("role", "name");

    req.user = user || null;
    next();
  } catch (error) {
    // Lỗi token -> Vẫn tiếp tục nhưng req.user = null
    req.user = null;
    next();
  }
};