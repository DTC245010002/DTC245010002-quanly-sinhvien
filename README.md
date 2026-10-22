# Hệ thống Quản lý Sinh viên - DTC245010002

Website CRUD sinh viên, lớp, điểm số (Node.js/Express + MySQL), triển khai bằng Docker Compose, có giám sát (Prometheus + Grafana) và log tập trung (Loki + Promtail).

## Thành phần
| Service | Vai trò |
|---|---|
| app | Express, CRUD sinh viên, lớp, điểm, xuất `/metrics` |
| db | MySQL 8.0 |
| phpmyadmin | Quản trị MySQL |
| nginx | Reverse proxy, HTTPS tự ký, security headers |
| prometheus | Thu thập metrics |
| grafana | Dashboard giám sát |
| cadvisor | Metrics container (cần `privileged` để đọc cgroup) |
| mysqld-exporter | Metrics MySQL |
| nginx-exporter | Metrics Nginx |
| loki + promtail | Log tập trung |

## Yêu cầu
Docker, Docker Compose v2, openssl, git.

## Cách chạy
1. `cp .env.example .env` rồi đặt mật khẩu mạnh cho cả 4 biến trong `.env`
2. Tạo chứng chỉ HTTPS tự ký:
```bash
   openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
     -keyout nginx/certs/server.key -out nginx/certs/server.crt \
     -subj "/C=VN/ST=BacNinh/O=DTC245010002/CN=localhost"
```
3. `docker compose up -d --build`
4. `docker compose ps`

## Địa chỉ truy cập
| Dịch vụ | URL |
|---|---|
| Website | https://IP-may-chu (chấp nhận chứng chỉ tự ký) |
| phpMyAdmin | http://localhost:8081 (bind 127.0.0.1, dùng SSH tunnel) |
| Grafana | http://localhost:3001 (bind 127.0.0.1, user admin, mật khẩu `GRAFANA_ADMIN_PASSWORD`) |

SSH tunnel: `ssh -L 3001:127.0.0.1:3001 -L 8081:127.0.0.1:8081 user@IP-may-chu`

## Giám sát
Dashboard Grafana: container (CPU, Memory, Network từ cAdvisor), MySQL (ID 7362), Nginx (ID 12708), web app (`http_request_duration_seconds`).

## Truy vấn LogQL (Grafana → Explore → Loki)
```logql
{service="nginx"}
{service="nginx"} != "stub_status"
{service="app"} |= "error"
{service="nginx"} |= "POST"
sum by (service) (count_over_time({service=~".+"}[5m]))
```

## Hardening
- Container app chạy user `node` (non-root), `read_only`, `cap_drop: ALL`, `no-new-privileges`
- Mạng `backend` là `internal`, DB không publish port; Prometheus, Loki không publish port
- phpMyAdmin và Grafana chỉ bind 127.0.0.1
- Mật khẩu mạnh, ngẫu nhiên, lưu trong `.env` (không commit)
- User DB `appuser` chỉ có SELECT/INSERT/UPDATE/DELETE trên `sinhvien_db`; `exporter` quyền tối thiểu
- Nginx: security headers, ẩn phiên bản, chuyển HTTP sang HTTPS, chặn `/metrics`
- Câu lệnh SQL tham số hóa chống SQL injection
