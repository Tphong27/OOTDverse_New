const Setting = require("../models/setting");

// 1. Lấy tất cả settings (có thể filter theo type và status)
exports.getSettings = async (req, res) => {
  try {
    const { type, status } = req.query;
    
    // Xây dựng filter động
    const filter = {};
    if (type) filter.type = type;
    if (status) filter.status = status;
    
    const settings = await Setting.find(filter)
      .sort({ priority: -1, createdAt: -1 }); // Ưu tiên cao lên đầu
    
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 2. Lấy settings theo type cụ thể (VD: chỉ lấy brands)
exports.getSettingsByType = async (req, res) => {
  try {
    const { type } = req.params;
    
    const settings = await Setting.find({ 
      type, 
      status: 'Active' 
    }).sort({ priority: -1, name: 1 });
    
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 3. Lấy 1 setting theo ID
exports.getSettingById = async (req, res) => {
  try {
    const setting = await Setting.findById(req.params.id);
    
    if (!setting) {
      return res.status(404).json({ error: "Setting not found" });
    }
    
    res.json(setting);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 4. Tạo setting mới
exports.createSetting = async (req, res) => {
  try {
    // DEBUG: Log data nhận được
    console.log("📥 Data nhận từ frontend:", req.body);
    
    const newSetting = new Setting(req.body);
    const savedSetting = await newSetting.save();
    
    console.log("✅ Lưu thành công:", savedSetting);
    res.status(201).json(savedSetting);
  } catch (err) {
    console.error("❌ Lỗi validation:", err.message);
    res.status(400).json({ error: err.message });
  }
};

// 5. Cập nhật setting
exports.updateSetting = async (req, res) => {
  try {
    const updatedSetting = await Setting.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    
    if (!updatedSetting) {
      return res.status(404).json({ error: "Setting not found" });
    }
    
    res.json(updatedSetting);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// 6. Xóa setting (soft delete - chuyển status thành Inactive)
exports.deleteSetting = async (req, res) => {
  try {
    const setting = await Setting.findByIdAndUpdate(
      req.params.id,
      { status: 'Inactive', updatedAt: Date.now() },
      { new: true }
    );
    
    if (!setting) {
      return res.status(404).json({ error: "Setting not found" });
    }
    
    res.json({ message: "Setting deactivated successfully", setting });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 7. Xóa vĩnh viễn (hard delete)
exports.permanentDeleteSetting = async (req, res) => {
  try {
    const setting = await Setting.findByIdAndDelete(req.params.id);
    
    if (!setting) {
      return res.status(404).json({ error: "Setting not found" });
    }
    
    res.json({ message: "Setting permanently deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 8. Lấy tất cả types có sẵn
exports.getSettingTypes = async (req, res) => {
  try {
    const types = await Setting.distinct("type");
    res.json(types);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};