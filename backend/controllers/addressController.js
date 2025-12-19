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
      location,
      type,
      is_default,
      place_id,
    } = req.body;

    if (
      !full_name ||
      !phone ||
      !province ||
      !district ||
      !ward ||
      !street ||
      !location?.lat ||
      !location?.lng
    ) {
      return res.status(400).json({
        message: "Thiếu thông tin địa chỉ bắt buộc",
      });
    }

    if (is_default) {
      await Address.updateMany(
        { user_id: userId },
        { is_default: false }
      );
    }

    const address = await Address.create({
      user_id: userId,
      full_name,
      phone,
      province,
      district,
      ward,
      street,
      place_id,
      type,
      is_default,
      location: {
        type: "Point",
        coordinates: [location.lng, location.lat],
      },
    });

    res.status(201).json(address);
  } catch (err) {
    res.status(500).json({ message: err.message });
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

    await Address.updateMany(
      { user_id: req.user.id },
      { is_default: false }
    );

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
