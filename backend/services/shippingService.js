// backend/services/shippingService.js

/**
 * Shipping Service - Handles shipping calculations and validations
 */

const SHIPPING_METHODS = {
  STANDARD: {
    id: "standard",
    name: "Giao hàng thường (Tiêu chuẩn)",
    type: "platform",
    min_days: 3,
    max_days: 5,
    base_fee: 30000, // VND
    per_km: 5000,
    note: "Giao hàng tiêu chuẩn",
  },
  EXPRESS: {
    id: "express",
    name: "Giao hàng nhanh (Express)",
    type: "platform",
    min_days: 1,
    max_days: 2,
    base_fee: 50000, // VND
    per_km: 8000,
    note: "Giao hàng nhanh trong 1-2 ngày",
  },
  SELF_DELIVERY: {
    id: "self_delivery",
    name: "Tự giao (Self Delivery)",
    type: "self",
    min_days: 1,
    max_days: 1,
    base_fee: 0,
    per_km: 0,
    note: "Giao hàng tự mình (không phí vận chuyển)",
  },
  MEETUP: {
    id: "meetup",
    name: "Gặp mặt (Meet Up)",
    type: "meetup",
    min_days: 0,
    max_days: 0,
    base_fee: 0,
    per_km: 0,
    note: "Gặp trực tiếp để giao hàng",
  },
};

/**
 * Calculate distance between two coordinates (Haversine formula)
 * Returns distance in km
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
}

/**
 * Get available shipping methods for a listing and destination address
 */
async function getAvailableShippingMethods(listing, destinationAddress) {
  const availableMethods = [];

  // Get listing's shipping configuration
  const shippingConfig = listing.shipping_config || {};
  const sellerLocation = listing.shipping_from_location || listing.location || {};

  // Check each shipping method
  // 1. Platform Shipping (Standard & Express)
  if (shippingConfig.platform_shipping_enabled !== false) {
    // Check if can ship to this province
    const shippingRegions = shippingConfig.shipping_regions || [];
    const destProvince = destinationAddress.province?.name || destinationAddress.province;
    
    const canShipToProvince = shippingRegions.length === 0 || 
      shippingRegions.some(region => 
        region.toLowerCase() === destProvince.toLowerCase() ||
        (region === "nationwide")
      );

    if (canShipToProvince) {
      // For now, use fixed fee or base calculation without exact coordinates
      let standardFee = shippingConfig.fixed_shipping_fee || 30000;
      let expressFee = shippingConfig.fixed_shipping_fee ? 
        Math.round(shippingConfig.fixed_shipping_fee * 1.5) : 50000;

      // Add Standard method
      availableMethods.push({
        ...SHIPPING_METHODS.STANDARD,
        fee: standardFee,
        eta: {
          min_days: SHIPPING_METHODS.STANDARD.min_days,
          max_days: SHIPPING_METHODS.STANDARD.max_days,
        },
      });

      // Add Express method
      availableMethods.push({
        ...SHIPPING_METHODS.EXPRESS,
        fee: expressFee,
        eta: {
          min_days: SHIPPING_METHODS.EXPRESS.min_days,
          max_days: SHIPPING_METHODS.EXPRESS.max_days,
        },
      });
    }
  }

  // 2. Self Delivery
  if (shippingConfig.self_delivery_enabled !== false) {
    availableMethods.push({
      ...SHIPPING_METHODS.SELF_DELIVERY,
      fee: 0,
      eta: {
        min_days: 1,
        max_days: 1,
      },
    });
  }

  // 3. Meetup (if both are in same province)
  const sameProvince = 
    destinationAddress.province?.name?.toLowerCase() === sellerLocation.province?.toLowerCase() ||
    destinationAddress.province?.toLowerCase() === sellerLocation.province?.toLowerCase();

  if (sameProvince && shippingConfig.meetup_enabled !== false) {
    availableMethods.push({
      ...SHIPPING_METHODS.MEETUP,
      fee: 0,
      eta: {
        min_days: 0,
        max_days: 0,
      },
    });
  }

  return availableMethods.length > 0 ? availableMethods : [SHIPPING_METHODS.MEETUP];
}

/**
 * Check if seller can ship to a specific region
 */
function canShipToRegion(listing, provinceName) {
  const shippingConfig = listing.shipping_config || {};
  const shippingRegions = shippingConfig.shipping_regions || [];

  // If no regions specified, can ship everywhere
  if (shippingRegions.length === 0) {
    return true;
  }

  // Check if province is in allowed regions
  return shippingRegions.some(
    region => 
      region === provinceName || 
      region.toLowerCase() === provinceName.toLowerCase()
  );
}

/**
 * Calculate total shipping fee
 */
function calculateShippingFee(method, distance = 0) {
  if (!method || !method.fee) {
    return 0;
  }
  return method.fee;
}

/**
 * Validate shipping method for a listing
 */
function validateShippingMethod(listing, method) {
  const shippingConfig = listing.shipping_config || {};

  switch (method.type) {
    case "platform":
      return shippingConfig.platform_shipping_enabled !== false;
    case "self":
      return shippingConfig.self_delivery_enabled !== false;
    case "meetup":
      return shippingConfig.meetup_enabled !== false;
    default:
      return false;
  }
}

module.exports = {
  getAvailableShippingMethods,
  canShipToRegion,
  calculateShippingFee,
  validateShippingMethod,
  calculateDistance,
  SHIPPING_METHODS,
};
