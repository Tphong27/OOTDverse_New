"use client";
import { useState, useEffect, useRef } from "react";
import { Mail, Lock, ArrowLeft, Loader2, Check, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { forgotPassword, verifyResetCode, resetPassword } from "@/services/userService";

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password, 4: Success
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [email, setEmail] = useState("");
    const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const otpInputs = useRef([]);

    // Countdown timer for resend
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    // Step 1: Submit email
    const handleSubmitEmail = async (e) => {
        e.preventDefault();
        if (!email) {
            setError("Vui lòng nhập email.");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const res = await forgotPassword(email);
            if (res.success) {
                setStep(2);
                setCountdown(60);
            }
        } catch (err) {
            console.error("Forgot Password Error:", err);
            setError(err.response?.data?.error || "Có lỗi xảy ra. Vui lòng thử lại.");
        } finally {
            setIsLoading(false);
        }
    };

    // Handle OTP input
    const handleOtpChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otpCode];
        newOtp[index] = value.slice(-1);
        setOtpCode(newOtp);

        if (value && index < 5) {
            otpInputs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === "Backspace" && !otpCode[index] && index > 0) {
            otpInputs.current[index - 1]?.focus();
        }
    };

    const handleOtpPaste = (e) => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        const newOtp = [...otpCode];
        for (let i = 0; i < pasteData.length; i++) {
            newOtp[i] = pasteData[i];
        }
        setOtpCode(newOtp);
        if (pasteData.length === 6) {
            otpInputs.current[5]?.focus();
        }
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
            const res = await verifyResetCode(email, code);
            if (res.success) {
                setStep(3);
            }
        } catch (err) {
            console.error("Verify OTP Error:", err);
            setError(err.response?.data?.error || "Mã xác thực không đúng.");
        } finally {
            setIsLoading(false);
        }
    };

    // Step 3: Reset Password
    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (!newPassword || !confirmPassword) {
            setError("Vui lòng nhập đầy đủ mật khẩu.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Mật khẩu xác nhận không khớp.");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const code = otpCode.join("");
            const res = await resetPassword(email, code, newPassword);
            if (res.success) {
                setStep(4);
                setTimeout(() => {
                    router.push("/login");
                }, 2000);
            }
        } catch (err) {
            console.error("Reset Password Error:", err);
            setError(err.response?.data?.error || "Đặt lại mật khẩu thất bại.");
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
            await forgotPassword(email);
            setCountdown(60);
            setOtpCode(["", "", "", "", "", ""]);
        } catch (err) {
            setError("Gửi lại mã thất bại. Vui lòng thử lại.");
        } finally {
            setIsLoading(false);
        }
    };

    // Password validation
    const passwordChecks = {
        length: newPassword.length >= 8,
        uppercase: /[A-Z]/.test(newPassword),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-left">
                        <Link
                            href="/login"
                            className="inline-flex items-center text-gray-600 hover:text-purple-600 transition-colors text-sm"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Quay lại đăng nhập
                        </Link>
                    </div>

                    <div className="text-center">
                        <h1 className="text-4xl font-bold text-gray-900">
                            {step === 1 && "Quên mật khẩu?"}
                            {step === 2 && "Nhập mã xác thực"}
                            {step === 3 && "Đặt mật khẩu mới"}
                            {step === 4 && "Thành công!"}
                        </h1>
                        <p className="mt-2 text-purple-600 font-medium">
                            {step === 1 && "Nhập email của bạn để nhận mã xác thực"}
                            {step === 2 && `Mã đã được gửi đến ${email}`}
                            {step === 3 && "Tạo mật khẩu mới cho tài khoản"}
                            {step === 4 && "Mật khẩu đã được đặt lại"}
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {/* Step 1: Email Form */}
                    {step === 1 && (
                        <form onSubmit={handleSubmitEmail} className="space-y-6">
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900"
                                    placeholder="Email của bạn"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    "Gửi mã xác thực"
                                )}
                            </button>
                        </form>
                    )}

                    {/* Step 2: OTP Verification */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
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
                                        className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                                    />
                                ))}
                            </div>

                            <button
                                onClick={handleVerifyOtp}
                                disabled={isLoading || otpCode.join("").length !== 6}
                                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    "Xác thực"
                                )}
                            </button>

                            <div className="text-center">
                                <p className="text-sm text-gray-500">
                                    Chưa nhận được mã?{" "}
                                    <button
                                        type="button"
                                        onClick={handleResendOtp}
                                        disabled={countdown > 0 || isLoading}
                                        className={`font-semibold ${countdown > 0 ? "text-gray-400" : "text-purple-600 hover:underline"
                                            }`}
                                    >
                                        {countdown > 0 ? `Gửi lại sau ${countdown}s` : "Gửi lại mã"}
                                    </button>
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Step 3: New Password */}
                    {step === 3 && (
                        <form onSubmit={handleResetPassword} className="space-y-6">
                            <div className="space-y-4">
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full pl-12 pr-12 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900"
                                        placeholder="Mật khẩu mới"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>

                                {/* Password requirements */}
                                <div className="space-y-1 text-sm">
                                    <p className={passwordChecks.length ? "text-green-600" : "text-gray-400"}>
                                        • Gồm ít nhất 8 ký tự
                                    </p>
                                    <p className={passwordChecks.uppercase ? "text-green-600" : "text-gray-400"}>
                                        • Ít nhất một chữ in hoa
                                    </p>
                                    <p className={passwordChecks.special ? "text-green-600" : "text-gray-400"}>
                                        • Bao gồm ít nhất một ký tự đặc biệt
                                    </p>
                                </div>

                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full pl-12 pr-12 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900"
                                        placeholder="Xác nhận mật khẩu mới"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading || !passwordChecks.length || !passwordChecks.uppercase || !passwordChecks.special}
                                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    "Đặt lại mật khẩu"
                                )}
                            </button>
                        </form>
                    )}

                    {/* Step 4: Success */}
                    {step === 4 && (
                        <div className="text-center space-y-6">
                            <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                                <Check className="w-10 h-10 text-green-600" />
                            </div>
                            <p className="text-gray-600">
                                Mật khẩu của bạn đã được đặt lại thành công. Bạn sẽ được chuyển hướng đến trang đăng nhập...
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Side - Image */}
            <div className="hidden lg:block lg:w-1/2 bg-gradient-to-br from-purple-100 to-pink-100">
                <div className="h-full flex items-center justify-center p-8">
                    <img
                        src="https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800&auto=format&fit=crop&q=80"
                        alt="Fashion"
                        className="w-full max-w-lg aspect-[3/4] object-cover rounded-3xl shadow-2xl transform hover:scale-105 transition-transform duration-500"
                    />
                </div>
            </div>
        </div>
    );
}
