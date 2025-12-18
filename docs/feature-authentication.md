# Feature: Authentication (Xác thực người dùng)

> **Last Updated:** 2025-12-18  
> **Status:** ✅ Implemented

## Tổng quan

Hệ thống xác thực của OOTDverse hỗ trợ 2 phương thức đăng nhập:

- **Local** - Email + Password truyền thống
- **Google OAuth** - Đăng nhập bằng tài khoản Google

### Điểm đặc biệt

- **Cross-Auth Validation**: Một email chỉ có 1 account, có thể login bằng cả 2 phương thức (local hoặc Google)
- **Username Support**: Đăng nhập bằng username hoặc email
- **Auto-link Accounts**: Local account có thể link với Google và ngược lại
- Tất cả tài khoản mới đều yêu cầu **xác thực OTP qua email**
- Hỗ trợ **quên mật khẩu** cho tài khoản local

---

## Kiến trúc (Architecture)

### Database Model

```javascript
// User.js - Các fields liên quan đến auth
{
  email: String,           // Unique across all authTypes
  password: String,        // Chỉ có với authType: "local" hoặc "both"
  authType: "local" | "google" | "both",  // "both" = linked account

  // Username support
  username: String,        // Unique, lowercase, 3-30 chars
  usernameDisplay: String, // Original case for display

  // Google linking
  googleId: String,        // Google unique ID (for linked accounts)

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

### Indexes

```javascript
// Unique email - 1 email = 1 account
UserSchema.index({ email: 1 }, { unique: true });

// Unique username - case insensitive
UserSchema.index({ username: 1 }, { unique: true });
```

---

## Username Rules

| Rule          | Value                          |
| ------------- | ------------------------------ |
| Unique        | ✅ Bắt buộc (case-insensitive) |
| Length        | 3-30 ký tự                     |
| Allowed chars | `a-z`, `0-9`, `.`, `_`         |
| Start/End     | Không được `.` hoặc `_`        |
| Storage       | Lowercase trong DB             |
| Display       | Giữ nguyên case gốc            |

### Regex

```javascript
/^(?![._])(?!.*[._]$)[a-zA-Z0-9._]{3,30}$/;
```

---

## API Endpoints

### Đăng ký / Đăng nhập

| Method | Endpoint                         | Mô tả                      |
| ------ | -------------------------------- | -------------------------- |
| POST   | `/api/users/register`            | Đăng ký local → gửi OTP    |
| POST   | `/api/users/verify-email`        | Xác thực OTP               |
| POST   | `/api/users/resend-verification` | Gửi lại OTP                |
| POST   | `/api/users/login`               | Đăng nhập (email/username) |
| POST   | `/api/users/google-login`        | Đăng nhập/ký Google        |

### Quên mật khẩu

| Method | Endpoint                       | Mô tả              |
| ------ | ------------------------------ | ------------------ |
| POST   | `/api/users/forgot-password`   | Gửi OTP reset      |
| POST   | `/api/users/verify-reset-code` | Xác thực OTP reset |
| POST   | `/api/users/reset-password`    | Đặt mật khẩu mới   |

---

## Cross-Auth Validation Logic

### Kịch bản

| Scenario                       | Hành vi                                              |
| ------------------------------ | ---------------------------------------------------- |
| Google user → Đăng ký local    | ❌ Block: "Email đã tồn tại. Đăng nhập bằng Google." |
| Local user → Login Google      | ✅ Link account, `authType = "both"`                 |
| Google-only user → Login local | ❌ Block: "Tài khoản đăng ký bằng Google."           |
| Both user → Login local        | ✅ OK (có password)                                  |
| Local user chưa verify → Login | ❌ Block, redirect OTP                               |

---

## User Flows

### 1. Đăng ký Local (với Username)

```
1. User nhập fullName + username + email + password
2. Validate username format + uniqueness
3. Backend tạo user (isEmailVerified: false)
4. Gửi OTP 6 số qua email
5. User nhập OTP → xác thực thành công
6. Redirect → /login (yêu cầu đăng nhập)
7. Gửi email chào mừng
```

### 2. Đăng nhập/ký Google

```
1. User click "Tiếp tục với Google"
2. Chọn Google account
3. Backend check user tồn tại:
   - CÓ (authType: google/both) → Login luôn
   - CÓ (authType: local) → Link account (authType="both")
   - KHÔNG → Tạo user mới, auto-generate username, gửi OTP
4. Sau OTP → Auto login → redirect /user/profile
5. Gửi email chào mừng
```

### 3. Login với Email hoặc Username

```
1. User nhập identifier (email/username) + password
2. Backend detect type:
   - Có @ → tìm by email
   - Không @ → tìm by username (lowercase)
3. Check password → Check isEmailVerified → Login
```

---

## Redirect Logic

| Điều kiện                         | Redirect đến      |
| --------------------------------- | ----------------- |
| `hasProfile === false` (lần đầu)  | `/user/profile`   |
| `hasProfile === true` (returning) | `/user/dashboard` |

---

## Display Name Logic

| Account Type | Display Name                  | Handle                       |
| ------------ | ----------------------------- | ---------------------------- |
| Local        | `fullName` (nhập khi đăng ký) | `@username`                  |
| Google       | `name` từ Google profile      | `@username` (auto-generated) |

---

## Files Liên Quan

### Backend

```
backend/
├── models/User.js                    # Schema + indexes
├── controllers/userController.js     # Auth endpoints
├── services/usernameService.js       # Validate + generate username
└── scripts/migrateUsernames.js       # Migration cho user cũ
```

### Frontend

```
frontend/src/
├── pages/login.jsx                   # Email/username login
├── pages/register.jsx                # Register + OTP + username
└── components/layout/Topbar.jsx      # @username display
```

---

_Updated: 2025-12-18_
