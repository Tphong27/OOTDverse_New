const Order = require("../models/Order");
const MarketplaceListing = require("../models/Marketplace");
const User = require("../models/User");
const Item = require("../models/Item");
const Address = require("../models/Address");

// ========================================
// 1. CREATE ORDER (Tạo đơn hàng)
// ========================================
// backend/controllers/orderController.js
exports.createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { shipping_address_id, listing_id, payment_method } = req.body;

    // 1️⃣ Validate address
    const address = await Address.findOne({
      _id: shipping_address_id,
      user_id: userId,
    });

    if (!address) {
      return res.status(400).json({
        message: "Địa chỉ không hợp lệ",
      });
    }

    // 2️⃣ Get listing info
    const listing = await MarketplaceListing.findById(listing_id).populate(
      "item_id"
    ); // ✅ Populate để lấy thông tin item

    if (!listing) {
      return res.status(400).json({
        message: "Listing không tồn tại",
      });
    }

    // ✅ Check if listing is available
    if (listing.status !== "active") {
      return res.status(400).json({
        message: "Sản phẩm không còn bán",
      });
    }

    // 2️⃣ Snapshot address
    const shippingAddressSnapshot = {
      recipient_name: address.full_name,
      phone: address.phone,
      province: address.province?.name || address.province,
      district: address.district?.name || address.district,
      ward: address.ward?.name || address.ward,
      street: address.street,
      location: address.location,
    };

    // 3️⃣ Calculate amounts
    const item_price = listing.selling_price;
    const shipping_fee = listing.shipping_fee || 0;
    const platform_fee = item_price * 0.05;
    const total_amount = item_price + shipping_fee + platform_fee;

    // 4️⃣ Create order
    const order = await Order.create({
      buyer_id: userId,
      seller_id: listing.seller_id, // ✅ Từ listing
      listing_id: listing._id,
      item_id: listing.item_id._id,
      item_price,
      shipping_fee,
      platform_fee,
      total_amount,
      shipping_method: listing.shipping_method || "ghn",
      shipping_address: shippingAddressSnapshot,
      payment_method,
      order_status: "pending_payment",
      payment_status: "pending",
    });

    // 5️⃣ Populate full order info
    const populatedOrder = await Order.findById(order._id)
      .populate("buyer_id", "fullName avatar phone email")
      .populate("seller_id", "fullName avatar phone email seller_rating")
      .populate({
        path: "listing_id",
        populate: {
          path: "item_id",
          populate: [
            { path: "category_id", select: "name value" },
            { path: "brand_id", select: "name value" },
          ],
        },
      })
      .populate({
        path: "item_id",
        populate: [
          { path: "category_id", select: "name value" },
          { path: "brand_id", select: "name value" },
        ],
      });

    res.status(201).json({
      success: true,
      data: populatedOrder,
    });
  } catch (err) {
    console.error("❌ Create order error:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ========================================
// 2. GET ORDER BY ID
// ========================================
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id)
      .populate("shipping_address_id")
      .populate("buyer_id", "fullName avatar phone email")
      .populate("seller_id", "fullName avatar phone email seller_rating")
      .populate({
        path: "listing_id",
        populate: {
          path: "item_id",
          populate: [
            { path: "category_id", select: "name value" },
            { path: "brand_id", select: "name value" },
            { path: "color_id", select: "name value" },
          ],
        },
      })
      .populate({
        path: "item_id",
        populate: [
          { path: "category_id", select: "name value" },
          { path: "brand_id", select: "name value" },
        ],
      });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order không tồn tại",
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Lỗi khi lấy order:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========================================
// 3. GET USER'S ORDERS (Buyer hoặc Seller)
// ========================================
exports.getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role, status, page = 1, limit = 20 } = req.query;

    const filter = {};

    // role = "buyer" hoặc "seller"
    if (role === "buyer") {
      filter.buyer_id = userId;
    } else if (role === "seller") {
      filter.seller_id = userId;
    } else {
      // Nếu không chỉ định, lấy cả 2
      filter.$or = [{ buyer_id: userId }, { seller_id: userId }];
    }

    if (status) filter.order_status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const orders = await Order.find(filter)
      .populate("listing_id")
      .populate("buyer_id", "fullName avatar")
      .populate("seller_id", "fullName avatar")
      .populate({
        path: "item_id",
        populate: { path: "category_id", select: "name value" },
      })
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(filter);

    res.json({
      success: true,
      data: orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Lỗi lấy orders của user:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========================================
// 4. UPDATE ORDER STATUS
// ========================================
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, tracking_number } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order không tồn tại",
      });
    }

    // Validation status flow
    const validTransitions = {
      pending_payment: ["paid", "cancelled"],
      paid: ["preparing", "cancelled"],
      preparing: ["shipping", "cancelled"],
      shipping: ["delivered"],
      delivered: ["completed", "refunded"],
    };

    if (!validTransitions[order.order_status]?.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Không thể chuyển từ ${order.order_status} sang ${status}`,
      });
    }

    await order.updateStatus(status);

    // Update tracking number nếu có
    if (tracking_number) {
      order.tracking_number = tracking_number;
      await order.save();
    }

    // Nếu completed, update listing status thành sold
    if (status === "completed") {
      const listing = await MarketplaceListing.findById(order.listing_id);
      if (listing) {
        await listing.markAsSold();
      }

      // Update seller stats
      await User.findByIdAndUpdate(order.seller_id, {
        $inc: { total_sales: 1 },
      });

      // Update buyer stats
      await User.findByIdAndUpdate(order.buyer_id, {
        $inc: { total_purchases: 1 },
      });
    }

    const updatedOrder = await Order.findById(id)
      .populate("buyer_id", "fullName avatar")
      .populate("seller_id", "fullName avatar");

    res.json({
      success: true,
      message: "Cập nhật trạng thái thành công",
      data: updatedOrder,
    });
  } catch (error) {
    console.error("Lỗi update order status:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========================================
// 5. UPDATE PAYMENT STATUS
// ========================================
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_status, transaction_id } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order không tồn tại",
      });
    }

    await order.updatePaymentStatus(payment_status, transaction_id);

    res.json({
      success: true,
      message: "Cập nhật thanh toán thành công",
      data: {
        payment_status: order.payment_status,
        order_status: order.order_status,
      },
    });
  } catch (error) {
    console.error("Lỗi update payment:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========================================
// 6. CANCEL ORDER
// ========================================
exports.cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, cancelled_by } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order không tồn tại",
      });
    }

    // Chỉ cho phép cancel khi status <= preparing
    if (
      !["pending_payment", "paid", "preparing"].includes(order.order_status)
    ) {
      return res.status(400).json({
        success: false,
        error: "Không thể hủy đơn hàng ở trạng thái này",
      });
    }

    await order.cancelOrder(reason, cancelled_by);

    // Set listing về active
    const listing = await MarketplaceListing.findById(order.listing_id);
    if (listing && listing.status === "pending") {
      listing.status = "active";
      await listing.save();
    }

    res.json({
      success: true,
      message: "Hủy đơn hàng thành công",
      data: order,
    });
  } catch (error) {
    console.error("Lỗi cancel order:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========================================
// 7. RATE ORDER (Buyer đánh giá Seller)
// ========================================
exports.rateSeller = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, review } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: "Rating phải từ 1-5",
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order không tồn tại",
      });
    }

    if (order.order_status !== "completed") {
      return res.status(400).json({
        success: false,
        error: "Chỉ có thể đánh giá khi đơn hàng hoàn thành",
      });
    }

    await order.rateSeller(rating, review);

    // Update seller rating
    const sellerOrders = await Order.find({
      seller_id: order.seller_id,
      buyer_rating: { $ne: null },
    });

    const avgRating =
      sellerOrders.reduce((sum, o) => sum + o.buyer_rating, 0) /
      sellerOrders.length;

    await User.findByIdAndUpdate(order.seller_id, {
      seller_rating: avgRating,
    });

    res.json({
      success: true,
      message: "Đánh giá thành công",
      data: {
        rating: order.buyer_rating,
        review: order.buyer_review,
      },
    });
  } catch (error) {
    console.error("Lỗi rate seller:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========================================
// 8. RATE BUYER (Seller đánh giá Buyer)
// ========================================
exports.rateBuyer = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, review } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: "Rating phải từ 1-5",
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order không tồn tại",
      });
    }

    if (order.order_status !== "completed") {
      return res.status(400).json({
        success: false,
        error: "Chỉ có thể đánh giá khi đơn hàng hoàn thành",
      });
    }

    await order.rateBuyer(rating, review);

    res.json({
      success: true,
      message: "Đánh giá thành công",
      data: {
        rating: order.seller_rating,
        review: order.seller_review,
      },
    });
  } catch (error) {
    console.error("Lỗi rate buyer:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========================================
// 9. GET ORDER STATISTICS
// ========================================
exports.getOrderStats = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.query;

    const filter =
      role === "buyer" ? { buyer_id: userId } : { seller_id: userId };

    const totalOrders = await Order.countDocuments(filter);
    const completedOrders = await Order.countDocuments({
      ...filter,
      order_status: "completed",
    });
    const cancelledOrders = await Order.countDocuments({
      ...filter,
      order_status: "cancelled",
    });

    const totalRevenue = await Order.aggregate([
      { $match: { ...filter, order_status: "completed" } },
      { $group: { _id: null, total: { $sum: "$total_amount" } } },
    ]);

    const avgOrderValue = await Order.aggregate([
      { $match: { ...filter, order_status: "completed" } },
      { $group: { _id: null, avg: { $avg: "$total_amount" } } },
    ]);

    res.json({
      success: true,
      data: {
        totalOrders,
        completedOrders,
        cancelledOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        averageOrderValue: avgOrderValue[0]?.avg || 0,
      },
    });
  } catch (error) {
    console.error("Lỗi lấy thống kê order:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
