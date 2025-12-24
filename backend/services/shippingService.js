// backend/services/shippingService.js

const SHIPPING_METHODS = {
  STANDARD: {
    id: "standard",
    name: "Giao hàng thường (Tiêu chuẩn)",
    type: "platform",
    min_days: 3,
    max_days: 5,
    base_fee: 30000,
    per_km: 5000,
    note: "Giao hàng tiêu chuẩn",
  },
  EXPRESS: {
    id: "express",
    name: "Giao hàng nhanh (Express)",
    type: "platform",
    min_days: 1,
    max_days: 2,
    base_fee: 50000,
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
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
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
  console.log("📦 getAvailableShippingMethods called");
  console.log("📦 Listing shipping_config:", listing.shipping_config);
  console.log("📍 Destination address:", {
    province: destinationAddress.province,
    district: destinationAddress.district,
    ward: destinationAddress.ward,
  });

  const availableMethods = [];
  const shippingConfig = listing.shipping_config || {};
  const sellerLocation = listing.shipping_from_location || {};

  console.log("🔧 Shipping config:", shippingConfig);

  // 1. Platform Shipping (Standard & Express)
  if (shippingConfig.platform_shipping_enabled !== false) {
    console.log("✅ Platform shipping is enabled");
    
    const shippingRegions = shippingConfig.shipping_regions || [];
    const destProvinceName = destinationAddress.province?.name || destinationAddress.province;
    
    console.log("🗺️ Checking regions:");
    console.log("  - Shipping regions:", shippingRegions);
    console.log("  - Destination province:", destProvinceName);

    // ⭐ FIX: Nếu không có shipping_regions hoặc có "nationwide", cho phép giao hàng
    const canShipToProvince = 
      shippingRegions.length === 0 || 
      shippingRegions.includes("nationwide") ||
      shippingRegions.some(region => {
        const regionLower = (region || "").toLowerCase().trim();
        const provinceLower = (destProvinceName || "").toLowerCase().trim();
        
        console.log(`  - Comparing: "${regionLower}" vs "${provinceLower}"`);
        
        // Check exact match or contains
        return regionLower === provinceLower || 
               regionLower.includes(provinceLower) ||
               provinceLower.includes(regionLower);
      });

    console.log("✅ Can ship to province:", canShipToProvince);

    if (canShipToProvince) {
      const standardFee = shippingConfig.fixed_shipping_fee || 30000;
      const expressFee = shippingConfig.fixed_shipping_fee
        ? Math.round(shippingConfig.fixed_shipping_fee * 1.5)
        : 50000;

      availableMethods.push({
        ...SHIPPING_METHODS.STANDARD,
        fee: standardFee,
        eta: {
          min_days: SHIPPING_METHODS.STANDARD.min_days,
          max_days: SHIPPING_METHODS.STANDARD.max_days,
        },
      });

      availableMethods.push({
        ...SHIPPING_METHODS.EXPRESS,
        fee: expressFee,
        eta: {
          min_days: SHIPPING_METHODS.EXPRESS.min_days,
          max_days: SHIPPING_METHODS.EXPRESS.max_days,
        },
      });

      console.log("✅ Added platform shipping methods");
    } else {
      console.log("❌ Cannot ship to this province via platform");
    }
  } else {
    console.log("⚠️ Platform shipping is disabled");
  }

  // 2. Self Delivery
  if (shippingConfig.self_delivery_enabled !== false) {
    console.log("✅ Self delivery is enabled");
    
    availableMethods.push({
      ...SHIPPING_METHODS.SELF_DELIVERY,
      fee: 0,
      eta: {
        min_days: 1,
        max_days: 1,
      },
    });
  }

  // 3. Meetup
  // ⭐ FIX: Luôn cho phép meetup nếu không có config nào khác
  const destProvinceName = destinationAddress.province?.name || destinationAddress.province;
  const sellerProvinceName = sellerLocation.province?.name || sellerLocation.province;
  
  const sameProvince =
    destProvinceName &&
    sellerProvinceName &&
    (destProvinceName.toLowerCase().trim() === sellerProvinceName.toLowerCase().trim());

  console.log("🤝 Meetup check:");
  console.log("  - Same province:", sameProvince);
  console.log("  - Seller province:", sellerProvinceName);
  console.log("  - Buyer province:", destProvinceName);

  if (sameProvince || shippingConfig.meetup_enabled !== false) {
    availableMethods.push({
      ...SHIPPING_METHODS.MEETUP,
      fee: 0,
      eta: null,
    });
    console.log("✅ Added meetup method");
  }

  console.log("📦 Total available methods:", availableMethods.length);
  console.log("📦 Methods:", availableMethods.map(m => m.name));

  // ⭐ FIX: Nếu không có method nào, trả về meetup làm fallback
  if (availableMethods.length === 0) {
    console.log("⚠️ No methods available, adding meetup as fallback");
    return [SHIPPING_METHODS.MEETUP];
  }

  return availableMethods;
}

/**
 * Check if seller can ship to a specific region
 */
function canShipToRegion(listing, provinceName) {
  console.log("🔍 canShipToRegion called");
  console.log("  - Province:", provinceName);
  
  const shippingConfig = listing.shipping_config || {};
  const shippingRegions = shippingConfig.shipping_regions || [];

  console.log("  - Shipping regions:", shippingRegions);

  // ⭐ FIX: Nếu không có regions hoặc có "nationwide", cho phép
  if (shippingRegions.length === 0 || shippingRegions.includes("nationwide")) {
    console.log("  ✅ Can ship (no restrictions or nationwide)");
    return true;
  }

  // Check if province is in allowed regions
  const canShip = shippingRegions.some((region) => {
    const regionLower = (region || "").toLowerCase().trim();
    const provinceLower = (provinceName || "").toLowerCase().trim();
    
    return (
      regionLower === provinceLower ||
      regionLower.includes(provinceLower) ||
      provinceLower.includes(regionLower)
    );
  });

  console.log("  ✅ Can ship result:", canShip);
  return canShip;
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