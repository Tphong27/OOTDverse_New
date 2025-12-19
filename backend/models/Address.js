const mongoose = require("mongoose");

const AddressSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // === Contact info ===
    full_name: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      match: /^0\d{9}$/, // chuẩn VN
    },

    // === Administrative location (Shopee-style) ===
    province: {
      code: String,
      name: String,
    },
    district: {
      code: String,
      name: String,
    },
    ward: {
      code: String,
      name: String,
    },

    street: {
      type: String,
      required: true, // số nhà, tên đường
    },

    // === Map location (quan trọng nhất) ===
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true,
        index: "2dsphere",
      },
    },

    place_id: String, // Google / Mapbox place id

    // === Metadata ===
    type: {
      type: String,
      enum: ["HOME", "OFFICE"],
      default: "HOME",
    },

    is_default: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Address", AddressSchema);
