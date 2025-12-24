// backend/services/shippingService.js
const axios = require("axios");

/**
 * Service tính toán phí ship từ các đơn vị vận chuyển
 */

// Mock shipping rates - Trong thực tế call API của GHN, GHTK...
const SHIPPING_RATES = {
  ghn: {
    name: "Giao Hàng Nhanh",
    hanoi: { base: 25000, perKm: 2000, eta: { min: 1, max: 2 } },
    hcm: { base: 30000, perKm: 2500, eta: { min: 1, max: 2 } },
    nationwide: { base: 40000, perKm: 3000, eta: { min: 3, max: 5 } },
  },
  ghtk: {
    name: "Giao Hàng Tiết Kiệm",
    hanoi: { base: 20000, perKm: 1500, eta: { min: 2, max: 3 } },
    hcm: { base: 25000, perKm: 2000, eta: { min: 2, max: 3 } },
    nationwide: { base: 35000, perKm: 2500, eta: { min: 4, max: 7 } },
  },
  viettel_post: {
    name: "Viettel Post",
    hanoi: { base: 22000, perKm: 1800, eta: { min: 2, max: 3 } },
    hcm: { base: 27000, perKm: 2200, eta: { min: 2, max: 3 } },
    nationwide: { base: 38000, perKm: 2800, eta: { min: 3, max: 6 } },
  },
};

/**
 * Calculate shipping fee
 * @param {Object} params
 * @param {String} params.method - ghn, ghtk, viettel_post
 * @param {Object} params.from - { province, district, ward }
 * @param {Object} params.to - { province, district, ward }
 * @param {Number} params.weight - Gram
 * @returns {Object} { fee, eta: { min_days, max_days }, provider_name }
 */
exports.calculateShippingFee = async (params) => {
  const { method, from, to, weight = 500 } = params;

  // Validate
  if (!method || !from?.province || !to?.province) {
    throw new Error("Missing required shipping parameters");
  }

  const provider = SHIPPING_RATES[method];
  if (!provider) {
    throw new Error("Invalid shipping method");
  }

  // Determine region
  let region = "nationwide";
  const fromProvince = from.province.toLowerCase();
  const toProvince = to.province.toLowerCase();

  if (
    (fromProvince.includes("hà nội") && toProvince.includes("hà nội")) ||
    (fromProvince.includes("hanoi") && toProvince.includes("hanoi"))
  ) {
    region = "hanoi";
  } else if (
    (fromProvince.includes("hồ chí minh") && toProvince.includes("hồ chí minh")) ||
    (fromProvince.includes("ho chi minh") && toProvince.includes("ho chi minh")) ||
    (fromProvince.includes("hcm") && toProvince.includes("hcm"))
  ) {
    region = "hcm";
  }

  const rates = provider[region];

  // Calculate fee (simplified)
  // Trong thực tế: call API của đơn vị vận chuyển
  let fee = rates.base;

  // Add weight fee (if over 500g)
  if (weight > 500) {
    fee += Math.ceil((weight - 500) / 100) * 1000;
  }

  // Add distance fee (mock - should use real distance API)
  const mockDistance = region === "nationwide" ? 500 : 20;
  fee += mockDistance * (rates.perKm / 1000);

  return {
    fee: Math.round(fee),
    eta: rates.eta,
    provider_name: provider.name,
    method,
  };
};

/**
 * Get available shipping methods for a listing
 * @param {Object} listing - Marketplace listing
 * @param {Object} buyerAddress - Buyer's address
 * @returns {Array} Available shipping options with fees
 */
exports.getAvailableShippingMethods = async (listing, buyerAddress) => {
  const methods = [];

  // Check if platform shipping is enabled
  if (listing.shipping_config?.platform_shipping_enabled) {
    // Calculate fees for each provider
    const providers = ["ghn", "ghtk", "viettel_post"];

    for (const provider of providers) {
      try {
        const result = await this.calculateShippingFee({
          method: provider,
          from: {
            province: listing.shipping_from_location?.province,
            district: listing.shipping_from_location?.district,
            ward: listing.shipping_from_location?.ward,
          },
          to: {
            province: buyerAddress.province?.name || buyerAddress.province,
            district: buyerAddress.district?.name || buyerAddress.district,
            ward: buyerAddress.ward?.name || buyerAddress.ward,
          },
        });

        methods.push({
          id: provider,
          name: result.provider_name,
          fee: result.fee,
          eta: result.eta,
          type: "platform",
        });
      } catch (error) {
        console.error(`Error calculating ${provider} fee:`, error);
      }
    }
  }

  // Check if self delivery is enabled
  if (listing.shipping_config?.self_delivery_enabled) {
    methods.push({
      id: "self_delivery",
      name: "Tự giao hàng",
      fee: listing.shipping_config?.fixed_shipping_fee || 0,
      eta: { min_days: 1, max_days: 3 },
      type: "self",
      note: listing.shipping_config?.shipping_note,
    });

    methods.push({
      id: "meetup",
      name: "Gặp mặt trực tiếp",
      fee: 0,
      eta: null,
      type: "meetup",
      note: "Liên hệ với người bán để hẹn địa điểm",
    });
  }

  return methods;
};

/**
 * Validate shipping region
 */
exports.canShipToRegion = (listing, buyerProvince) => {
  const regions = listing.shipping_config?.shipping_regions || ["nationwide"];

  if (regions.includes("nationwide")) return true;

  const province = buyerProvince.toLowerCase();

  if (regions.includes("hanoi") && province.includes("hà nội")) {
    return true;
  }

  if (
    regions.includes("hcm") &&
    (province.includes("hồ chí minh") || province.includes("ho chi minh"))
  ) {
    return true;
  }

  return false;
};

module.exports = exports;