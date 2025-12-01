const mongoose = require("mongoose");

const SettingSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  type: {     // enum: ['brand', 'color', 'season', 'weather', 'style', 'occasion', 'material', 'category',...]
    type: String, 
    required: true
  },
  priority: { 
    type: Number, 
    default: 0 
  },
  value: { 
    type: String,
    default: null
  },
  description: { 
    type: String,
    default: null
  },
  status: { 
    type: String, 
    enum: ['Active', 'Inactive'],
    default: 'Active'
  }
}, {
  timestamps: true
});

// Index để tìm kiếm nhanh
SettingSchema.index({ type: 1, status: 1 });
SettingSchema.index({ status: 1 });

module.exports = mongoose.model("Setting", SettingSchema);