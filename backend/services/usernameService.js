// backend/services/usernameService.js

const User = require("../models/User");

/**
 * Regex cho username hợp lệ:
 * - 3-30 ký tự
 * - Chỉ a-z, 0-9, . (dấu chấm), _ (gạch dưới)
 * - Không bắt đầu hoặc kết thúc bằng . hoặc _
 */
const USERNAME_REGEX = /^(?![._])(?!.*[._]$)[a-zA-Z0-9._]{3,30}$/;

/**
 * Validate username format
 * @param {string} username
 * @returns {{ valid: boolean, error?: string }}
 */
const validateUsername = (username) => {
  if (!username) {
    return { valid: false, error: "Username là bắt buộc." };
  }

  if (username.length < 3) {
    return { valid: false, error: "Username phải có ít nhất 3 ký tự." };
  }

  if (username.length > 30) {
    return { valid: false, error: "Username không được quá 30 ký tự." };
  }

  if (!USERNAME_REGEX.test(username)) {
    return {
      valid: false,
      error: "Username chỉ được chứa chữ cái, số, dấu chấm (.) và gạch dưới (_). Không được bắt đầu hoặc kết thúc bằng . hoặc _",
    };
  }

  return { valid: true };
};

/**
 * Check if username is available (not taken)
 * @param {string} username
 * @returns {Promise<boolean>}
 */
const isUsernameAvailable = async (username) => {
  const existing = await User.findOne({ username: username.toLowerCase() });
  return !existing;
};

/**
 * Generate unique username from email prefix
 * @param {string} email
 * @returns {Promise<string>}
 */
const generateUniqueUsername = async (email) => {
  // Lấy phần trước @ và loại bỏ ký tự không hợp lệ
  let base = email.split("@")[0]
    .replace(/\+.*$/, "")  // Loại bỏ +alias (ví dụ: user+test@gmail.com -> user)
    .replace(/[^a-zA-Z0-9._]/g, "")  // Loại bỏ ký tự không hợp lệ
    .replace(/^[._]+|[._]+$/g, "")   // Loại bỏ . hoặc _ ở đầu/cuối
    .toLowerCase();

  // Đảm bảo đủ độ dài tối thiểu
  if (base.length < 3) {
    base = base.padEnd(3, "x");  // Thêm 'x' để đủ 3 ký tự
  }

  // Cắt nếu quá dài (để còn chỗ cho số random)
  if (base.length > 20) {
    base = base.substring(0, 20);
  }

  // Kiểm tra xem username base có available không
  if (await isUsernameAvailable(base)) {
    return base;
  }

  // Nếu đã tồn tại, thêm số random
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000); // 1000-9999
    const candidate = `${base}${randomSuffix}`;

    if (await isUsernameAvailable(candidate)) {
      return candidate;
    }
    attempts++;
  }

  // Fallback: Thêm timestamp
  const timestamp = Date.now().toString().slice(-6);
  return `${base}${timestamp}`;
};

module.exports = {
  validateUsername,
  isUsernameAvailable,
  generateUniqueUsername,
  USERNAME_REGEX,
};
