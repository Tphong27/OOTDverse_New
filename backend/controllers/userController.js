// backend/controllers/userController.js
const User = require("../models/User");
const { OAuth2Client } = require("google-auth-library");
const { getRoleIdByName } = require("../services/settingService");
// Lấy Client ID từ biến môi trường (Bạn cần thêm vào file .env backend)
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const { sendLoginSuccessEmail } = require("../services/emailService");

// 1. Đăng ký tài khoản mới
exports.register = async (req, res) => {
  try {
    const { email, password, fullName } = req.body;

    // Kiểm tra email trùng
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email này đã được sử dụng!" });
    }

    //TÌM ROLE CUSTOMER VÀ GÁN
    const customerRoleId = await getRoleIdByName("Customer");
    if (!customerRoleId) {
      console.error("Critical Error: 'Customer' Role ID not found in Setting.");
      return res.status(500).json({
        error: "Lỗi cấu hình hệ thống: Không tìm thấy Role 'Customer'.",
      });
    }
    const newUser = new User({
      email,
      password,
      fullName,
      role: customerRoleId,
    });
    // Tạo user mới (chưa có hồ sơ chi tiết)
    await newUser.save();

    //Lấy thông tin user đã populate role để trả về cho Frontend
    const populatedUser = await User.findById(newUser._id).populate(
      "role",
      "name value"
    );

    // Trả về thông tin user (trừ mật khẩu)
    res.status(201).json({
      success: true,
      user: {
        _id: newUser._id,
        email: newUser.email,
        fullName: newUser.fullName,
        role: populatedUser.role,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 2. Đăng nhập
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Tìm user
    // const user = await User.findOne({ email });
    const user = await User.findOne({ email }).populate("role", "name value");
    if (!user || user.password !== password) {
      // Lưu ý: password đang so sánh thô để test nhanh
      return res.status(401).json({ error: "Email hoặc mật khẩu không đúng!" });
    }

    if (!user.role) {
      const customerRoleId = await getRoleIdByName("Customer");
      if (customerRoleId) {
        user.role = customerRoleId;
        await user.save();
        // Populate lại sau khi save
        await user.populate("role", "name value");
      }
    }

    // Đăng nhập thành công
    res.json({
      success: true,
      user: {
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        // Trả về thêm cờ để biết đã điền hồ sơ chưa
        hasProfile: !!user.height,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 3. Cập nhật Hồ sơ Thời trang (Onboarding)
exports.updateProfile = async (req, res) => {
  try {
    const { userId, ...profileData } = req.body;

    // Đánh dấu là đã có profile nếu cập nhật thành công
    profileData.hasProfile = true;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: profileData },
      { new: true }
    );

    res.json({ success: true, user: updatedUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 4. Lấy thông tin chi tiết user (Kèm thông tin Setting)
exports.getProfile = async (req, res) => {
  try {
    const { userId } = req.query;

    // Populate để lấy chi tiết name, value từ bảng Setting dựa trên ID đã lưu
    const user = await User.findById(userId)
      .populate("role", "name value")
      .populate("favoriteStyles", "name value type")
      .populate("favoriteBrands", "name value type")
      .populate("favoriteColors", "name value type")
      .populate("favoriteOccasions", "name value type")
      .populate("avoidColors", "name value type");

    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 5. Đăng nhập bằng Google
exports.googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    // Xác thực token với Google Cloud
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    //Lấy ID Role Customer trước
    const customerRoleId = await getRoleIdByName("Customer");
    if (!customerRoleId) {
        throw new Error("Lỗi cấu hình: Không tìm thấy Role 'Customer'.");
    }

    // let user = await User.findOne({ email });
    let user = await User.findOne({ email }).populate("role", "name value");
    let isNewUser = false; // Biến cờ để đánh dấu người dùng mới

    if (user) {
      // Người dùng đã tồn tại: Cập nhật thông tin cơ bản nếu cần
      if (!user.role) {
            user.role = customerRoleId;
            await user.save();
            await user.populate("role", "name value"); 
      }
      // Người dùng cũ: Chỉ cập nhật avatar nếu chưa có
      if (!user.avatar) {
        user.avatar = picture;
        await user.save();
      }
    } else {
      // Người dùng mới: Tạo tài khoản
      isNewUser = true; // Đánh dấu là người dùng mới

      const randomPassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8);

      user = new User({
        email,
        fullName: name,
        password: randomPassword,
        avatar: picture,
        authType: "google",
        hasProfile: false,
        role: customerRoleId,
      });
      await user.save();

      user = await User.findById(user._id).populate("role", "name value");
    }

    // Chỉ gửi email nếu là người dùng mới (isNewUser = true)
    if (isNewUser) {
      // Bạn có thể đổi tên hàm thành sendWelcomeEmail cho phù hợp hơn
      // Hoặc vẫn dùng sendLoginSuccessEmail nhưng đổi nội dung template email
      sendLoginSuccessEmail(user.email, user.fullName, req)
        .then(() => console.log(`Welcome email sent to ${user.email}`))
        .catch((err) => console.error("Failed to send welcome email:", err));
    }

    // Trả về kết quả cho Frontend
    res.json({
      success: true,
      user: {
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
        avatar: user.avatar,
        role: user.role,
        hasProfile: !!user.height,
      },
    });
  } catch (err) {
    console.error("Google Login Error:", err);
    res.status(400).json({ error: "Đăng nhập Google thất bại." });
  }
};
