// frontend/src/pages/register.jsx
import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, User, Check, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { registerUser } from "@/services/userService"; // Import service bạn đã làm

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    // 1. Validate cơ bản
    if (!formData.fullName || !formData.email || !formData.password) {
      setError("Vui lòng điền đầy đủ thông tin.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }
    if (!formData.terms) {
      setError("Bạn cần đồng ý với điều khoản sử dụng.");
      return;
    }

    setIsLoading(true);

    try {
      // 2. Gọi API đăng ký
      // Lưu ý: Hàm registerUser trong userService.js cần nhận đúng format (email, password, fullName)
      const res = await registerUser({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
      });

      // 3. Xử lý thành công
      setSuccess(true);

      // Chuyển sang trang login sau 2 giây
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      // 4. Xử lý lỗi từ Backend (VD: Email đã tồn tại)
      console.error("Register Error:", err);
      setError(
        err.response?.data?.error || "Đăng ký thất bại. Vui lòng thử lại."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Giao diện thông báo thành công
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center animate-fade-in-up">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Đăng ký thành công!
          </h1>
          <p className="text-gray-600 mb-6">
            Tài khoản của bạn đã được tạo. Đang chuyển hướng...
          </p>
          <Loader2 className="animate-spin mx-auto text-purple-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white overflow-y-auto">
        <div className="w-full max-w-md space-y-6">
          <div className="text-left">
            <Link
              href="/"
              className="inline-flex items-center text-gray-600 hover:text-purple-600 transition-colors text-sm"
            >
              ← Quay lại trang chủ
            </Link>
          </div>

          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Tạo tài khoản
            </h1>
            <h2 className="text-xl bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent font-semibold">
              Tham gia OOTDverse
            </h2>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Full Name */}
            <div className="relative">
              <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              <input
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                type="text"
                className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                placeholder="Họ và tên"
              />
            </div>

            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              <input
                name="email"
                value={formData.email}
                onChange={handleChange}
                type="email"
                className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                placeholder="Email"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              <input
                name="password"
                value={formData.password}
                onChange={handleChange}
                type={showPassword ? "text" : "password"}
                className="w-full px-4 py-3 pl-10 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                placeholder="Mật khẩu"
              />
              <button
                type="button"
                className="absolute right-3 top-3.5"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              <input
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                type={showConfirmPassword ? "text" : "password"}
                className="w-full px-4 py-3 pl-10 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                placeholder="Nhập lại mật khẩu"
              />
              <button
                type="button"
                className="absolute right-3 top-3.5"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>

            {/* Terms */}
            <div className="flex items-start">
              <input
                name="terms"
                checked={formData.terms}
                onChange={handleChange}
                type="checkbox"
                className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-600">
                Tôi đồng ý với{" "}
                <span className="text-purple-600 cursor-pointer">
                  Điều khoản sử dụng
                </span>{" "}
                và{" "}
                <span className="text-purple-600 cursor-pointer">
                  Chính sách bảo mật
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-full font-semibold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="animate-spin w-5 h-5" />
              ) : (
                "Đăng ký"
              )}
            </button>

            <div className="text-center pt-4">
              <p className="text-sm text-gray-600">
                Đã có tài khoản?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-gray-900 hover:text-purple-600"
                >
                  Đăng nhập ngay
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:block lg:w-1/2 bg-gradient-to-br from-purple-100 to-pink-100">
        <div className="h-full flex items-center justify-center p-8">
          <img
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&auto=format&fit=crop&q=80"
            alt="Fashion"
            className="w-full max-w-lg aspect-[3/4] object-cover rounded-3xl shadow-2xl transform hover:scale-105 transition-transform duration-500"
          />
        </div>
      </div>
    </div>
  );
}
