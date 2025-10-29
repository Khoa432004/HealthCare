# Hướng dẫn Setup Dự án HealthCare

Hệ thống quản lý chăm sóc sức khỏe với Backend (Spring Boot) và Frontend (Next.js)

## 📋 Yêu cầu

- **Backend:**
  - Java 17+
  - Maven 3.8+
  - PostgreSQL 14+
  - Redis (optional, for caching)

- **Frontend:**
  - Node.js 18+
  - npm hoặc pnpm

## 🚀 Cài đặt Backend

### 1. Cấu hình Database

Tạo database PostgreSQL:

```sql
CREATE DATABASE healthcare_db;
```

### 2. Cấu hình Application Properties

File `Backend/HealthCare/src/main/resources/application.properties` đã được cấu hình sẵn. Nếu cần thay đổi, cập nhật:

```properties
# DataSource
spring.datasource.url=jdbc:postgresql://your-db-host:5432/healthcare_db
spring.datasource.username=your-username
spring.datasource.password=your-password

# Server
server.port=8080
```

### 3. Chạy Backend

```bash
cd Backend/HealthCare

# Sử dụng Maven Wrapper
./mvnw clean install
./mvnw spring-boot:run

# Hoặc nếu đã cài Maven
mvn clean install
mvn spring-boot:run
```

Backend sẽ chạy tại: **http://localhost:8080**

### 4. Kiểm tra Backend

Mở trình duyệt và truy cập:
- API Docs: http://localhost:8080/swagger-ui/index.html
- Health Check: http://localhost:8080/actuator/health

## 🎨 Cài đặt Frontend

### 1. Cài đặt Dependencies

```bash
cd Frontend
npm install
```

### 2. Tạo file Environment

Tạo file `.env.local` trong thư mục `Frontend`:

```bash
# Windows
copy NUL .env.local

# Linux/Mac
touch .env.local
```

### 3. Cấu hình Environment Variables

Thêm vào file `.env.local`:

```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080

# Environment
NODE_ENV=development
```

### 4. Chạy Frontend

```bash
npm run dev
```

Frontend sẽ chạy tại: **http://localhost:3000**

## 🔐 Tích hợp API Login

### Cấu trúc Files

```
Frontend/
├── lib/
│   ├── api-config.ts          # Cấu hình API endpoints
│   └── api-client.ts          # HTTP client
├── services/
│   └── auth.service.ts        # Authentication service
└── components/
    └── login-form.tsx         # Login form với API integration
```

### Sử dụng Login API

Login form tại `/login` đã được tích hợp với backend API:

```typescript
// API endpoint: POST /api/auth/login
// Request body:
{
  "email": "user@example.com",
  "password": "password123"
}

// Response:
{
  "statusCode": 200,
  "message": "Login successfully!",
  "data": {
    "access_token": "eyJhbGc...",
    "refresh_token": "eyJhbGc...",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "fullName": "User Name",
      "role": "PATIENT",
      "accountStatus": "ACTIVE"
    }
  }
}
```

### Role-based Routing

Sau khi login, user được redirect dựa trên role:

| Role | Dashboard URL |
|------|---------------|
| ADMIN | /admin-dashboard |
| CLINIC_ADMIN | /admin-dashboard |
| DOCTOR | /doctor-dashboard |
| PATIENT | /patient-dashboard |

## 🔧 CORS Configuration

Backend đã được cấu hình CORS để cho phép frontend gọi API:

File: `Backend/HealthCare/src/main/java/com/example/HealthCare/config/CorsConfig.java`

Allowed Origins:
- http://localhost:3000
- http://127.0.0.1:3000
- https://localhost:3000

## 📚 API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | Đăng nhập |
| POST | /api/auth/register | Đăng ký |
| POST | /api/auth/logout | Đăng xuất |
| POST | /api/auth/refresh | Refresh token |
| PUT | /api/auth/change-password | Đổi mật khẩu |
| POST | /api/auth/forget-password | Quên mật khẩu |
| POST | /api/auth/reset-password | Reset mật khẩu |

### Registration (2-Step)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register/personal-info | Bước 1: Thông tin cá nhân |
| POST | /api/auth/register/professional-info | Bước 2: Thông tin nghề nghiệp (Bác sĩ) |

## 🧪 Testing

### Test Backend API với cURL

```bash
# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

### Test Frontend Login

1. Mở trình duyệt: http://localhost:3000/login
2. Nhập email và password
3. Click "Đăng nhập"
4. Kiểm tra Console (F12) để xem logs
5. Sau khi login thành công, sẽ redirect đến dashboard tương ứng

## 🐛 Troubleshooting

### Backend không chạy

- Kiểm tra PostgreSQL đã chạy chưa
- Kiểm tra Redis đã chạy chưa (nếu sử dụng cache)
- Xem logs trong terminal
- Kiểm tra port 8080 có bị chiếm không

### Frontend không kết nối được Backend

- Kiểm tra Backend đang chạy tại http://localhost:8080
- Kiểm tra file `.env.local` có cấu hình đúng không
- Mở Console (F12) để xem lỗi CORS hoặc Network
- Clear browser cache và reload

### CORS Error

Nếu vẫn gặp lỗi CORS:
- Restart Backend sau khi thêm CorsConfig
- Kiểm tra SecurityConfig đã enable CORS chưa
- Thử dùng Chrome với flag: `--disable-web-security`

### Token không được lưu

- Kiểm tra localStorage trong Browser DevTools (F12 > Application > Local Storage)
- Đảm bảo API response có chứa access_token và refresh_token

## 📝 Commit Changes

Sau khi setup xong, commit các thay đổi:

```bash
git add .
git commit -m "Integrate login API with backend"
git push origin main
```

## 📖 Tài liệu thêm

- [Frontend API Setup Guide](Frontend/API_SETUP.md)
- [Backend API Documentation](http://localhost:8080/swagger-ui/index.html)

## 🤝 Liên hệ

Nếu gặp vấn đề, vui lòng tạo issue hoặc liên hệ team.

---

**Happy Coding! 🎉**

