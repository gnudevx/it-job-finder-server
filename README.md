<div align="center">

# 🔍 IT Job Finder — Back-End Server

**Nền tảng tìm kiếm việc làm IT được xây dựng theo kiến trúc RESTful API hiện đại**

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/) [![Express](https://img.shields.io/badge/Express-v5.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/) [![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongoosejs.com/) [![Socket.IO](https://img.shields.io/badge/Socket.IO-v4.x-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/) [![JWT](https://img.shields.io/badge/Auth-JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/) [![License: ISC](https://img.shields.io/badge/License-ISC-blue?style=for-the-badge)](https://opensource.org/licenses/ISC)

[Tính năng](#-tính-năng-nổi-bật) · [Kiến trúc](#-kiến-trúc-hệ-thống) · [Cài đặt](#-hướng-dẫn-cài-đặt) · [API Docs](#-api-endpoints) · [Sơ đồ tư duy](#-sơ-đồ-tư-duy-dự-án)

</div>

---

## 📌 Giới thiệu dự án

**IT Job Finder Server** là phần back-end của nền tảng tuyển dụng IT, cho phép:

- **Ứng viên** tìm kiếm, ứng tuyển việc làm và nhận thông báo real-time.
- **Nhà tuyển dụng** đăng tin, quản lý hồ sơ và trao đổi trực tiếp với ứng viên.
- **Hệ thống** phân tích CV tự động (hỗ trợ `.pdf`, `.docx`) và gợi ý việc làm phù hợp.

Dự án được xây dựng với mục tiêu **scalable**, **maintainable** và tuân thủ các best practices của Node.js hiện đại (ESM, ESLint, Prettier, structured logging).

---

## ✨ Tính năng nổi bật

| Nhóm tính năng | Chi tiết |
| --- | --- |
| 🔐 **Xác thực & Phân quyền** | JWT (Access + Refresh Token), Google OAuth 2.0, bcrypt password hashing |
| 📄 **Phân tích CV thông minh** | Đọc file PDF (`pdf-parse`) và Word (`mammoth`), tự động trích xuất thông tin |
| 💬 **Realtime Chat** | Socket.IO cho phép nhà tuyển dụng và ứng viên trao đổi trực tiếp |
| 📁 **Upload file** | Multer xử lý upload CV, avatar; hỗ trợ validate định dạng & kích thước |
| 🌐 **Phát hiện ngôn ngữ** | `franc` tự động nhận diện ngôn ngữ nội dung CV |
| 🛡️ **Bảo mật** | Helmet (HTTP headers), CORS có cấu hình, cookie-parser, input validation với Zod |
| 📊 **Logging** | Winston + Daily Rotate File — ghi log theo ngày, phân cấp rõ ràng |
| 🔄 **Proxy** | http-proxy-middleware cho phép tích hợp dịch vụ ngoài |

---

## 🏗️ Kiến trúc hệ thống

```
Client (React / Mobile)
        │
        ▼
   ┌─────────────────────────────────────┐
   │         Express HTTP Server          │
   │  ┌─────────┐  ┌──────────────────┐  │
   │  │ Middlew │  │   REST API Router │  │
   │  │  -ares  │  │  /api/v1/...     │  │
   │  └─────────┘  └──────────────────┘  │
   │         Socket.IO Server             │
   └──────────────────┬──────────────────┘
                      │
        ┌─────────────┼──────────────┐
        ▼             ▼              ▼
   ┌─────────┐  ┌──────────┐  ┌──────────┐
   │ MongoDB │  │  Multer  │  │ External │
   │Mongoose │  │ (Upload) │  │  APIs    │
   └─────────┘  └──────────┘  │(Google   │
                               │ OAuth)   │
                               └──────────┘
```

### Luồng xử lý Request

```
Request → Helmet → CORS → Cookie Parser → Morgan Logger
        → JWT Middleware (nếu cần auth)
        → Zod Validation
        → Controller
        → Service Layer
        → Mongoose Model ↔ MongoDB
        → Response (JSON)
```

---

## 📁 Cấu trúc thư mục

```
it-job-finder-server/
├── src/
│   ├── config/          # Cấu hình DB, environment, socket
│   ├── controllers/     # Xử lý request/response (thin layer)
│   ├── services/        # Business logic chính
│   ├── models/          # Mongoose schemas & models
│   ├── routes/          # Định nghĩa API routes
│   ├── middlewares/     # Auth, upload, error handling, logging
│   ├── utils/           # Helper functions, constants
│   ├── validations/     # Zod schemas cho input validation
│   └── server.js        # Entry point — khởi động server & socket
├── uploads/             # Thư mục chứa file upload (gitignored)
├── .env                 # Biến môi trường (không commit)
├── .prettierrc.json     # Cấu hình format code
├── eslint.config.js     # Cấu hình lint
├── craco.config.js
└── package.json
```

> **Kiến trúc phân tầng**: Router → Controller → Service → Model. Mỗi tầng có trách nhiệm riêng biệt, dễ test và bảo trì.

---

## 🧠 Sơ đồ tư duy dự án

```
IT Job Finder Server
│
├── 🔐 Authentication
│   ├── JWT Strategy
│   │   ├── Access Token (short-lived)
│   │   └── Refresh Token (long-lived, lưu cookie httpOnly)
│   ├── Google OAuth 2.0
│   │   └── google-auth-library → verify ID Token
│   └── Password Security
│       └── bcrypt / bcryptjs hashing
│
├── 👤 User Management
│   ├── Đăng ký / Đăng nhập
│   ├── Cập nhật profile
│   ├── Upload avatar (Multer)
│   └── Phân quyền (Candidate / Employer / Admin)
│
├── 💼 Job Management
│   ├── CRUD tin tuyển dụng (Employer)
│   ├── Tìm kiếm & lọc việc làm (Candidate)
│   ├── Ứng tuyển & quản lý đơn
│   └── Gợi ý việc làm theo CV
│
├── 📄 CV Processing
│   ├── Upload CV (.pdf, .docx)
│   ├── Trích xuất text
│   │   ├── pdf-parse (cho PDF)
│   │   └── mammoth (cho Word)
│   ├── Phát hiện ngôn ngữ (franc)
│   └── Phân tích & gợi ý
│
├── 💬 Real-time Features (Socket.IO)
│   ├── Chat Employer ↔ Candidate
│   ├── Thông báo ứng tuyển real-time
│   └── Online status tracking
│
├── 🛡️ Security & Middleware
│   ├── Helmet (HTTP Security Headers)
│   ├── CORS (whitelist domains)
│   ├── Cookie Parser
│   ├── Input Validation (Zod)
│   └── Rate Limiting (nếu có)
│
├── 📊 Logging & Monitoring
│   ├── Morgan (HTTP request logs)
│   └── Winston
│       ├── Console (dev)
│       └── Daily Rotate File (prod)
│
└── 🔧 Dev Tools
    ├── ESLint (code quality)
    ├── Prettier (code format)
    └── Nodemon (auto-restart dev)
```

---

## ⚙️ Công nghệ sử dụng

### Core

| Công nghệ    | Phiên bản | Mục đích       |
| ------------ | --------- | -------------- |
| **Node.js**  | v18+      | Runtime        |
| **Express**  | v5.x      | HTTP Framework |
| **MongoDB**  | Latest    | Database       |
| **Mongoose** | v8.x      | ODM            |

### Authentication & Security

| Thư viện              | Mục đích                 |
| --------------------- | ------------------------ |
| `jsonwebtoken`        | Tạo & verify JWT         |
| `bcrypt` / `bcryptjs` | Mã hoá mật khẩu          |
| `google-auth-library` | Xác thực Google OAuth    |
| `helmet`              | Bảo mật HTTP headers     |
| `cors`                | Kiểm soát cross-origin   |
| `zod`                 | Validate dữ liệu đầu vào |

### File Processing

| Thư viện    | Mục đích                   |
| ----------- | -------------------------- |
| `multer`    | Upload file                |
| `pdf-parse` | Đọc nội dung PDF           |
| `mammoth`   | Đọc nội dung DOCX          |
| `franc`     | Phát hiện ngôn ngữ văn bản |

### Real-time & Others

| Thư viện                    | Mục đích                |
| --------------------------- | ----------------------- |
| `socket.io`                 | WebSocket / real-time   |
| `winston`                   | Structured logging      |
| `winston-daily-rotate-file` | Rotate log files        |
| `morgan`                    | HTTP request logger     |
| `moment`                    | Xử lý ngày giờ          |
| `axios`                     | HTTP client             |
| `dotenv`                    | Quản lý biến môi trường |

---

## 🚀 Hướng dẫn cài đặt

### Yêu cầu hệ thống

- **Node.js** >= 18.x
- **MongoDB** >= 6.x (local hoặc MongoDB Atlas)
- **npm** >= 9.x

### 1. Clone repository

```bash
git clone https://github.com/gnudevx/it-job-finder-server.git
cd it-job-finder-server
```

### 2. Cài đặt dependencies

```bash
npm install
```

### 3. Cấu hình biến môi trường

Tạo file `.env` tại thư mục gốc:

```env
# Server
PORT=8080
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/it-job-finder

# JWT
JWT_ACCESS_SECRET=your_access_secret_key
JWT_REFRESH_SECRET=your_refresh_secret_key
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id

# CORS
CLIENT_URL=http://localhost:3000

# Upload
MAX_FILE_SIZE=10485760   # 10MB in bytes
UPLOAD_PATH=./uploads
```

### 4. Chạy ứng dụng

```bash
# Development (với auto-reload & lint check)
npm run dev

# Production
npm start
```

Server khởi động tại: `http://localhost:8080`

---

## 📡 API Endpoints

> Base URL: `/api/v1`

### Auth

| Method | Endpoint         | Mô tả                  | Auth |
| ------ | ---------------- | ---------------------- | ---- |
| `POST` | `/auth/register` | Đăng ký tài khoản      | ❌   |
| `POST` | `/auth/login`    | Đăng nhập              | ❌   |
| `POST` | `/auth/google`   | Đăng nhập Google OAuth | ❌   |
| `POST` | `/auth/refresh`  | Làm mới Access Token   | ❌   |
| `POST` | `/auth/logout`   | Đăng xuất              | ✅   |

### User / Profile

| Method | Endpoint           | Mô tả                 | Auth |
| ------ | ------------------ | --------------------- | ---- |
| `GET`  | `/users/me`        | Lấy thông tin cá nhân | ✅   |
| `PUT`  | `/users/me`        | Cập nhật profile      | ✅   |
| `POST` | `/users/me/avatar` | Upload ảnh đại diện   | ✅   |

### Jobs

| Method   | Endpoint    | Mô tả                          | Auth        |
| -------- | ----------- | ------------------------------ | ----------- |
| `GET`    | `/jobs`     | Danh sách việc làm (có filter) | ❌          |
| `GET`    | `/jobs/:id` | Chi tiết 1 tin tuyển dụng      | ❌          |
| `POST`   | `/jobs`     | Đăng tin tuyển dụng            | ✅ Employer |
| `PUT`    | `/jobs/:id` | Cập nhật tin                   | ✅ Employer |
| `DELETE` | `/jobs/:id` | Xoá tin                        | ✅ Employer |

### CV & Applications

| Method | Endpoint        | Mô tả                   | Auth         |
| ------ | --------------- | ----------------------- | ------------ |
| `POST` | `/cv/upload`    | Upload CV (PDF/DOCX)    | ✅           |
| `POST` | `/applications` | Ứng tuyển 1 vị trí      | ✅ Candidate |
| `GET`  | `/applications` | Danh sách đơn ứng tuyển | ✅           |

### Messages (REST + Socket)

| Method | Endpoint                    | Mô tả            | Auth |
| ------ | --------------------------- | ---------------- | ---- |
| `GET`  | `/messages/:conversationId` | Lịch sử tin nhắn | ✅   |
| `POST` | `/messages`                 | Gửi tin nhắn     | ✅   |

---

## 🔌 Socket.IO Events

```
Client → Server:
  join_room     — Tham gia phòng chat (conversationId)
  send_message  — Gửi tin nhắn mới
  typing        — Đang gõ...

Server → Client:
  receive_message  — Nhận tin nhắn mới
  user_typing      — Người dùng đang gõ
  notification     — Thông báo mới (ứng tuyển, v.v.)
```

---

## 🔄 Quy trình phát triển

```
1. Lên ý tưởng & xác định yêu cầu
        │
        ▼
2. Thiết kế DB Schema (Mongoose models)
        │
        ▼
3. Xây dựng API routes & controllers
        │
        ▼
4. Viết business logic trong services
        │
        ▼
5. Thêm validation (Zod) & middleware
        │
        ▼
6. Test API với Postman / Thunder Client
        │
        ▼
7. Kết nối Socket.IO cho tính năng real-time
        │
        ▼
8. Code review (ESLint) + Format (Prettier)
        │
        ▼
9. Commit & push lên GitHub (master branch)
```

---

## 🧪 Scripts

```bash
npm run dev      # Chạy dev server với nodemon + lint tự động
npm start        # Chạy production server
npm run lint     # Kiểm tra lỗi code với ESLint
npm run format   # Format toàn bộ code với Prettier
```

---

## 📂 Git Workflow

```
master ──────────────────────────────────►  Production Ready
   │
   ├── feat/auth-google-oauth
   ├── feat/cv-parser
   ├── feat/realtime-chat
   └── fix/token-refresh-bug
```

Quy tắc commit message:

```
feat:   Thêm tính năng mới
fix:    Sửa bug
refactor: Cải thiện code không thay đổi logic
docs:   Cập nhật tài liệu
chore:  Cấu hình, dependencies
```

---

## 👨‍💻 Tác giả

**gnudevx**

- GitHub: [@gnudevx](https://github.com/gnudevx)

---

## 📄 License

Dự án này sử dụng giấy phép **ISC**.

---

<div align="center">

Made with ❤️ using Node.js + Express + MongoDB

</div>
