const SwapRequest = require("../models/SwapRequest");
const MarketplaceListing = require("../models/Marketplace");
const User = require("../models/User");

// ========================================
// 1. CREATE SWAP REQUEST (Gửi yêu cầu swap)
// ========================================
exports.createSwapRequest = async (req, res) => {
  try {
    const {
      requester_id,
      receiver_id,
      requester_listing_id,
      receiver_listing_id,
      requester_message,
      requester_address,
    } = req.body;

    // Validation: Không thể swap với chính mình
    if (requester_id === receiver_id) {
      return res.status(400).json({
        success: false,
        error: "Không thể swap với chính mình",
      });
    }

    // Validation: Cả 2 listings phải tồn tại và đang active
    const requesterListing = await MarketplaceListing.findById(
      requester_listing_id
    ).populate("item_id");

    const receiverListing = await MarketplaceListing.findById(
      receiver_listing_id
    ).populate("item_id");

    if (!requesterListing || !receiverListing) {
      return res.status(404).json({
        success: false,
        error: "Một hoặc cả 2 listings không tồn tại",
      });
    }

    if (
      requesterListing.status !== "active" ||
      receiverListing.status !== "active"
    ) {
      return res.status(400).json({
        success: false,
        error: "Listings phải ở trạng thái active",
      });
    }

    // Validation: Listings phải cho phép swap
    if (
      requesterListing.listing_type === "sell" ||
      receiverListing.listing_type === "sell"
    ) {
      return res.status(400).json({
        success: false,
        error: "Một hoặc cả 2 listings không cho phép swap",
      });
    }

    // Validation: Requester phải là chủ của requester_listing
    if (requesterListing.seller_id.toString() !== requester_id) {
      return res.status(403).json({
        success: false,
        error: "Bạn không phải chủ của listing này",
      });
    }

    // Validation: Receiver phải là chủ của receiver_listing
    if (receiverListing.seller_id.toString() !== receiver_id) {
      return res.status(400).json({
        success: false,
        error: "Listing này không thuộc về người nhận",
      });
    }

    // Kiểm tra đã có swap request pending chưa
    const existingRequest = await SwapRequest.findOne({
      requester_listing_id,
      receiver_listing_id,
      status: { $in: ["pending", "accepted", "in_progress"] },
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        error: "Đã có yêu cầu swap đang chờ xử lý",
      });
    }

    // Tạo swap request
    const swapRequest = new SwapRequest({
      requester_id,
      receiver_id,
      requester_listing_id,
      requester_item_id: requesterListing.item_id._id,
      receiver_listing_id,
      receiver_item_id: receiverListing.item_id._id,
      requester_message,
      requester_address,
    });

    await swapRequest.save();

    // Populate và trả về
    const populatedRequest = await SwapRequest.findById(swapRequest._id)
      .populate("requester_id", "fullName avatar")
      .populate("receiver_id", "fullName avatar")
      .populate({
        path: "requester_listing_id",
        populate: {
          path: "item_id",
          populate: { path: "category_id brand_id", select: "name value" },
        },
      })
      .populate({
        path: "receiver_listing_id",
        populate: {
          path: "item_id",
          populate: { path: "category_id brand_id", select: "name value" },
        },
      });

    res.status(201).json({
      success: true,
      message: "Gửi yêu cầu swap thành công",
      data: populatedRequest,
    });
  } catch (error) {
    console.error("Lỗi tạo swap request:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========================================
// 2. GET SWAP REQUEST BY ID
// ========================================
exports.getSwapRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    const swapRequest = await SwapRequest.findById(id)
      .populate("requester_id", "fullName avatar phone email")
      .populate("receiver_id", "fullName avatar phone email")
      .populate({
        path: "requester_listing_id",
        populate: {
          path: "item_id",
          populate: {
            path: "category_id brand_id color_id",
            select: "name value",
          },
        },
      })
      .populate({
        path: "receiver_listing_id",
        populate: {
          path: "item_id",
          populate: {
            path: "category_id brand_id color_id",
            select: "name value",
          },
        },
      });

    if (!swapRequest) {
      return res.status(404).json({
        success: false,
        error: "Swap request không tồn tại",
      });
    }

    // Check expired
    await swapRequest.checkExpired();

    res.json({
      success: true,
      data: swapRequest,
    });
  } catch (error) {
    console.error("Lỗi lấy swap request:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========================================
// 3. GET USER'S SWAP REQUESTS
// ========================================
exports.getUserSwapRequests = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role, status, page = 1, limit = 20 } = req.query;

    const filter = {};

    // role = "requester" hoặc "receiver"
    if (role === "requester") {
      filter.requester_id = userId;
    } else if (role === "receiver") {
      filter.receiver_id = userId;
    } else {
      // Nếu không chỉ định, lấy cả 2
      filter.$or = [{ requester_id: userId }, { receiver_id: userId }];
    }

    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const swapRequests = await SwapRequest.find(filter)
      .populate("requester_id", "fullName avatar")
      .populate("receiver_id", "fullName avatar")
      .populate({
        path: "requester_listing_id",
        populate: {
          path: "item_id",
          select: "item_name image_url",
        },
      })
      .populate({
        path: "receiver_listing_id",
        populate: {
          path: "item_id",
          select: "item_name image_url",
        },
      })
      .sort({ requested_at: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await SwapRequest.countDocuments(filter);

    res.json({
      success: true,
      data: swapRequests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Lỗi lấy swap requests:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========================================
// 4. ACCEPT SWAP REQUEST
// ========================================
exports.acceptSwapRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { receiver_message, receiver_address } = req.body;

    const swapRequest = await SwapRequest.findById(id);
    if (!swapRequest) {
      return res.status(404).json({
        success: false,
        error: "Swap request không tồn tại",
      });
    }

    if (swapRequest.status !== "pending") {
      return res.status(400).json({
        success: false,
        error: "Chỉ có thể chấp nhận yêu cầu đang pending",
      });
    }

    // Check expired
    await swapRequest.checkExpired();
    if (swapRequest.status === "expired") {
      return res.status(400).json({
        success: false,
        error: "Yêu cầu đã hết hạn",
      });
    }

    await swapRequest.accept(receiver_message);

    // Update receiver address
    if (receiver_address) {
      swapRequest.receiver_address = receiver_address;
      await swapRequest.save();
    }

    // Update listings status
    await MarketplaceListing.findByIdAndUpdate(
      swapRequest.requester_listing_id,
      { status: "pending" }
    );
    await MarketplaceListing.findByIdAndUpdate(
      swapRequest.receiver_listing_id,
      { status: "pending" }
    );

    const populatedRequest = await SwapRequest.findById(id)
      .populate("requester_id", "fullName avatar")
      .populate("receiver_id", "fullName avatar");

    res.json({
      success: true,
      message: "Chấp nhận swap thành công",
      data: populatedRequest,
    });
  } catch (error) {
    console.error("Lỗi accept swap:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========================================
// 5. REJECT SWAP REQUEST
// ========================================
exports.rejectSwapRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejection_reason } = req.body;

    const swapRequest = await SwapRequest.findById(id);
    if (!swapRequest) {
      return res.status(404).json({
        success: false,
        error: "Swap request không tồn tại",
      });
    }

    if (swapRequest.status !== "pending") {
      return res.status(400).json({
        success: false,
        error: "Chỉ có thể từ chối yêu cầu đang pending",
      });
    }

    await swapRequest.reject(rejection_reason);

    res.json({
      success: true,
      message: "Từ chối swap thành công",
      data: swapRequest,
    });
  } catch (error) {
    console.error("Lỗi reject swap:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========================================
// 6. CANCEL SWAP REQUEST (by requester)
// ========================================
exports.cancelSwapRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const swapRequest = await SwapRequest.findById(id);
    if (!swapRequest) {
      return res.status(404).json({
        success: false,
        error: "Swap request không tồn tại",
      });
    }

    if (!["pending", "accepted"].includes(swapRequest.status)) {
      return res.status(400).json({
        success: false,
        error: "Không thể hủy yêu cầu ở trạng thái này",
      });
    }

    await swapRequest.cancel();

    // Set listings về active
    await MarketplaceListing.findByIdAndUpdate(
      swapRequest.requester_listing_id,
      { status: "active" }
    );
    await MarketplaceListing.findByIdAndUpdate(
      swapRequest.receiver_listing_id,
      { status: "active" }
    );

    res.json({
      success: true,
      message: "Hủy swap thành công",
      data: swapRequest,
    });
  } catch (error) {
    console.error("Lỗi cancel swap:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========================================
// 7. UPDATE SHIPPING INFO
// ========================================
exports.updateShipping = async (req, res) => {
  try {
    const { id } = req.params;
    const { party, shipping_method, tracking_number } = req.body;

    if (!["requester", "receiver"].includes(party)) {
      return res.status(400).json({
        success: false,
        error: "Party phải là 'requester' hoặc 'receiver'",
      });
    }

    const swapRequest = await SwapRequest.findById(id);
    if (!swapRequest) {
      return res.status(404).json({
        success: false,
        error: "Swap request không tồn tại",
      });
    }

    if (swapRequest.status !== "accepted" && swapRequest.status !== "in_progress") {
      return res.status(400).json({
        success: false,
        error: "Chỉ có thể cập nhật shipping khi status = accepted hoặc in_progress",
      });
    }

    const shippingData = {
      method: shipping_method,
      tracking_number,
      shipped_at: new Date(),
    };

    await swapRequest.updateShipping(party, shippingData);

    res.json({
      success: true,
      message: "Cập nhật thông tin vận chuyển thành công",
      data: swapRequest,
    });
  } catch (error) {
    console.error("Lỗi update shipping:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========================================
// 8. MARK AS DELIVERED
// ========================================
exports.markDelivered = async (req, res) => {
  try {
    const { id } = req.params;
    const { party } = req.body;

    if (!["requester", "receiver"].includes(party)) {
      return res.status(400).json({
        success: false,
        error: "Party phải là 'requester' hoặc 'receiver'",
      });
    }

    const swapRequest = await SwapRequest.findById(id);
    if (!swapRequest) {
      return res.status(404).json({
        success: false,
        error: "Swap request không tồn tại",
      });
    }

    await swapRequest.markDelivered(party);

    // Nếu completed, update listings và user stats
    if (swapRequest.status === "completed") {
      await MarketplaceListing.findByIdAndUpdate(
        swapRequest.requester_listing_id,
        { status: "swapped" }
      );
      await MarketplaceListing.findByIdAndUpdate(
        swapRequest.receiver_listing_id,
        { status: "swapped" }
      );

      // Update user stats
      await User.findByIdAndUpdate(swapRequest.requester_id, {
        $inc: { total_swaps: 1 },
      });
      await User.findByIdAndUpdate(swapRequest.receiver_id, {
        $inc: { total_swaps: 1 },
      });
    }

    res.json({
      success: true,
      message:
        swapRequest.status === "completed"
          ? "Swap hoàn thành"
          : "Đã xác nhận nhận hàng",
      data: swapRequest,
    });
  } catch (error) {
    console.error("Lỗi mark delivered:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========================================
// 9. RATE SWAP PARTNER
// ========================================
exports.rateSwapPartner = async (req, res) => {
  try {
    const { id } = req.params;
    const { party, rating, review } = req.body;

    if (!["requester", "receiver"].includes(party)) {
      return res.status(400).json({
        success: false,
        error: "Party phải là 'requester' hoặc 'receiver'",
      });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: "Rating phải từ 1-5",
      });
    }

    const swapRequest = await SwapRequest.findById(id);
    if (!swapRequest) {
      return res.status(404).json({
        success: false,
        error: "Swap request không tồn tại",
      });
    }

    if (swapRequest.status !== "completed") {
      return res.status(400).json({
        success: false,
        error: "Chỉ có thể đánh giá khi swap hoàn thành",
      });
    }

    await swapRequest.rate(party, rating, review);

    res.json({
      success: true,
      message: "Đánh giá thành công",
      data: swapRequest,
    });
  } catch (error) {
    console.error("Lỗi rate swap:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========================================
// 10. GET SWAP STATISTICS
// ========================================
exports.getSwapStats = async (req, res) => {
  try {
    const { userId } = req.params;

    const filter = {
      $or: [{ requester_id: userId }, { receiver_id: userId }],
    };

    const totalSwaps = await SwapRequest.countDocuments(filter);
    const completedSwaps = await SwapRequest.countDocuments({
      ...filter,
      status: "completed",
    });
    const pendingSwaps = await SwapRequest.countDocuments({
      ...filter,
      status: "pending",
    });
    const rejectedSwaps = await SwapRequest.countDocuments({
      ...filter,
      status: "rejected",
    });

    res.json({
      success: true,
      data: {
        totalSwaps,
        completedSwaps,
        pendingSwaps,
        rejectedSwaps,
      },
    });
  } catch (error) {
    console.error("Lỗi lấy thống kê swap:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};