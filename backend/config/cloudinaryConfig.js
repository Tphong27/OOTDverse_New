// backend/config/cloudinaryConfig.js
const cloudinary = require("cloudinary").v2;

// Cấu hình Cloudinary từ environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload ảnh lên Cloudinary
 * @param {string} base64Image - Ảnh dạng base64 (data:image/...;base64,...)
 * @param {string} userId - User ID để tạo public_id
 * @param {object} options - Options bổ sung
 * @returns {Promise<object>} - Cloudinary upload result
 */
const uploadImage = async (base64Image, userId, options = {}) => {
  const defaultOptions = {
    folder: "ootdverse/avatars",
    public_id: `user_${userId}`,
    overwrite: true,
    resource_type: "image",
    transformation: [
      { width: 400, height: 400, crop: "fill", gravity: "face" },
      { quality: "auto", fetch_format: "auto" },
    ],
  };

  return cloudinary.uploader.upload(base64Image, {
    ...defaultOptions,
    ...options,
  });
};

/**
 * Xóa ảnh trên Cloudinary
 * @param {string} publicId - Public ID của ảnh
 * @returns {Promise<object>}
 */
const deleteImage = async (publicId) => {
  return cloudinary.uploader.destroy(publicId);
};

module.exports = {
  cloudinary,
  uploadImage,
  deleteImage,
};
