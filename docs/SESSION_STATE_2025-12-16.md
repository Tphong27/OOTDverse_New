# OOTDverse - Session State Summary

> **Session Date:** 2025-12-16  
> **Use this prompt to continue work in next session**

---

## 1. Những gì đã hoàn thành trong phiên này

### ✅ Authentication Flow - Google Sign-In Fix

- Fixed backend `googleLogin` to return JWT token for existing users
- Fixed frontend `register.jsx` to use `AuthContext.login()` instead of manual localStorage
- Implemented compound unique index `(email, authType)` to separate Local and Google accounts
- Fixed `verifyEmail` to find correct user by `email + authType`
- Fixed `register` and `login` functions to query with `authType: "local"`
- Fixed `hasProfile` logic from `!!user.height` to `user.hasProfile`

### ✅ Forgot Password Feature - NEW

- Added `passwordResetCode`, `passwordResetExpires` fields to User model
- Created email template `sendPasswordResetEmail` in emailService.js
- Created 3 endpoints: `forgot-password`, `verify-reset-code`, `reset-password`
- Created frontend page `/forgot-password` with 4-step flow
- Connected "Quên mật khẩu?" link from login page

### ✅ Redirect Logic Fix

- First-time login (hasProfile=false) → `/user/profile`
- Returning user (hasProfile=true) → `/user/dashboard`

### ✅ Welcome Email

- Added `sendLoginSuccessEmail` call after successful OTP verification

### ✅ Documentation Created

- `README.md` - Updated with Authentication features section
- `docs/feature-authentication.md` - Architecture, API, flows, design decisions
- `docs/Troubleshooting_Tips.md` - Generalized debugging rules

---

## 2. Current State of Codebase

### Backend Changes

```
backend/
├── models/User.js           # +passwordResetCode, +passwordResetExpires, compound index
├── controllers/userController.js  # +forgotPassword, +verifyResetCode, +resetPassword, fixes
├── routes/userRoutes.js     # +3 new routes
└── services/emailService.js # +sendPasswordResetEmail template
```

### Frontend Changes

```
frontend/src/
├── pages/
│   ├── login.jsx            # Fixed redirect logic, Link to forgot-password
│   ├── register.jsx         # Uses AuthContext, handles fromGoogle query
│   └── forgot-password.jsx  # [NEW] 4-step password recovery
└── services/userService.js  # +forgotPassword, +verifyResetCode, +resetPassword
```

### Docs Created

```
docs/
├── feature-authentication.md
└── Troubleshooting_Tips.md
```

---

## 3. Next Steps cần thực hiện

### 🔴 Critical - Build Error trên Vercel

```
Error: /marketplace/ListingCard
TypeError: Cannot read properties of undefined (reading 'favorite_count')
```

**Action:** Di chuyển `ListingCard.jsx` từ `pages/marketplace/` → `components/marketplace/`

### 🟡 Cần deploy

1. Thêm `JWT_SECRET` và `JWT_EXPIRES_IN` vào Render environment variables
2. Redeploy backend on Render
3. Fix ListingCard.jsx → Push → Vercel auto-deploy

### 🟢 Optional improvements

- [ ] Add rate limiting cho forgot-password endpoint (chống spam)
- [ ] Add email verification khi đổi email trong profile
- [ ] Write integration tests cho auth flows
- [ ] Localization - support English

---

## 4. Known Bugs / Edge Cases

### 🐛 Build Error (Blocking Vercel)

```
File: frontend/src/pages/marketplace/ListingCard.jsx
Issue: Next.js treats it as a page and tries to pre-render without props
Fix: Move to components/ folder
```

### ⚠️ Console Warnings (Non-blocking)

```
[GSI_LOGGER]: The given origin is not allowed for the given client ID
→ Google OAuth origin config issue, doesn't break functionality
```

### ⚠️ Edge Cases to Consider

- User với local account cũ (trước khi có compound index) có thể có `authType: undefined`
  → Current code handles with fallback, nhưng nên migrate data
- OTP rate limiting chưa có → có thể spam gửi email

---

## 5. Environment Variables Cần Có

### Backend (Render)

```env
MONGODB_URI=<connection_string>
PORT=5000
JWT_SECRET=<secret_key>           # ⚠️ Cần thêm!
JWT_EXPIRES_IN=7d                 # ⚠️ Cần thêm!
GOOGLE_CLIENT_ID=<client_id>
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=<email>
EMAIL_PASSWORD=<app_password>
EMAIL_FROM=OOTDverse <noreply@ootdverse.com>
```

### Frontend (Vercel)

```env
NEXT_PUBLIC_API_URL=https://ootdverse-backend.onrender.com
NEXT_PUBLIC_GOOGLE_CLIENT_ID=<client_id>
```

---

## Quick Start Next Session

```
Bắt đầu phiên tiếp theo với:

1. Fix Vercel build error:
   - Move ListingCard.jsx to components/
   - Update all imports
   - Push to trigger new build

2. Verify Render có JWT_SECRET

3. Test full auth flow on production
```

---

_Generated: 2025-12-16 19:27_
