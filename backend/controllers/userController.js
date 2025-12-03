// backend/controllers/userController.js
const User = require("../models/User");
const Setting = require("../models/setting");
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
      status: "Active",
      authType: "local",
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
        status: newUser.status,
        authType: newUser.authType,
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
      // ĐẢM BẢO CÓ STATUS
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
        status: "Active",
        hasProfile: false,
        role: customerRoleId,
      });
      await user.save();

      user = await User.findById(user._id).populate("role", "name value");
    }

    // Chỉ gửi email nếu là người dùng mới (isNewUser = true)
    if (isNewUser) {
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
        status: user.status,
        authType: user.authType,
        hasProfile: !!user.height,
      },
    });
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
      const roleDoc = await require("../models/setting").findOne({ 
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
    const roleDoc = await require("../models/eetting").findOne({ 
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

// console.log("Exported functions:", Object.keys(exports));
