// backend/routes/shippingRoutes.js
const express = require("express");
const router = express.Router();
const { authenticate } = require("../middlewares/authMiddleware");
const shippingService = require("../services/shippingService");
const MarketplaceListing = require("../models/Marketplace");
const Address = require("../models/Address");

/**
 * POST /api/marketplace/shipping/calculate
 * Calculate available shipping methods and fees
 */
router.post("/calculate", authenticate, async (req, res) => {
  try {
    const { listing_id, address_id } = req.body;
    const userId = req.user._id || req.user.id;

    console.log("🚚 Shipping calculate request:", {
      listing_id,
      address_id,
      userId,
    });

    if (!listing_id || !address_id) {
      return res.status(400).json({
        success: false,
        error: "Missing listing_id or address_id",
      });
    }

    // Get listing with populated fields
    const listing = await MarketplaceListing.findById(listing_id)
      .populate("seller_id")
      .populate("item_id");

    if (!listing) {
      return res.status(404).json({
        success: false,
        error: "Listing not found",
      });
    }

    // Get buyer address
    const address = await Address.findOne({
      _id: address_id,
      user_id: userId,
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        error: "Address not found",
      });
    }

    console.log("✅ Found listing and address:", {
      listing: listing._id,
      address: address._id,
    });

    // Check if can ship - nhưng KHÔNG chặn nếu false
    const destProvinceName = address.province?.name || address.province;
    const canShip = shippingService.canShipToRegion(listing, destProvinceName);

    console.log("🔍 Can ship to region:", canShip);

    // Get available shipping methods
    const shippingOptions = await shippingService.getAvailableShippingMethods(
      listing,
      address
    );

    console.log("📦 Shipping options returned:", shippingOptions.length);

    //s LUÔN trả về success nếu có ít nhất 1 method
    if (shippingOptions.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Người bán không hỗ trợ giao hàng đến khu vực này",
      });
    }

    res.json({
      success: true,
      data: shippingOptions,
    });
  } catch (error) {
    console.error("❌ Calculate shipping error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Không thể tính phí vận chuyển",
    });
  }
});

/**
 * POST /api/marketplace/shipping/validate
 * Validate if shipping is available
 */
router.post("/validate", authenticate, async (req, res) => {
  try {
    const { listing_id, province } = req.body;

    const listing = await MarketplaceListing.findById(listing_id);
    if (!listing) {
      return res.status(404).json({
        success: false,
        error: "Listing not found",
      });
    }

    const canShip = shippingService.canShipToRegion(listing, province);

    res.json({
      success: true,
      data: {
        can_ship: canShip,
        regions: listing.shipping_config?.shipping_regions || [],
        platform_enabled: listing.shipping_config?.platform_shipping_enabled,
        self_delivery_enabled: listing.shipping_config?.self_delivery_enabled,
      },
    });
  } catch (error) {
    console.error("Validate shipping error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;
