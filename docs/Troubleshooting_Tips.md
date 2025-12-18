# Troubleshooting Tips

> Tài liệu tổng hợp các quy tắc debug và troubleshooting từ kinh nghiệm thực tế.

---

## Rule #1: The "Shared Identifier Pattern" Trap

**Áp dụng khi:** Bug liên quan đến lookup/query sử dụng identifier chung (email, username, phone...)

### 🔴 Vấn đề

Khi hệ thống mở rộng để hỗ trợ **multiple sources** cho cùng một entity (ví dụ: local + Google auth), các query cũ chỉ dùng identifier đơn lẻ sẽ **trả về kết quả sai hoặc ngẫu nhiên**.

### 🔍 Dấu hiệu nhận biết

- "Đăng nhập thất bại" dù credentials đúng
- Dữ liệu của user A hiển thị cho user B
- Hành vi không nhất quán (lúc được, lúc không)
- Duplicate key errors khi tạo record mới

### ✅ Quy trình debug

```bash
# Bước 1: Tìm TẤT CẢ các chỗ query bằng identifier
grep -rn "findOne.*email" backend/
grep -rn "findOne.*username" backend/
grep -rn "findOne.*phone" backend/

# Bước 2: Kiểm tra mỗi kết quả
# Hỏi: "Query này có consider TẤT CẢ các discriminator fields không?"

# Bước 3: Thêm discriminator vào query
# Trước: User.findOne({ email })
# Sau:   User.findOne({ email, authType: "local" })
```

### 📋 Checklist trước khi thêm source mới

- [ ] Đã thêm discriminator field vào model? (vd: `authType`)
- [ ] Đã tạo compound unique index? (vd: `email + authType`)
- [ ] Đã grep và update TẤT CẢ queries?
- [ ] Đã test cross-source scenarios?

### 💡 Prevention

```javascript
// ❌ Fragile - chỉ đúng khi có 1 source
const user = await User.findOne({ email });

// ✅ Robust - explicit về source
const user = await User.findOne({ email, authType: "local" });

// ✅ Best - Helper function
const user = await User.findLocalByEmail(email);
```

---

## Rule #2: The "Layered Bug" Debugging Strategy

**Áp dụng khi:** Fix bug này xong, lập tức xuất hiện bug khác

### 🔴 Vấn đề

Bugs "xếp chồng" - mỗi bug che đậy bug tiếp theo, dẫn đến debug mất rất nhiều thời gian.

### ✅ Quy trình debug

```
1. STOP - Đừng fix ngay
2. MAP  - Vẽ full flow từ đầu đến cuối
3. LIST - Liệt kê TẤT CẢ components trong flow
4. TEST - Test từng component riêng lẻ
5. FIX  - Fix theo thứ tự flow (từ đầu → cuối)
```

### 📊 Flow Mapping Template

```
[User Action] → [Frontend] → [API] → [Controller] → [Database]
                    ↓            ↓          ↓            ↓
                 Check:       Check:     Check:       Check:
                 - State      - Payload  - Logic      - Query
                 - Context    - Headers  - Validation - Index
```

---

## Rule #3: The "Implicit vs Explicit" State Bug

**Áp dụng khi:** State management bugs (localStorage, Context, Redux...)

### 🔴 Vấn đề

Code cũ và code mới sử dụng **cùng data nhưng khác keys** hoặc **khác format**.

### 🔍 Dấu hiệu nhận biết

- UI không update sau login/logout
- Refresh page thì mất state
- "User is null" nhưng localStorage có data

### ✅ Debug steps

```bash
# 1. Tìm tất cả access points
grep -rn "localStorage" frontend/src/
grep -rn "useContext" frontend/src/

# 2. Kiểm tra consistency
# - Cùng key name?
# - Cùng data structure?
# - Cùng accessor function?
```

### 💡 Prevention

```javascript
// ❌ Direct access - dễ inconsistent
localStorage.setItem("user", JSON.stringify(user));
localStorage.setItem("token", token);

// ✅ Centralized access - single source of truth
authContext.login(user, token); // Handles ALL storage internally
```

---

## Rule #4: The "External Service Timeout" Pattern

**Áp dụng khi:** Upload/API calls tới third-party services (Cloudinary, S3, Stripe...) thất bại

### 🔴 Vấn đề

Third-party services có latency cao hơn local services, mặc định timeout quá ngắn.

### 🔍 Dấu hiệu nhận biết

- Error: `Request Timeout`, `http_code: 499`, `TimeoutError`
- Upload thành công trên local nhưng fail trên production
- Lỗi xảy ra với file lớn hoặc network chậm

### ✅ Giải pháp

```javascript
// ❌ Không có timeout config
cloudinary.uploader.upload(image, { folder: "avatars" });

// ✅ Thêm timeout phù hợp
cloudinary.uploader.upload(image, {
  folder: "avatars",
  timeout: 120000, // 120 seconds cho upload lớn
});
```

### 📋 Checklist

- [ ] Set timeout >= 60s cho upload operations
- [ ] Thêm retry logic nếu cần
- [ ] Hiển thị loading indicator trên UI
- [ ] Consider chunked upload cho file rất lớn

---

## Rule #5: The "External Image Referrer Policy" Bug

**Áp dụng khi:** Ảnh từ external CDN (Google, Facebook, S3...) không hiển thị

### 🔴 Vấn đề

Browser chặn ảnh từ external domain do **referrer policy** - server từ chối request có referrer header khác origin.

### 🔍 Dấu hiệu nhận biết

- Console: `Failed to load resource: 403`
- Ảnh từ `lh3.googleusercontent.com`, `graph.facebook.com` không load
- Ảnh hiển thị đúng khi mở direct URL trong tab mới

### ✅ Giải pháp

```jsx
// ❌ Bị chặn bởi referrer policy
<img src={user.avatar} alt="Avatar" />

// ✅ Bypass referrer policy
<img
  src={user.avatar}
  alt="Avatar"
  referrerPolicy="no-referrer"  // ← Magic line
/>
```

### 💡 Áp dụng cho

- Google profile pictures
- Facebook avatars
- Any CDN với strict referrer checks

---

## Rule #6: The "Controlled vs Uncontrolled Input" React Warning

**Áp dụng khi:** React warning về input changing from controlled to uncontrolled

### 🔴 Vấn đề

Input value chuyển từ **defined → undefined** khi data chưa load xong hoặc field không tồn tại.

### 🔍 Dấu hiệu nhận biết

```
Warning: A component is changing a controlled input to be uncontrolled.
```

### ✅ Giải pháp

```jsx
// ❌ Có thể undefined khi data chưa load
<input value={profile.phone} />

// ✅ Luôn có fallback value
<input value={profile.phone || ""} />

// ✅ Cho number inputs
<input type="number" value={profile.age || ""} />
```

### 📋 Grep command

```bash
# Tìm tất cả input không có fallback
grep -rn "value={" frontend/src/ | grep -v "||"
```

---

## Rule #7: The "Auth Flow State Verification" Security Bug

**Áp dụng khi:** Auth flow có multiple steps (register → OTP → login)

### 🔴 Vấn đề

User bỏ qua step verification nhưng vẫn có thể login được = **security hole**.

### 🔍 Dấu hiệu nhận biết

- User đăng ký nhưng không verify email → vẫn login được
- User reset password nhưng không confirm → password vẫn đổi
- Bất kỳ multi-step flow nào có thể skip step

### ✅ Quy trình audit

```bash
# 1. Liệt kê tất cả auth endpoints
grep -rn "exports\." backend/controllers/userController.js | grep -E "(login|register|reset)"

# 2. Với mỗi endpoint, check verification status
# login: có check isEmailVerified không?
# resetPassword: có check resetToken validity không?
```

### ✅ Code pattern

```javascript
// ❌ Thiếu verification check
exports.login = async (req, res) => {
  const user = await User.findOne({ email });
  // Login thẳng...
};

// ✅ Có verification check
exports.login = async (req, res) => {
  const user = await User.findOne({ email });

  // Check email verified
  if (!user.isEmailVerified) {
    return res.status(403).json({
      error: "Vui lòng xác thực email trước khi đăng nhập.",
      requireVerification: true,
      email: user.email,
    });
  }

  // Continue login...
};
```

### 📋 Checklist cho auth flows

- [ ] Register → có yêu cầu verify email?
- [ ] Login → có check isEmailVerified?
- [ ] Reset password → có check token expiry?
- [ ] Unverified user có thể access protected routes không?

---

## Quick Reference Card

| Triệu chứng                     | Nghi ngờ                       | Grep command                |
| ------------------------------- | ------------------------------ | --------------------------- |
| Login fail với đúng credentials | Query thiếu discriminator      | `grep -rn "findOne.*email"` |
| Duplicate key error             | Unique index chưa compound     | Check model indexes         |
| State bị mất sau refresh        | localStorage key mismatch      | `grep -rn "localStorage"`   |
| Fix A → Break B                 | Layered bugs                   | Map full flow trước         |
| Hành vi không nhất quán         | Race condition hoặc wrong user | Add logging ở mỗi step      |
| Upload timeout 499              | Third-party service timeout    | Add `timeout: 120000`       |
| External image 403              | Referrer policy                | Add `referrerPolicy`        |
| Controlled→Uncontrolled warning | Missing fallback value         | Add `\|\| ""`               |
| Skip verification still works   | Missing auth state check       | Audit all auth endpoints    |

---

_Cập nhật lần cuối: 2025-12-18_
