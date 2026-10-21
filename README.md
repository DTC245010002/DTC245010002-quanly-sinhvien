# Hệ thống Quản lý Sinh viên - DTC245010002

Website CRUD sinh viên, lớp, điểm số (Node.js/Express + MySQL), triển khai hoàn toàn bằng Docker Compose.

## Thành phần
- **app**: Express, CRUD sinh viên, lớp, điểm
- **db**: MySQL 8.0
- **phpmyadmin**: công cụ quản trị MySQL
- **nginx**: reverse proxy, HTTPS tự ký, security headers

## Yêu cầu
Docker, Docker Compose v2, openssl, git.

## Cách chạy
1. Tạo file cấu hình mật khẩu:
```bash
   cp .env.example .env
```
   Sau đó sửa `.env`, đặt mật khẩu mạnh cho cả 4 biến.
2. Tạo chứng chỉ HTTPS tự ký:
```bash
   openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
     -keyout nginx/certs/server.key -out nginx/certs/server.crt \
     -subj "/C=VN/ST=BacNinh/O=DTC245010002/CN=localhost"
```
3. Khởi động:
```bash
   docker compose up -d --build
   docker compose ps
```

## Địa chỉ truy cập
| Dịch vụ | URL |
|---|---|
| Website | https://IP-may-chu (chấp nhận chứng chỉ tự ký) |
| phpMyAdmin | http://localhost:8081 (chỉ bind 127.0.0.1, dùng SSH tunnel) |

## Bảo mật đã áp dụng
- Container app chạy bằng user `node` (non-root), `read_only`, `cap_drop: ALL`
- Mạng `backend` là `internal`, DB không publish port
- Mật khẩu lưu trong `.env` (không commit)
- User DB `appuser` chỉ có SELECT/INSERT/UPDATE/DELETE trên `sinhvien_db`
- Nginx: security headers, ẩn phiên bản, tự chuyển HTTP sang HTTPS
