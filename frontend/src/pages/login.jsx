import { useState } from "react";
import { Eye, EyeOff, Lock, Mail, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { loginUser, googleLoginUser } from "@/services/userService";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "@/context/AuthContext"; // 1. Import hook

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth(); // 2. Lấy hàm login từ Context
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Xử lý đăng nhập thường (Email/Password)
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Vui lòng nhập email và mật khẩu.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await loginUser({ email, password });
      handleAuthSuccess(res);
    } catch (err) {
      console.error("Login Error:", err);
      setError(err.response?.data?.error || "Email hoặc mật khẩu không đúng.");
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý đăng nhập Google
  const handleGoogleSuccess = async (credentialResponse) => {
    setIsLoading(true);
    setError("");
    try {
      const res = await googleLoginUser(credentialResponse.credential);
      handleAuthSuccess(res);
    } catch (err) {
      console.error("Google Login Error:", err);
      setError("Đăng nhập bằng Google thất bại. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm xử lý chung khi đăng nhập thành công
  const handleAuthSuccess = (res) => {
    if (res.success) {
      // 3. QUAN TRỌNG: Gọi hàm login của Context thay vì set localStorage thủ công
      // Hàm login() trong AuthContext sẽ tự lo việc set localStorage và cập nhật state toàn app
      login(res.user);

      if (res.user.hasProfile === false) {
        router.push("/user/profile");
      } else {
        router.push("/wardrobe/wardrobe");
      }
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          <div className="text-left">
            <Link
              href="/"
              className="inline-flex items-center text-gray-600 hover:text-purple-600 transition-colors text-sm"
            >
              ← Quay lại trang chủ
            </Link>
          </div>

          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Chào mừng trở lại!
            </h1>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
              OOTDverse
            </h2>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                ⚠️ {error}
              </div>
            )}

            {/* Email Field */}
            <div>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                  placeholder="Email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? "text" : "password"}
                  className="w-full px-4 py-3 pl-10 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                  placeholder="Mật khẩu"
                />
                <button
                  type="button"
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between mt-2">
                <label className="flex items-center text-sm text-gray-600">
                  <input
                    type="checkbox"
                    className="mr-2 rounded text-purple-600 focus:ring-purple-500"
                  />
                  Ghi nhớ đăng nhập
                </label>
                <a
                  href="#"
                  className="text-sm text-purple-600 hover:text-purple-500 font-medium"
                >
                  Quên mật khẩu?
                </a>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-full font-semibold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="animate-spin w-5 h-5" />
              ) : (
                "Đăng nhập"
              )}
            </button>
          </form>

          {/* Divider & Google Login */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Hoặc tiếp tục với
              </span>
            </div>
          </div>

          <div className="flex justify-center w-full">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => {
                setError("Kết nối Google thất bại.");
                console.log("Google Login Failed");
              }}
              useOneTap
              theme="outline"
              size="large"
              width="350"
              text="continue_with"
              shape="pill"
            />
          </div>

          {/* Register Link */}
          <div className="text-center pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-600">
              Chưa có tài khoản?{" "}
              <Link
                href="/register"
                className="font-semibold text-gray-900 hover:text-purple-600"
              >
                Đăng ký miễn phí
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:block lg:w-1/2 bg-gray-50">
        <div className="h-full w-full relative">
          <img
            src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600"
            alt="Fashion background"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-purple-900/60 to-transparent flex items-end p-12">
            <div className="text-white">
              <h3 className="text-3xl font-bold mb-2">
                Khám phá phong cách của bạn
              </h3>
              <p className="text-purple-100 text-lg">
                Tham gia cộng đồng thời trang thông minh nhất ngay hôm nay.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
