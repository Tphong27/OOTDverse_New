// backend/controllers/userController.js
const User = require("../models/User");
const Setting = require("../models/setting");
const { OAuth2Client } = require("google-auth-library");
const { getRoleIdByName } = require("../services/settingService");
// Lấy Client ID từ biến môi trường (Bạn cần thêm vào file .env backend)
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const { sendLoginSuccessEmail, sendVerificationEmail } = require("../services/emailService");

const bcrypt = require("bcryptjs"); // bcrypt hash mật khẩu

const { validatePassword } = require("../services/validators");

// Helper function to generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// 1. Đăng ký tài khoản mới (Step 1: Send OTP)
exports.register = async (req, res) => {
  try {
    const { email, password, fullName } = req.body;

    // Validate mật khẩu
    const passwordError = validatePassword(password);
    if (passwordError) {
      return res.status(400).json({ error: passwordError });
    }

    // Kiểm tra email trùng (chỉ check user đã xác thực)
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      // Nếu user tồn tại nhưng chưa xác thực email, cho phép gửi lại OTP
      if (!existingUser.isEmailVerified) {
        // Cập nhật thông tin và gửi OTP mới
        const otpCode = generateOTP();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 phút

        existingUser.password = await bcrypt.hash(password, 10);
        existingUser.fullName = fullName;
        existingUser.emailVerificationCode = otpCode;
        existingUser.emailVerificationExpires = otpExpires;
        await existingUser.save();

        // Gửi email xác thực
        await sendVerificationEmail(email, fullName, otpCode);

        return res.status(200).json({
          success: true,
          message: "Mã xác thực đã được gửi đến email của bạn.",
          requireVerification: true,
          email: email,
        });
      }
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

    // Generate OTP
    const otpCode = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 phút

    // Hash mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo user mới với trạng thái chưa xác thực
    const newUser = new User({
      email,
      password: hashedPassword,
      fullName,
      role: customerRoleId,
      status: "Active",
      authType: "local",
      isEmailVerified: false,
      emailVerificationCode: otpCode,
      emailVerificationExpires: otpExpires,
    });

    await newUser.save();

    // Gửi email xác thực
    await sendVerificationEmail(email, fullName, otpCode);

    res.status(200).json({
      success: true,
      message: "Mã xác thực đã được gửi đến email của bạn.",
      requireVerification: true,
      email: email,
    });
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// 1.1 Xác thực Email (Step 2: Verify OTP)
exports.verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;

    const user = await User.findOne({ email }).populate("role", "name value");

    if (!user) {
      return res.status(400).json({ error: "Email không tồn tại trong hệ thống." });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ error: "Email đã được xác thực trước đó." });
    }

    // Kiểm tra OTP hết hạn
    if (new Date() > user.emailVerificationExpires) {
      return res.status(400).json({ error: "Mã xác thực đã hết hạn. Vui lòng yêu cầu mã mới." });
    }

    // Kiểm tra OTP đúng
    if (user.emailVerificationCode !== code) {
      return res.status(400).json({ error: "Mã xác thực không đúng." });
    }

    // Xác thực thành công
    user.isEmailVerified = true;
    user.emailVerificationCode = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Xác thực email thành công! Bạn có thể đăng nhập ngay.",
      user: {
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        status: user.status,
        authType: user.authType,
      },
    });
  } catch (err) {
    console.error("Verify Email Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// 1.2 Gửi lại mã xác thực
exports.resendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: "Email không tồn tại trong hệ thống." });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ error: "Email đã được xác thực trước đó." });
    }

    // Generate new OTP
    const otpCode = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 phút

    user.emailVerificationCode = otpCode;
    user.emailVerificationExpires = otpExpires;
    await user.save();

    // Gửi email xác thực mới
    await sendVerificationEmail(email, user.fullName, otpCode);

    res.status(200).json({
      success: true,
      message: "Mã xác thực mới đã được gửi đến email của bạn.",
    });
  } catch (err) {
    console.error("Resend Verification Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// 2. Đăng nhập
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Tìm user
    const user = await User.findOne({ email }).populate("role", "name value");

    if (!user) {
      return res.status(401).json({ error: "Email hoặc mật khẩu không đúng!" });
    }

    // Kiểm tra mật khẩu (so sánh với hash)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Email hoặc mật khẩu không đúng!" });
    }

    // Kiểm tra trạng thái tài khoản
    if (user.status === "Inactive") {
      return res.status(403).json({
        error: "Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên."
      });
    }

    // Nếu user chưa có role, gán role Customer mặc định
    if (!user.role) {
      const customerRoleId = await getRoleIdByName("Customer");
      if (customerRoleId) {
        user.role = customerRoleId;
        await user.save();
        await user.populate("role", "name value");
      }
    }

    // NẾU CHƯA CÓ STATUS, GÁN MẶC ĐỊNH
    if (!user.status) {
      user.status = "Active";
      await user.save();
    }

    // NẾU CHƯA CÓ AUTHTYPE, GÁN MẶC ĐỊNH
    if (!user.authType) {
      user.authType = "local";
      await user.save();
    }

    // Đăng nhập thành công
    res.json({
      success: true,
      user: {
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        status: user.status,
        authType: user.authType,
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

    let user = await User.findOne({ email }).populate("role", "name value");

    if (user) {
      // ======== USER ĐÃ TỒN TẠI ========

      // Kiểm tra nếu user chưa xác thực email (đăng ký local nhưng chưa verify)
      if (!user.isEmailVerified && user.authType === "local") {
        // Chuyển sang authType google và xác thực luôn
        user.authType = "google";
        user.isEmailVerified = true;
        user.emailVerificationCode = undefined;
        user.emailVerificationExpires = undefined;
        if (!user.avatar) user.avatar = picture;
        await user.save();
      }

      if (!user.role) {
        user.role = customerRoleId;
        await user.save();
        await user.populate("role", "name value");
      }

      if (!user.status) {
        user.status = "Active";
        await user.save();
      }

      // KIỂM TRA STATUS - KHÔNG CHO LOGIN NẾU INACTIVE
      if (user.status === "Inactive") {
        return res.status(403).json({
          error: "Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên."
        });
      }

      // Cập nhật avatar nếu chưa có
      if (!user.avatar) {
        user.avatar = picture;
        await user.save();
      }

      // Đăng nhập thành công cho user cũ
      return res.json({
        success: true,
        isNewUser: false,
        user: {
          _id: user._id,
          email: user.email,
          fullName: user.fullName,
          avatar: user.avatar,
          role: user.role,
          status: user.status,
          authType: user.authType,
          hasProfile: !!user.height,
        },
      });
    } else {
      // ======== USER MỚI - CẦN XÁC THỰC EMAIL ========

      // Generate OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 phút

      const randomPassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8);

      const hashedRandomPassword = await bcrypt.hash(randomPassword, 10);

      // Tạo user mới với trạng thái chưa xác thực
      user = new User({
        email,
        fullName: name,
        password: hashedRandomPassword,
        avatar: picture,
        authType: "google",
        status: "Active",
        hasProfile: false,
        role: customerRoleId,
        isEmailVerified: false,
        emailVerificationCode: otpCode,
        emailVerificationExpires: otpExpires,
      });
      await user.save();

      // Gửi email xác thực
      await sendVerificationEmail(email, name, otpCode);

      // Trả về yêu cầu xác thực OTP
      return res.json({
        success: true,
        isNewUser: true,
        requireVerification: true,
        email: email,
        fullName: name,
        avatar: picture,
        message: "Mã xác thực đã được gửi đến email của bạn.",
      });
    }
  } catch (err) {
    console.error("Google Login Error:", err);
    res.status(400).json({ error: "Đăng nhập Google thất bại." });
  }
};

// ============================================
// QUẢN LÝ USER (ADMIN ONLY)
// ============================================

// 1. Lấy danh sách tất cả users (Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      role = "all",
      status = "all"
    } = req.query;

    // Build query filter
    let filter = {};

    // Search by name or email
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }

    // Filter by role
    if (role !== "all") {
      const roleDoc = await Setting.findOne({
        type: "role",
        name: role
      });
      if (roleDoc) {
        filter.role = roleDoc._id;
      }
    }

    // Filter by status
    if (status !== "all") {
      filter.status = status;
    }

    // Count total
    const total = await User.countDocuments(filter);

    // Get users with pagination
    const users = await User.find(filter)
      .populate("role", "name value")
      .select("-password") // ⚠️ KHÔNG trả về password
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.json({
      success: true,
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 2. Lấy thông tin chi tiết 1 user (Admin only)
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id)
      .populate("role", "name value")
      .populate("favoriteStyles", "name value type")
      .populate("favoriteBrands", "name value type")
      .populate("favoriteColors", "name value type")
      .populate("favoriteOccasions", "name value type")
      .populate("avoidColors", "name value type")
      .select("-password"); // ⚠️ KHÔNG trả về password

    if (!user) {
      return res.status(404).json({ error: "User không tồn tại" });
    }

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 3. Cập nhật role của user (Admin only)
exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { roleName } = req.body; // Nhận "Admin" hoặc "Customer"

    // Tìm role ID từ Setting
    const roleDoc = await Setting.findOne({
      type: "role",
      name: roleName
    });

    if (!roleDoc) {
      return res.status(400).json({
        error: `Role "${roleName}" không tồn tại trong hệ thống`
      });
    }

    // Cập nhật role
    const user = await User.findByIdAndUpdate(
      id,
      { role: roleDoc._id },
      { new: true }
    ).populate("role", "name value");

    if (!user) {
      return res.status(404).json({ error: "User không tồn tại" });
    }

    res.json({
      success: true,
      message: `Đã cập nhật role thành "${roleName}"`,
      user
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 4. Cập nhật status của user (Active/Inactive) (Admin only)
exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // "Active" hoặc "Inactive"

    if (!["Active", "Inactive"].includes(status)) {
      return res.status(400).json({
        error: "Status chỉ có thể là 'Active' hoặc 'Inactive'"
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    )
      .populate("role", "name value")
      .select("-password");

    if (!user) {
      return res.status(404).json({ error: "User không tồn tại" });
    }

    res.json({
      success: true,
      message: `Đã ${status === "Active" ? "kích hoạt" : "vô hiệu hóa"} tài khoản`,
      user
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 5. Xóa user (Soft delete - chuyển về Inactive) (Admin only)
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Kiểm tra user có tồn tại không
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: "User không tồn tại" });
    }

    // Không cho phép xóa chính mình (Admin tự xóa mình)
    // Bạn cần truyền adminId từ frontend hoặc middleware auth
    // Tạm thời skip check này, sẽ thêm ở phần middleware

    // Soft delete: Chuyển status về Inactive
    user.status = "Inactive";
    await user.save();

    res.json({
      success: true,
      message: "Đã vô hiệu hóa tài khoản thành công"
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 6. Cập nhật thông tin cơ bản user (Admin only)
exports.updateUserInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, email, phone, location, bio } = req.body;

    // Kiểm tra email trùng (nếu đổi email)
    if (email) {
      const existingUser = await User.findOne({
        email,
        _id: { $ne: id }
      });
      if (existingUser) {
        return res.status(400).json({
          error: "Email này đã được sử dụng bởi tài khoản khác"
        });
      }
    }

    const updateData = {};
    if (fullName) updateData.fullName = fullName;
    if (email) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (location !== undefined) updateData.location = location;
    if (bio !== undefined) updateData.bio = bio;

    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    )
      .populate("role", "name value")
      .select("-password");

    if (!user) {
      return res.status(404).json({ error: "User không tồn tại" });
    }

    res.json({
      success: true,
      message: "Đã cập nhật thông tin user",
      user
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 7. Đổi mật khẩu (User only)
exports.changePassword = async (req, res) => {
  try {
    const { userId, oldPassword, newPassword } = req.body;

    // Tìm user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User không tồn tại" });
    }

    // Kiểm tra authType
    if (user.authType !== "local") {
      return res.status(400).json({
        error: "Chỉ tài khoản đăng ký thủ công mới có thể đổi mật khẩu."
      });
    }

    // Kiểm tra mật khẩu cũ
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Mật khẩu cũ không đúng!" });
    }

    // Validate mật khẩu mới
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      return res.status(400).json({ error: passwordError });
    }

    // Kiểm tra mật khẩu mới khác cũ
    if (await bcrypt.compare(newPassword, user.password)) {
      return res.status(400).json({ error: "Mật khẩu mới phải khác mật khẩu cũ!" });
    }

    // Hash mật khẩu mới
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    await user.save();

    res.json({
      success: true,
      message: "Đổi mật khẩu thành công. Vui lòng đăng nhập lại nếu cần."
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};