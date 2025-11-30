const Item = require("../models/Item");

// 1. Lấy danh sách tất cả món đồ
exports.getItems = async (req, res) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 }); // Mới nhất lên đầu
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 2. Thêm món đồ mới
exports.createItem = async (req, res) => {
  try {
    // req.body chứa dữ liệu Frontend gửi lên
    const newItem = new Item(req.body);
    const savedItem = await newItem.save();
    res.status(201).json(savedItem); // Trả về món đồ vừa lưu
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
