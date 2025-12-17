import { useState, useEffect } from "react";
import LayoutUser from "@/components/layout/LayoutUser";
import {
  User,
  Camera,
  Save,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Ruler,
  Palette,
  Heart,
  Sparkles,
  TrendingUp,
  Edit2,
  CheckCircle,
  Loader2,
} from "lucide-react";
import axios from "axios"; // Đảm bảo đã cài axios
import { getUserProfile, updateUserProfile, uploadAvatar } from "@/services/userService";
import { useAuth } from "@/context/AuthContext";

export default function ProfilePage() {
  const { updateUser } = useAuth(); // Để sync avatar với navbar
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Avatar states
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarBase64, setAvatarBase64] = useState(null); // Lưu base64 để upload

  // State lưu trữ toàn bộ Settings từ DB để hiển thị lựa chọn
  const [availableSettings, setAvailableSettings] = useState({
    brands: [],
    styles: [],
    colors: [],
    occasions: [],
  });

  const [profile, setProfile] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
    location: "",
    birthday: "",
    bio: "",
    height: "",
    weight: "",
    bust: "",
    waist: "",
    hips: "",

    // Các trường này sẽ lưu mảng ID của Setting
    favoriteStyles: [],
    favoriteBrands: [],
    favoriteColors: [],
    favoriteOccasions: [],
    avoidColors: [],

    budget: "1-3 triệu",
    sustainableFashion: false,
    age: "",
    gender: "",
  });

  // ============================================================================
  // MEASUREMENT VALIDATION
  // ============================================================================
  
  const MEASUREMENT_LIMITS = {
    height: { min: 100, max: 250, label: "Chiều cao", unit: "cm" },
    weight: { min: 30, max: 200, label: "Cân nặng", unit: "kg" },
    bust: { min: 60, max: 150, label: "bust", unit: "cm" },
    waist: { min: 40, max: 150, label: "waist", unit: "cm" },
    hips: { min: 60, max: 180, label: "hips", unit: "cm" },
  };

  // State để lưu validation errors
  const [validationErrors, setValidationErrors] = useState({});
  
  // State cho toast notification (color conflict)
  const [colorConflictToast, setColorConflictToast] = useState(null);

  // Hàm validate measurement
  const validateMeasurement = (field, value) => {
    if (!value || value === "") return null; // Empty is OK (optional fields)
    
    const numValue = parseFloat(value);
    const limits = MEASUREMENT_LIMITS[field];
    
    if (!limits) return null;
    
    if (isNaN(numValue) || numValue < limits.min || numValue > limits.max) {
      return `${limits.label} phải từ ${limits.min}-${limits.max} ${limits.unit}`;
    }
    
    return null;
  };

  // Validate tất cả measurements
  const validateAllMeasurements = () => {
    const errors = {};
    let hasError = false;

    Object.keys(MEASUREMENT_LIMITS).forEach((field) => {
      const error = validateMeasurement(field, profile[field]);
      if (error) {
        errors[field] = error;
        hasError = true;
      }
    });

    setValidationErrors(errors);
    return !hasError;
  };

  // Handle blur để validate realtime
  const handleMeasurementBlur = (field) => {
    const error = validateMeasurement(field, profile[field]);
    setValidationErrors((prev) => ({
      ...prev,
      [field]: error,
    }));
  };

  // Hàm tính tuổi từ ngày sinh
  const calculateAge = (birthday) => {
    if (!birthday) return "";
    const birthDate = new Date(birthday);
    const ageDifMs = Date.now() - birthDate.getTime();
    const ageDate = new Date(ageDifMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  // Hàm validate ngày sinh không lớn hơn hôm nay
  const validateBirthday = (birthday) => {
    if (!birthday) return null;
    const inputDate = new Date(birthday);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (inputDate > today) {
      return "Ngày sinh không được lớn hơn hôm nay.";
    }
    return null;
  };

  // 1. Load User & Settings khi trang tải
  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      const userObj = JSON.parse(storedUser);
      setCurrentUser(userObj);
      fetchData(userObj._id);
    }
  }, []);

  const fetchData = async (userId) => {
    try {
      // Gọi song song: Lấy Settings và Lấy Profile User
      const [settingsRes, profileRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/setting`), // API lấy toàn bộ setting
        getUserProfile(userId),
      ]);

      // Phân loại Settings
      const settings = settingsRes.data;
      setAvailableSettings({
        brands: settings.filter(
          (s) => s.type === "brand" && s.status === "Active"
        ),
        styles: settings.filter(
          (s) => s.type === "style" && s.status === "Active"
        ),
        colors: settings.filter(
          (s) => s.type === "color" && s.status === "Active"
        ),
        occasions: settings.filter(
          (s) => s.type === "occasion" && s.status === "Active"
        ),
      });

      // Map dữ liệu User về form
      // Lưu ý: profileRes trả về object Setting đầy đủ, ta chỉ cần lấy _id để lưu vào state form
      const userData = profileRes;
      setProfile({
        ...userData,
        // Đảm bảo các text fields không undefined để tránh controlled/uncontrolled warning
        fullName: userData.fullName || "",
        phone: userData.phone || "",
        bio: userData.bio || "",
        gender: userData.gender || "",
        height: userData.height || "",
        weight: userData.weight || "",
        bust: userData.bust || "",
        waist: userData.waist || "",
        hips: userData.hips || "",
        budget: userData.budget || "1-3 triệu",
        avatar: userData.avatar || "",
        // Chuyển mảng object thành mảng ID để tiện xử lý checkbox
        favoriteStyles: userData.favoriteStyles?.map((s) => s._id) || [],
        favoriteBrands: userData.favoriteBrands?.map((s) => s._id) || [],
        favoriteColors: userData.favoriteColors?.map((s) => s._id) || [],
        favoriteOccasions: userData.favoriteOccasions?.map((s) => s._id) || [],
        avoidColors: userData.avoidColors?.map((s) => s._id) || [],
        // Đảm bảo birthday là định dạng YYYY-MM-DD cho input date
        birthday: userData.birthday
          ? new Date(userData.birthday).toISOString().split("T")[0]
          : "",
        // Tính tuổi nếu chưa có hoặc để đồng bộ
        age: userData.age || calculateAge(userData.birthday),
      });
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
    }
  };

  // Xử lý thay đổi input thường
  const handleChange = (field, value) => {
    setProfile((prev) => {
      const updated = { ...prev, [field]: value };
      // Nếu thay đổi birthday, tự tính age
      if (field === "birthday") {
        updated.age = calculateAge(value);
      }
      return updated;
    });
  };

  // Xử lý chọn/bỏ chọn Setting (Toggle ID trong mảng)
  // Bao gồm COLOR CONFLICT RESOLUTION: tự động xóa màu khỏi list đối lập
  const toggleSetting = (field, settingId) => {
    if (!isEditing) return;

    setProfile((prev) => {
      const list = prev[field] || [];
      let updated = { ...prev };

      if (list.includes(settingId)) {
        // Bỏ chọn
        updated[field] = list.filter((id) => id !== settingId);
      } else {
        // Chọn thêm
        updated[field] = [...list, settingId];

        // COLOR CONFLICT RESOLUTION
        // Nếu đang thêm vào favoriteColors, xóa khỏi avoidColors
        if (field === "favoriteColors" && prev.avoidColors?.includes(settingId)) {
          updated.avoidColors = prev.avoidColors.filter((id) => id !== settingId);
          // Tìm tên màu để hiển thị toast
          const colorName = availableSettings.colors.find((c) => c._id === settingId)?.name || "màu";
          setColorConflictToast(`Đã xóa "${colorName}" khỏi danh sách tránh`);
          setTimeout(() => setColorConflictToast(null), 3000);
        }

        // Nếu đang thêm vào avoidColors, xóa khỏi favoriteColors
        if (field === "avoidColors" && prev.favoriteColors?.includes(settingId)) {
          updated.favoriteColors = prev.favoriteColors.filter((id) => id !== settingId);
          // Tìm tên màu để hiển thị toast
          const colorName = availableSettings.colors.find((c) => c._id === settingId)?.name || "màu";
          setColorConflictToast(`Đã xóa "${colorName}" khỏi danh sách yêu thích`);
          setTimeout(() => setColorConflictToast(null), 3000);
        }
      }

      return updated;
    });
  };

  const handleSave = async () => {
    // Validate số đo cơ thể trước
    if (!validateAllMeasurements()) {
      // Tập hợp tất cả lỗi để hiển thị
      const errorMessages = Object.values(validationErrors).filter(Boolean).join("\n");
      alert(errorMessages || "Vui lòng kiểm tra lại số đo cơ thể.");
      return;
    }

    // Validate ngày sinh trước khi lưu
    const birthdayError = validateBirthday(profile.birthday);
    if (birthdayError) {
      alert(birthdayError); // Hoặc dùng state error để hiển thị
      return;
    }

    setIsSaving(true);
    try {
      // Upload avatar nếu có ảnh mới được chọn
      if (avatarBase64) {
        setIsUploadingAvatar(true);
        try {
          const avatarResult = await uploadAvatar(currentUser._id, avatarBase64);
          // Cập nhật avatar trong profile state
          setProfile((prev) => ({ ...prev, avatar: avatarResult.avatar }));
          // Sync avatar với AuthContext để navbar hiển thị ngay
          updateUser({ avatar: avatarResult.avatar });
          setAvatarBase64(null); // Reset sau khi upload thành công
          setAvatarPreview(null);
        } catch (avatarError) {
          console.error("Lỗi upload avatar:", avatarError);
          alert(avatarError.response?.data?.error || "Lỗi upload avatar. Vui lòng thử lại.");
          setIsUploadingAvatar(false);
          setIsSaving(false);
          return;
        }
        setIsUploadingAvatar(false);
      }

      // Chỉ gửi các trường có thể chỉnh sửa, loại bỏ các trường read-only
      const editableFields = {
        userId: currentUser._id,
        fullName: profile.fullName,
        phone: profile.phone,
        birthday: profile.birthday,
        bio: profile.bio,
        gender: profile.gender,
        age: profile.age,
        height: profile.height,
        weight: profile.weight,
        bust: profile.bust,
        waist: profile.waist,
        hips: profile.hips,
        favoriteStyles: profile.favoriteStyles,
        favoriteBrands: profile.favoriteBrands,
        favoriteColors: profile.favoriteColors,
        favoriteOccasions: profile.favoriteOccasions,
        avoidColors: profile.avoidColors,
        budget: profile.budget,
        sustainableFashion: profile.sustainableFashion,
      };

      await updateUserProfile(editableFields);

      setShowSuccess(true);
      setIsEditing(false);
      setTimeout(() => setShowSuccess(false), 3000);

      // Reload lại data để hiển thị populate đẹp
      fetchData(currentUser._id);
    } catch (error) {
      console.error("Lỗi lưu profile:", error);
      alert("Có lỗi khi lưu thông tin.");
    } finally {
      setIsSaving(false);
    }
  };

  // Helper render danh sách lựa chọn
  const renderSettingOptions = (title, field, options, icon) => (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
        {icon} {title}
      </label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const isSelected = profile[field]?.includes(opt._id);
          return (
            <button
              key={opt._id}
              onClick={() => toggleSetting(field, opt._id)}
              disabled={!isEditing}
              className={`px-3 py-1.5 rounded-full text-sm border transition-all ${isSelected
                ? "bg-purple-600 text-white border-purple-600 shadow-md"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                } ${!isEditing && !isSelected ? "hidden" : ""} `} // Khi không edit, ẩn những cái không chọn cho gọn
            >
              {opt.name}
            </button>
          );
        })}
        {(!options || options.length === 0) && (
          <span className="text-xs text-gray-400">Chưa có dữ liệu</span>
        )}
      </div>
    </div>
  );

  return (
    <LayoutUser>
      <div className="max-w-5xl mx-auto space-y-6">
        {showSuccess && (
          <div className="fixed top-6 right-6 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 animate-pulse z-50">
            <CheckCircle className="w-5 h-5" />
            <span>Đã lưu thông tin thành công!</span>
          </div>
        )}

        {/* Color Conflict Toast */}
        {colorConflictToast && (
          <div className="fixed top-6 right-6 bg-yellow-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 z-50 animate-bounce">
            <Palette className="w-5 h-5" />
            <span>{colorConflictToast}</span>
          </div>
        )}

        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-500 rounded-2xl p-8 text-white shadow-lg flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <img
                src={avatarPreview || profile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.fullName || profile.name || 'User')}&background=random&size=200`}
                alt="Avatar"
                className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
              />
              {/* Hidden file input */}
              <input
                type="file"
                id="avatar-upload"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    // Validate file size (10MB)
                    if (file.size > 10 * 1024 * 1024) {
                      alert("File quá lớn (tối đa 10MB)");
                      return;
                    }
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setAvatarPreview(reader.result);
                      setAvatarBase64(reader.result); // Lưu để upload
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                disabled={!isEditing}
              />
              {/* Loading overlay khi đang upload */}
              {isUploadingAvatar && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
              )}
              {/* Camera button - only show when editing */}
              {isEditing && !isUploadingAvatar && (
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 bg-white text-purple-600 p-2 rounded-full shadow-lg cursor-pointer hover:bg-purple-50 transition"
                  title="Chọn ảnh đại diện (upload lên Cloudinary)"
                >
                  <Camera className="w-4 h-4" />
                </label>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-1">
                {profile.fullName || profile.name}
              </h1>
              <p className="text-purple-100">{profile.email ? `@${profile.email.split("@")[0]}` : ""}</p>
            </div>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="bg-white text-purple-600 px-6 py-2 rounded-full font-semibold hover:bg-purple-50 transition flex items-center space-x-2"
          >
            <Edit2 className="w-4 h-4" />
            <span>{isEditing ? "Hủy" : "Chỉnh sửa"}</span>
          </button>
        </div>

        {/* Thông tin cơ bản (Thêm gender, location, birthday, age) */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-2 mb-6">
            <User className="w-5 h-5 text-purple-600" />
            <h2 className="text-xl font-bold text-gray-900">
              Thông tin cá nhân
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Họ tên
              </label>
              <input
                type="text"
                value={profile.fullName || profile.name}
                onChange={(e) => handleChange("fullName", e.target.value)}
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none disabled:bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giới tính
              </label>
              <select
                value={profile.gender || ""}
                onChange={(e) => handleChange("gender", e.target.value)}
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none disabled:bg-gray-50"
              >
                <option value="">Chọn giới tính</option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số điện thoại
              </label>
              <input
                type="text"
                value={profile.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none disabled:bg-gray-50"
              />
            </div>
            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Địa điểm
              </label>
              <input
                type="text"
                value={profile.location}
                onChange={(e) => handleChange("location", e.target.value)}
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none disabled:bg-gray-50"
              />
            </div> */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngày sinh
              </label>
              <input
                type="date"
                value={profile.birthday}
                onChange={(e) => handleChange("birthday", e.target.value)}
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none disabled:bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tuổi
              </label>
              <input
                type="number"
                value={profile.age}
                disabled={true} // Read-only, tự tính từ birthday
                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 cursor-not-allowed"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giới thiệu
              </label>
              <textarea
                value={profile.bio}
                onChange={(e) => handleChange("bio", e.target.value)}
                disabled={!isEditing}
                rows="3"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none disabled:bg-gray-50"
              />
            </div>
          </div>
        </div>

        {/* Số đo cơ thể */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-2 mb-6">
            <Ruler className="w-5 h-5 text-pink-600" />
            <h2 className="text-xl font-bold text-gray-900">Số đo cơ thể</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {["height", "weight", "bust", "waist", "hips"].map((metric) => (
              <div key={metric}>
                <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                  {metric === "height"
                    ? "Chiều cao (cm)"
                    : metric === "weight"
                      ? "Cân nặng (kg)"
                      : `${metric} (cm)`}
                </label>
                <input
                  type="number"
                  value={profile[metric]}
                  onChange={(e) => handleChange(metric, e.target.value)}
                  onBlur={() => handleMeasurementBlur(metric)}
                  disabled={!isEditing}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none disabled:bg-gray-50 ${
                    validationErrors[metric]
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-200 focus:ring-pink-500"
                  }`}
                />
                {/* Inline error message */}
                {validationErrors[metric] && (
                  <p className="text-xs text-red-500 mt-1">{validationErrors[metric]}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Phong cách & Sở thích (Dùng Setting dynamic) */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-2 mb-6">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h2 className="text-xl font-bold text-gray-900">
              Sở thích thời trang
            </h2>
          </div>

          {renderSettingOptions(
            "Phong cách yêu thích",
            "favoriteStyles",
            availableSettings.styles,
            <Sparkles className="w-4 h-4 text-purple-500" />
          )}

          {renderSettingOptions(
            "Thương hiệu yêu thích",
            "favoriteBrands",
            availableSettings.brands,
            <TrendingUp className="w-4 h-4 text-blue-500" />
          )}

          {renderSettingOptions(
            "Màu sắc ưu tiên",
            "favoriteColors",
            availableSettings.colors,
            <Palette className="w-4 h-4 text-pink-500" />
          )}

          {renderSettingOptions(
            "Dịp thường đi",
            "favoriteOccasions",
            availableSettings.occasions,
            <Calendar className="w-4 h-4 text-green-500" />
          )}

          <div className="border-t pt-4 mt-4">
            {renderSettingOptions(
              "Màu sắc KHÔNG thích (AI sẽ tránh)",
              "avoidColors",
              availableSettings.colors,
              <div className="text-red-500 font-bold">⛔</div>
            )}
          </div>
        </div>

        {/* Save Button */}
        {isEditing && (
          <div className="flex justify-end space-x-4 pb-10">
            <button
              onClick={() => setIsEditing(false)}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Hủy
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-8 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> Lưu thay đổi
            </button>
          </div>
        )}
      </div>
    </LayoutUser>
  );
}