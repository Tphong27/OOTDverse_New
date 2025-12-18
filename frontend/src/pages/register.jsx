"use client";
import { useState, useEffect, useRef } from "react";
import { Eye, EyeOff, Mail, Lock, User, Check, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { GoogleLogin } from "@react-oauth/google";
import { registerUser, verifyEmail, resendVerificationCode, googleLoginUser } from "@/services/userService";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth(); // Get login function from AuthContext
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1); // 1: Form, 2: OTP, 3: Success
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState(0);
  const otpInputs = useRef([]);

  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });
  const [authType, setAuthType] = useState("local"); // Track if user registered via Google

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Handle redirect from login page for Google OTP verification OR unverified local user
  useEffect(() => {
    const { email, fromGoogle, fromLogin } = router.query;
    
    // Google user cần xác thực OTP
    if (fromGoogle === "true" && email) {
      setFormData((prev) => ({
        ...prev,
        email: decodeURIComponent(email),
      }));
      setAuthType("google");
      setStep(2); // Jump to OTP step
      setCountdown(60);
    }
    
    // Local user chưa xác thực email, quay lại từ login page
    if (fromLogin === "true" && email) {
      setFormData((prev) => ({
        ...prev,
        email: decodeURIComponent(email),
      }));
      setAuthType("local");
      setStep(2); // Jump to OTP step
      setCountdown(60);
      
      // Tự động gửi lại OTP
      resendVerificationCode(decodeURIComponent(email)).catch(console.error);
    }
  }, [router.query]);

  // Handle Google credential response
  const handleGoogleCredentialResponse = async (response) => {
    setIsLoading(true);
    setError("");

    try {
      const res = await googleLoginUser(response.credential);

      if (res.isNewUser && res.requireVerification) {
        // New user - need OTP verification
        setFormData((prev) => ({
          ...prev,
          email: res.email,
          fullName: res.fullName,
        }));
        setAuthType("google"); // Mark as Google registration
        setStep(2);
        setCountdown(60);
      } else if (res.user) {
        // Existing user - login directly using AuthContext
        login(res.user, res.token); // This saves to 'currentUser' key with token
        router.push(res.user.hasProfile ? "/user/dashboard" : "/user/profile");
      }
    } catch (err) {
      console.error("Google Login Error:", err);
      setError(
        err.response?.data?.error || "Đăng nhập Google thất bại. Vui lòng thử lại."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validatePassword = (password) => {
    if (password.length < 8) {
      return "Mật khẩu phải dài ít nhất 8 ký tự.";
    }
    if (!/[A-Z]/.test(password)) {
      return "Mật khẩu phải chứa ít nhất 1 chữ cái in hoa.";
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      return "Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt.";
    }
    return null;
  };

  // Username validation (frontend)
  const validateUsername = (username) => {
    if (!username) return "Username là bắt buộc.";
    if (username.length < 3) return "Username phải có ít nhất 3 ký tự.";
    if (username.length > 30) return "Username không được quá 30 ký tự.";
    const usernameRegex = /^(?![._])(?!.*[._]$)[a-zA-Z0-9._]{3,30}$/;
    if (!usernameRegex.test(username)) {
      return "Username chỉ được chứa chữ, số, dấu chấm (.) và gạch dưới (_). Không được bắt đầu hoặc kết thúc bằng . hoặc _";
    }
    return null;
  };

  // Step 1: Submit registration form
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.fullName || !formData.username || !formData.email || !formData.password) {
      setError("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    // Validate username
    const usernameError = validateUsername(formData.username);
    if (usernameError) {
      setError(usernameError);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }
    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      setError(passwordError);
      return;
    }
    if (!formData.terms) {
      setError("Bạn cần đồng ý với điều khoản sử dụng.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await registerUser({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        username: formData.username,
      });

      if (res.requireVerification) {
        // Move to OTP step
        setStep(2);
        setCountdown(60); // Start 60s countdown for resend
      }
    } catch (err) {
      console.error("Register Error:", err);
      setError(
        err.response?.data?.error || "Đăng ký thất bại. Vui lòng thử lại."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP input
  const handleOtpChange = (index, value) => {
    if (value.length > 1) {
      value = value.slice(-1);
    }
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otpCode];
    newOtp[index] = value;
    setOtpCode(newOtp);

    // Auto focus next input
    if (value && index < 5) {
      otpInputs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpCode[index] && index > 0) {
      otpInputs.current[index - 1]?.focus();
    }
  };

  // Handle paste OTP
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otpCode];
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtpCode(newOtp);
    otpInputs.current[Math.min(pastedData.length, 5)]?.focus();
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async () => {
    const code = otpCode.join("");
    if (code.length !== 6) {
      setError("Vui lòng nhập đủ 6 chữ số.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await verifyEmail(formData.email, code, authType);
      if (res.success) {
        setStep(3); // Success screen

        // Phân biệt LOCAL vs GOOGLE registration
        if (authType === "google" && res.user && res.token) {
          // Google registration: Auto login vì đã xác thực qua Google
          login(res.user, res.token);
          setTimeout(() => {
            router.push(res.user.hasProfile ? "/user/dashboard" : "/user/profile");
          }, 1500);
        } else {
          // Local registration: Redirect về login để user đăng nhập thủ công
          setTimeout(() => {
            router.push("/login");
          }, 1500);
        }
      }
    } catch (err) {
      console.error("Verify Error:", err);
      setError(
        err.response?.data?.error || "Xác thực thất bại. Vui lòng thử lại."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (countdown > 0) return;

    setIsLoading(true);
    setError("");

    try {
      await resendVerificationCode(formData.email);
      setCountdown(60);
      setOtpCode(["", "", "", "", "", ""]);
    } catch (err) {
      console.error("Resend Error:", err);
      setError(
        err.response?.data?.error || "Gửi lại mã thất bại. Vui lòng thử lại."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Success screen
  if (step === 3) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Đăng ký thành công!
          </h1>
          <p className="text-gray-600 mb-6">
            Tài khoản của bạn đã được xác thực. Đang chuyển hướng...
          </p>
          <Loader2 className="animate-spin mx-auto text-purple-600" />
        </div>
      </div>
    );
  }

  // Step 2: OTP Verification screen
  if (step === 2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <button
            onClick={() => setStep(1)}
            className="flex items-center text-gray-600 hover:text-purple-600 transition-colors text-sm mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Quay lại
          </button>

          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-8 h-8 text-purple-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Xác thực Email
            </h1>
            <p className="text-gray-600">
              Chúng tôi đã gửi mã 6 chữ số đến
            </p>
            <p className="font-medium text-purple-600">{formData.email}</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
              {error}
            </div>
          )}

          {/* OTP Input */}
          <div className="flex justify-center gap-2 mb-6">
            {otpCode.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (otpInputs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                onPaste={handleOtpPaste}
                className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
              />
            ))}
          </div>

          <button
            onClick={handleVerifyOtp}
            disabled={isLoading || otpCode.join("").length !== 6}
            className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-full font-semibold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="animate-spin w-5 h-5" />
            ) : (
              "Xác thực"
            )}
          </button>

          <div className="text-center mt-6">
            <p className="text-sm text-gray-600 mb-2">
              Không nhận được mã?
            </p>
            <button
              onClick={handleResendOtp}
              disabled={countdown > 0 || isLoading}
              className={`text-sm font-semibold ${countdown > 0
                ? "text-gray-400 cursor-not-allowed"
                : "text-purple-600 hover:text-purple-500"
                }`}
            >
              {countdown > 0 ? `Gửi lại sau ${countdown}s` : "Gửi lại mã"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 1: Registration form
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

            {/* Username */}
            <div>
              <div className="relative">
                <span className="absolute left-3 top-3.5 text-gray-400 text-sm font-medium">@</span>
                <input
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  type="text"
                  className="w-full px-4 py-3 pl-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                  placeholder="username"
                  maxLength={30}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1.5">
                3-30 ký tự, chỉ chữ thường, số, dấu chấm (.) và gạch dưới (_)
              </p>
            </div>

            {/* Email */}
            <div>
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
              <p className="text-xs text-gray-500 mt-1.5">
                Chúng tôi khuyên bạn nên sử dụng email cá nhân.
              </p>
            </div>

            {/* Password */}
            <div>
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
              {/* Password Requirements */}
              <ul className="mt-2 space-y-1 text-xs text-gray-500">
                <li className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${formData.password.length >= 8 ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                  Gồm ít nhất 8 ký tự
                </li>
                <li className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${/[A-Z]/.test(formData.password) ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                  Ít nhất một chữ in hoa
                </li>
                <li className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password) ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                  Bao gồm ít nhất một ký tự đặc biệt
                </li>
              </ul>
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
                <a
                  href="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:underline"
                >
                  Điều khoản sử dụng
                </a>{" "}
                và{" "}
                <a
                  href="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:underline"
                >
                  Chính sách bảo mật
                </a>
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
                "Tiếp tục"
              )}
            </button>

            {/* Divider */}
            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Tiếp tục với:</span>
              </div>
            </div>

            {/* Google Login */}
            <div className="flex justify-center w-full">
              <GoogleLogin
                onSuccess={handleGoogleCredentialResponse}
                onError={() => {
                  setError("Kết nối Google thất bại.");
                  console.log("Google Login Failed");
                }}
                theme="outline"
                size="large"
                width="350"
                text="continue_with"
                shape="rectangular"
              />
            </div>

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