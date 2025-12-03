const bcrypt = require("bcryptjs");

// Validate mật khẩu: ít nhất 8 ký tự, 1 chữ hoa, 1 ký tự đặc biệt
const validatePassword = (password) => {
  if (typeof password !== "string") {
    return "Mật khẩu phải là chuỗi ký tự.";
  }
  if (password.length < 8) {
    return "Mật khẩu phải dài ít nhất 8 ký tự.";
  }
  if (!/[A-Z]/.test(password)) {
    return "Mật khẩu phải chứa ít nhất 1 chữ cái in hoa.";
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return "Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt.";
  }
  return null; // Valid
};

// Validate ngày: không lớn hơn hôm nay
const validateDateNotFuture = (dateString) => {
  if (!dateString) return null;
  const inputDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset giờ để so sánh ngày
  if (isNaN(inputDate.getTime())) {
    return "Ngày không hợp lệ.";
  }
  if (inputDate > today) {
    return "Ngày không được lớn hơn hôm nay.";
  }
  return null; // Valid
};

// Validate số điện thoại Việt Nam: bắt đầu bằng 0, 10 chữ số
const validatePhoneVN = (phone) => {
  const phoneRegex = /^0\d{9}$/;
  if (!phoneRegex.test(phone)) {
    return "Số điện thoại phải bắt đầu bằng 0 và có đúng 10 chữ số.";
  }
  return null; // Valid
};

// Validate email cơ bản
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Email không hợp lệ.";
  }
  return null; // Valid
};

// Export các hàm
module.exports = {
  validatePassword,
  validateDateNotFuture,
  validatePhoneVN,
  validateEmail,
  
};