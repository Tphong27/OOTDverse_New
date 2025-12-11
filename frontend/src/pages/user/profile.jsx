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
} from "lucide-react";
import axios from "axios"; // Đảm bảo đã cài axios
import { getUserProfile, updateUserProfile } from "@/services/userService";

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

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
  const toggleSetting = (field, settingId) => {
    if (!isEditing) return;

    setProfile((prev) => {
      const list = prev[field] || [];
      if (list.includes(settingId)) {
        return { ...prev, [field]: list.filter((id) => id !== settingId) }; // Bỏ chọn
      } else {
        return { ...prev, [field]: [...list, settingId] }; // Chọn thêm
      }
    });
  };

  const handleSave = async () => {
    // Validate ngày sinh trước khi lưu
    const birthdayError = validateBirthday(profile.birthday);
    if (birthdayError) {
      alert(birthdayError); // Hoặc dùng state error để hiển thị
      return;
    }

    setIsSaving(true);
    try {
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

        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-500 rounded-2xl p-8 text-white shadow-lg flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <img
                src="https://ui-avatars.com/api/?name=User&background=random"
                alt="Avatar"
                className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
              />
              <button className="absolute bottom-0 right-0 bg-white text-purple-600 p-2 rounded-full shadow-lg">
                <Camera className="w-4 h-4" />
              </button>
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
                    ? "Chiều cao"
                    : metric === "weight"
                      ? "Cân nặng"
                      : metric}
                </label>
                <input
                  type="number"
                  value={profile[metric]}
                  onChange={(e) => handleChange(metric, e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none disabled:bg-gray-50"
                />
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