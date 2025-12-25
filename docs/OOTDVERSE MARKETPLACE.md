
# 📘 OOTDVERSE MARKETPLACE

## 📦 SHIPPING & 💰 PAYMENT – BUSINESS + TECH SPEC

---

# PHẦN I – SHIPPING (VẬN CHUYỂN)

---

## I.1. MỤC TIÊU TỔNG QUÁT (SHIPPING)

| Giai đoạn | Mục tiêu                                  |
| --------- | ----------------------------------------- |
| GĐ 1      | Hoạt động được, không phụ thuộc bên thứ 3 |
| GĐ 2      | Có tracking + logic chuẩn hơn             |
| GĐ 3      | Tích hợp API giao hàng thật               |

---

## I.2. GIAI ĐOẠN 1 – SHIPPING MVP (HIỆN TẠI)

### 🎯 Mục tiêu

* Người mua **chọn cách nhận hàng**
* Người bán **xử lý giao hàng**
* Không cần API ship
* Không cần key

---

### I.2.1. Các phương thức vận chuyển

```text
shipping_method:
- delivery
- meetup
```

---

### I.2.2. DELIVERY – GIAO HÀNG

#### 🔹 Nghiệp vụ (Business)

1. Buyer:

   * Chọn địa chỉ giao hàng
   * Chấp nhận phí ship (ước lượng / nhập tay)
2. Seller:

   * Tự chọn đơn vị giao hàng (GHN, GHTK, Viettel Post…)
   * Tự gửi hàng ngoài đời thực
3. Platform:

   * **Chỉ lưu thông tin**
   * Không gọi hãng vận chuyển

📌 Trách nhiệm giao hàng **thuộc seller**

---

#### 🔹 Kỹ thuật (Technical)

**Order cần có:**

```js
shipping: {
  method: "delivery",
  address_id,
  shipping_fee,
  shipping_status
}
```

**shipping_status (GĐ1):**

```text
pending      // chưa gửi
shipping     // seller đã gửi
delivered    // buyer xác nhận đã nhận
```

---

#### 🔹 UI bắt buộc

* Form địa chỉ
* Hiển thị phí ship
* Trạng thái đơn hàng (text)

---

### I.2.3. MEETUP – GẶP MẶT TRỰC TIẾP

#### 🔹 Nghiệp vụ

1. Buyer chọn **Meetup**
2. Hai bên:

   * Tự chat & hẹn địa điểm
   * Tự trao hàng + tiền
3. Platform:

   * Không can thiệp
   * Chỉ ghi nhận trạng thái

📌 Không có:

* Địa chỉ giao hàng
* Phí ship
* Tracking

---

#### 🔹 Kỹ thuật

```js
shipping: {
  method: "meetup",
  shipping_fee: 0,
  meetup_info: {
    location,
    time
  },
  shipping_status
}
```

**shipping_status (meetup):**

```text
waiting_meetup
met
completed
```

---

#### 🔹 UI

* Ẩn form địa chỉ
* Hiển thị hướng dẫn meetup
* Warning rõ ràng

---

## I.3. GIAI ĐOẠN 2 – SHIPPING NÂNG CAO

### 🎯 Mục tiêu

* Có bằng chứng giao hàng
* Giảm tranh chấp

### Bổ sung:

* Upload ảnh gửi hàng
* Tracking code thủ công
* Lịch meetup có reminder

---

## I.4. GIAI ĐOẠN 3 – SHIPPING API THẬT

### 🎯 Mục tiêu

* Tự động hoá

### Tích hợp:

* GHN / GHTK / Viettel Post
* API tính phí
* API tracking

📌 **Chỉ làm khi có pháp nhân**

---

# PHẦN II – PAYMENT (THANH TOÁN)

---

## II.1. MỤC TIÊU TỔNG QUÁT (PAYMENT)

| Giai đoạn | Mục tiêu                 |
| --------- | ------------------------ |
| GĐ 1      | An toàn, không giữ tiền  |
| GĐ 2      | Có dispute               |
| GĐ 3      | Escrow / Payment gateway |

---

## II.2. GIAI ĐOẠN 1 – PAYMENT MVP (HIỆN TẠI)

### 🎯 Chiến lược

👉 **Thanh toán ngoài hệ thống**

OOTDverse:

* Không giữ tiền
* Không làm trung gian
* Không chịu trách nhiệm dòng tiền

---

### II.2.1. Các phương thức thanh toán

```text
payment_method:
- bank_transfer
- meetup_cash
- cod (tuỳ chọn)
```

---

### II.2.2. PAYMENT STATUS FLOW (CỐT LÕI)

```text
payment_status:
- pending
- buyer_marked
- seller_confirmed
```

---

### II.2.3. Flow chi tiết

#### 🧍 Buyer

1. Thanh toán ngoài đời
2. Nhấn **“Tôi đã thanh toán”**

#### 🧑 Seller

3. Kiểm tra tiền
4. Nhấn **“Xác nhận đã nhận tiền”**

📌 **Không auto-paid**

---

### II.2.4. Kỹ thuật

```js
payment: {
  method,
  status,
  amount,
  confirmed_at
}
```

---

### II.2.5. API tối thiểu

```http
POST   /orders
PATCH  /orders/:id/mark-paid
PATCH  /orders/:id/confirm-payment
```

---

### II.2.6. UI bắt buộc

* Warning pháp lý:

> OOTDverse không giữ tiền…

* Hiển thị rõ:

  * Ai đã bấm gì
  * Trạng thái hiện tại

---

## II.3. GIAI ĐOẠN 2 – PAYMENT NÂNG CAO

### 🎯 Mục tiêu

* Giảm gian lận

### Bổ sung:

* Upload ảnh chuyển khoản
* Report giao dịch
* Tranh chấp (manual)

---

## II.4. GIAI ĐOẠN 3 – PAYMENT THẬT

### 🎯 Mục tiêu

* Marketplace đúng nghĩa

### Tích hợp:

* VNPay / MoMo
* Escrow
* Webhook
* Auto split payment

📌 Cần:

* Pháp nhân
* KYC
* Kế toán

---

# PHẦN III – KẾT LUẬN

### ✅ Giai đoạn 1 của bạn:

* Logic **ĐÚNG**
* Code **PHÙ HỢP**
* Không thiếu nghiệp vụ cốt lõi

👉 **ĐỦ ĐIỀU KIỆN BÁO CÁO & DEMO**

---

Nếu bạn muốn:

* 📄 Chuyển thành **Word / PDF**
* 🧩 Map từng mục → **file code hiện tại**
* 🔍 Review xem **Order + Shipping code của bạn match 100% chưa**

👉 Nói mình: **“Map spec → code”** hoặc **“Xuất PDF”**.
