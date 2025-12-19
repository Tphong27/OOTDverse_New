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
    timeout: 120000, // 120 seconds timeout
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

/**
 * Upload ảnh wardrobe item lên Cloudinary
 * @param {string} base64Image - Ảnh dạng base64
 * @param {string} userId - User ID
 * @param {string} itemId - Item ID (optional, for updates)
 * @returns {Promise<string>} - Cloudinary secure URL
 */
const uploadWardrobeImage = async (base64Image, userId, itemId = null) => {
  const timestamp = Date.now();
  const publicId = itemId 
    ? `item_${userId}_${itemId}` 
    : `item_${userId}_${timestamp}`;
  
  const result = await cloudinary.uploader.upload(base64Image, {
    folder: "ootdverse/wardrobe",
    public_id: publicId,
    overwrite: true,
    resource_type: "image",
    timeout: 120000,
    transformation: [
      { width: 800, height: 800, crop: "limit" }, // Max 800px, keep aspect ratio
      { quality: "auto", fetch_format: "auto" },
    ],
  });
  
  return result.secure_url;
};

/**
 * Upload ảnh outfit lên Cloudinary (thumbnail hoặc full)
 * @param {string} base64Image - Ảnh dạng base64
 * @param {string} userId - User ID
 * @param {string} outfitId - Outfit ID (optional)
 * @param {string} type - 'thumb' or 'full'
 * @returns {Promise<string>} - Cloudinary secure URL
 */
const uploadOutfitImage = async (base64Image, userId, outfitId = null, type = 'full') => {
  const timestamp = Date.now();
  const suffix = type === 'thumb' ? 'thumb' : 'full';
  const publicId = outfitId 
    ? `outfit_${userId}_${outfitId}_${suffix}` 
    : `outfit_${userId}_${timestamp}_${suffix}`;
  
  // Config cho outfit
  const options = {
    folder: "ootdverse/outfits",
    public_id: publicId,
    overwrite: true,
    resource_type: "image",
    timeout: 120000,
    transformation: [
      { quality: "auto", fetch_format: "auto" },
    ],
  };

  // Thumbnail resize nhỏ hơn
  if (type === 'thumb') {
    options.transformation.unshift({ width: 500, crop: "scale" });
  }

  const result = await cloudinary.uploader.upload(base64Image, options);
  return result.secure_url;
};

/**
 * Check if string is base64 image
 */
const isBase64Image = (str) => {
  return str && typeof str === "string" && str.startsWith("data:image/");
};

module.exports = {
  cloudinary,
  uploadImage,
  deleteImage,
  uploadWardrobeImage,
  uploadOutfitImage,
  isBase64Image,
};
