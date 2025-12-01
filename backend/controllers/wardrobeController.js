// backend/controllers/wardrobeController.js
const Item = require("../models/Item");

// 1. Lấy danh sách (Chỉ lấy đồ của userId được gửi lên)
exports.getItems = async (req, res) => {
  try {
    const { userId } = req.query; // Lấy userId từ thanh địa chỉ (query param)

    // Nếu không có userId, trả về danh sách rỗng (bảo mật cơ bản)
    if (!userId) {
      return res.json([]);
    }

    // Chỉ tìm những món đồ có userId khớp với người đang hỏi
    const items = await Item.find({ userId }).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 2. Thêm món đồ mới (Gắn userId vào món đồ)
exports.createItem = async (req, res) => {
  try {
    // Tách userId ra khỏi dữ liệu gửi lên
    const { userId, ...itemData } = req.body;

    // Kiểm tra xem có userId không
    if (!userId) {
      return res
        .status(400)
        .json({ error: "Thiếu thông tin người dùng (userId)" });
    }

    // Tạo món đồ mới với userId đã tách
    const newItem = new Item({ ...itemData, userId });
    const savedItem = await newItem.save();

    res.status(201).json(savedItem);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
