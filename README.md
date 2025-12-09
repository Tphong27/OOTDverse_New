# OOTDverse - Tủ Đồ Thời Trang Thông Minh & Bền Vững

**OOTDverse** là nền tảng thời trang thông minh dành cho Gen Z, kết hợp công nghệ **AI (Artificial Intelligence)** và **AR (Augmented Reality)** để giải quyết vấn đề "không có gì để mặc", giảm thiểu rủi ro mua sắm online và thúc đẩy thời trang bền vững thông qua việc trao đổi quần áo cũ.

Dự án được phát triển bởi **Nhóm 5 - Lớp SE1869-NJ - Đại học FPT**.

-----

## 🌟 Tính Năng Chính (Key Features)

1.  **Tủ Đồ Ảo (Virtual Wardrobe):**

      * Số hóa tủ đồ cá nhân bằng cách upload ảnh.
      * Tự động phân loại quần áo (Category, Color, Season) bằng AI.
      * Quản lý items dễ dàng (Thêm, sửa, xóa).

2.  **AI Stylist (Trợ lý phối đồ):**

      * Gợi ý outfit dựa trên thời tiết, dịp (đi học, đi tiệc, đi chơi) và phong cách cá nhân.
      * Sử dụng công nghệ Google Gemini để phân tích và đưa ra lời khuyên phối đồ.

3.  **AR Try-On (Thử đồ ảo):**

      * Cho phép người dùng ướm thử quần áo lên người thông qua Camera hoặc ảnh tải lên.
      * Giảm thiểu rủi ro mua sai kích cỡ hoặc không hợp kiểu dáng.

4.  **Marketplace (Sàn giao dịch 2hand):**

      * Mua bán, trao đổi quần áo cũ trong cộng đồng sinh viên.
      * Tính năng xác thực người dùng để đảm bảo an toàn giao dịch.

5.  **Cộng Đồng & Gamification:**

      * Chia sẻ OOTD (Outfit of the Day).
      * Tham gia thử thách phối đồ nhận thưởng.

-----

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

### Frontend

  * **Framework:** Next.js 14
  * **Styling:** TailwindCSS
  * **AR/3D:** `@banuba/webar`, `@google/model-viewer`, `three.js`
  * **State Management:** React Context API

### Backend

  * **Runtime:** Node.js
  * **Framework:** Express.js (Dự kiến dựa trên cấu trúc controller/route)
  * **Database:** MongoDB (Dựa trên cấu trúc Mongoose Models)
  * **Authentication:** JWT (JSON Web Token)

### AI Service (Microservice)

  * **Language:** Python
  * **Framework:** FastAPI
  * **AI Model:** Google Gemini (`gemini-flash-latest`)
  * **Image Processing:** Pillow

-----

## 🚀 Hướng Dẫn Cài Đặt (Installation)

Dự án bao gồm 3 thành phần chính: `frontend`, `backend`, và `ai-service`. Bạn cần chạy cả 3 để hệ thống hoạt động đầy đủ.

### 1\. Khởi chạy AI Service (Python)

Đây là service xử lý phân tích ảnh và gợi ý phối đồ.

```bash
cd ai-service
# Cài đặt các thư viện
pip install -r requirements.txt

# Tạo file .env và thêm GEMINI_API_KEY của bạn
# (Xem mẫu trong phần Cấu hình môi trường)

# Chạy server
python main.py
# AI Service sẽ chạy tại: http://localhost:8000
```

### 2\. Khởi chạy Backend (Node.js)

```bash
cd backend
# Cài đặt dependencies
npm install

# Cấu hình file .env (Database, JWT Secret...)

# Chạy server
npm start
# Backend thường chạy tại: http://localhost:5000 (hoặc port bạn cấu hình)
```

### 3\. Khởi chạy Frontend (Next.js)

```bash
cd frontend
# Cài đặt dependencies
npm install

# Chạy môi trường development
npm run dev
# Truy cập ứng dụng tại: http://localhost:3000
```

-----

## ⚙️ Cấu Hình Môi Trường (.env)

Bạn cần tạo file `.env` (hoặc `.env.local` cho frontend) trong từng thư mục tương ứng.

**1. ai-service/.env**

```env
GEMINI_API_KEY=your_google_gemini_api_key_here
```

**2. backend/.env** (Gợi ý)

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
AI_SERVICE_URL=http://localhost:8000
```

**3. frontend/.env.local**

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

-----

## 👥 Thành Viên Nhóm (Team Members)

| STT | Họ và Tên | MSSV | Vai Trò |
|:---:|:---|:---|:---|
| 1 | Khuất Thị Thanh Thảo | HS180732 | - |
| 2 | Lý Thị Ngọc Mai | HS180502 | - |
| 3 | Nguyễn Nguyệt Anh | HE180051 | - |
| 4 | Nguyễn Khánh Toàn | HE181528 | - |
| 5 | Nguyễn Thanh Phong | HE182099 | - |
| 6 | Nguyễn Duy Khiêm | HE181770 | - |

-----

## 📄 License

Dự án thuộc khuôn khổ môn học EXE101 tại Đại học FPT. Bản quyền thuộc về Nhóm 5.
