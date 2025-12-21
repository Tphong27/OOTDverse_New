// backend/controllers/addressController.js
const Address = require("../models/Address");
// Tạo địa chỉ mới
const createAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      full_name,
      phone,
      province,
      district,
      ward,
      street,
      location, // ✅ Nhận { lat, lng }
      type,
      is_default,
      place_id,
    } = req.body;

    // ✅ Validation
    if (!full_name || !phone || !street || !location?.lat || !location?.lng) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin địa chỉ bắt buộc",
      });
    }

    // ✅ Nếu set default, bỏ default của các địa chỉ khác
    if (is_default) {
      await Address.updateMany({ user_id: userId }, { is_default: false });
    }

    // ✅ Tạo địa chỉ mới
    const address = await Address.create({
      user_id: userId,
      full_name,
      phone,
      province: province || { code: "", name: "" },
      district: district || { code: "", name: "" },
      ward: ward || { code: "", name: "" },
      street,
      place_id,
      type: type || "HOME",
      is_default: is_default || false,
      location: {
        type: "Point",
        coordinates: [location.lng, location.lat], // [lng, lat] - GeoJSON format
      },
    });

    res.status(201).json({
      success: true,
      data: address,
    });
  } catch (err) {
    console.error("❌ Create address error:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
// Lấy tất cả địa chỉ của user
const getMyAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({
      user_id: req.user.id,
    }).sort({ is_default: -1, createdAt: -1 });

    res.json(addresses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// Lấy địa chỉ mặc định của user
const getDefaultAddress = async (req, res) => {
  try {
    const address = await Address.findOne({
      user_id: req.user.id,
      is_default: true,
    });

    res.json(address);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Đặt địa chỉ mặc định
const setDefaultAddress = async (req, res) => {
  try {
    const { addressId } = req.params;

    await Address.updateMany({ user_id: req.user.id }, { is_default: false });

    await Address.findOneAndUpdate(
      { _id: addressId, user_id: req.user.id },
      { is_default: true }
    );

    res.json({ message: "Đã đặt địa chỉ mặc định" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createAddress,
  getMyAddresses,
  getDefaultAddress,
  setDefaultAddress,
};
