# Feature: Authentication (Xác thực người dùng)

> **Last Updated:** 2025-12-16  
> **Status:** ✅ Implemented

## Tổng quan

Hệ thống xác thực của OOTDverse hỗ trợ 2 phương thức đăng nhập:

- **Local** - Email + Password truyền thống
- **Google OAuth** - Đăng nhập bằng tài khoản Google

### Điểm đặc biệt

- Cùng một email có thể có **2 tài khoản riêng biệt** (1 local, 1 Google)
- Tất cả tài khoản mới đều yêu cầu **xác thực OTP qua email**
- Hỗ trợ **quên mật khẩu** cho tài khoản local

---

## Kiến trúc (Architecture)

### Database Model

```javascript
// User.js - Các fields liên quan đến auth
{
  email: String,           // Không unique riêng lẻ
  password: String,        // Chỉ có với authType: "local"
  authType: "local" | "google",

  // Email verification (OTP đăng ký)
  isEmailVerified: Boolean,
  emailVerificationCode: String,
  emailVerificationExpires: Date,

  // Password reset (Quên mật khẩu)
  passwordResetCode: String,
  passwordResetExpires: Date,

  // Profile tracking
  hasProfile: Boolean      // true sau khi user điền profile
}
```

### Compound Index

```javascript
UserSchema.index({ email: 1, authType: 1 }, { unique: true });
```

> Cho phép cùng email nhưng khác authType → 2 tài khoản riêng biệt

---

## API Endpoints

### Đăng ký / Đăng nhập

| Method | Endpoint                         | Mô tả                   |
| ------ | -------------------------------- | ----------------------- |
| POST   | `/api/users/register`            | Đăng ký local → gửi OTP |
| POST   | `/api/users/verify-email`        | Xác thực OTP            |
| POST   | `/api/users/resend-verification` | Gửi lại OTP             |
| POST   | `/api/users/login`               | Đăng nhập local         |
| POST   | `/api/users/google-login`        | Đăng nhập/ký Google     |

### Quên mật khẩu

| Method | Endpoint                       | Mô tả              |
| ------ | ------------------------------ | ------------------ |
| POST   | `/api/users/forgot-password`   | Gửi OTP reset      |
| POST   | `/api/users/verify-reset-code` | Xác thực OTP reset |
| POST   | `/api/users/reset-password`    | Đặt mật khẩu mới   |

---

## User Flows

### 1. Đăng ký Local

```
1. User nhập email + password
2. Backend tạo user (isEmailVerified: false)
3. Gửi OTP 6 số qua email
4. User nhập OTP → xác thực thành công
5. Auto login → redirect /user/profile
6. Gửi email chào mừng
```

### 2. Đăng nhập/ký Google

```
1. User click "Tiếp tục với Google"
2. Chọn Google account
3. Backend check user tồn tại:
   - CÓ (authType: google) → Login luôn
   - KHÔNG → Tạo user mới, gửi OTP
4. Sau OTP → Auto login → redirect /user/profile
5. Gửi email chào mừng
```

### 3. Quên mật khẩu

```
1. User click "Quên mật khẩu?" trên login
2. Nhập email
3. Backend gửi OTP reset password
4. User nhập OTP
5. User đặt mật khẩu mới
6. Redirect → Login
```

---

## Redirect Logic

| Điều kiện                         | Redirect đến      |
| --------------------------------- | ----------------- |
| `hasProfile === false` (lần đầu)  | `/user/profile`   |
| `hasProfile === true` (returning) | `/user/dashboard` |

---

## Email Templates

Tất cả email templates nằm trong `backend/services/emailService.js`:

1. **sendVerificationEmail** - OTP đăng ký mới
2. **sendPasswordResetEmail** - OTP quên mật khẩu
3. **sendLoginSuccessEmail** - Email chào mừng (first login)

---

## Frontend Pages

| Page               | Mô tả                                 |
| ------------------ | ------------------------------------- |
| `/login`           | Form đăng nhập local + Google button  |
| `/register`        | Form đăng ký + OTP verification steps |
| `/forgot-password` | 4-step password recovery flow         |

---

## Quyết định thiết kế (Design Decisions)

### Tại sao tách biệt Local và Google accounts?

- **Flexibility cho user**: Một người có thể muốn tài khoản riêng cho mỗi phương thức
- **Tránh conflict**: Google account không có password, local account cần password
- **Future-proof**: Dễ dàng thêm các OAuth providers khác (Facebook, Apple...)

### Tại sao dùng OTP thay vì Magic Link?

- **Consistency**: Cùng UX với verification flow khi đăng ký
- **Simple implementation**: Reuse existing email service
- **Mobile-friendly**: Không cần mở link trong browser khác

### Tại sao auto-login sau OTP?

- **Better UX**: Giảm 1 bước (không cần login lại sau verify)
- **Security**: Token được generate ngay lập tức từ verified state
