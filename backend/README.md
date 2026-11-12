# ShuttleGo Backend

API cho ShuttleGo: Node.js (Express, TypeScript) + PostgreSQL.

## Chạy

Yêu cầu: Node 18+ và PostgreSQL 14+.

```bash
cd backend
npm install
cp .env.example .env              # sửa DATABASE_URL nếu cần
createdb shuttlego                # hoặc tạo DB bằng pgAdmin
psql -d shuttlego -f db/schema.sql   # tạo bảng
npm run db:seed                   # dữ liệu mẫu
npm run dev                       # http://localhost:4000/api
```

Không có PostgreSQL trên máy? Dùng bản nhúng trong [`../.localdb/`](../.localdb/):

```bash
cd .localdb
npm install
npm start                         # PostgreSQL tại localhost:5432, tự tạo DB + schema lần đầu
```

Sau đó chạy `npm run db:seed` và `npm run dev` trong `backend/` như trên.

## Tài khoản mẫu

Mật khẩu `123456`: `player@shuttlego.vn` (người chơi), `owner@shuttlego.vn` (chủ sân).

## Kiểm thử

`npm test` chạy bộ kiểm thử E2E. **Cảnh báo:** lệnh này xóa sạch dữ liệu, nên dùng database riêng.

## Cấu trúc

- `db/schema.sql` — định nghĩa bảng
- `scripts/seed.ts` — dữ liệu mẫu
- `src/routes/` — định tuyến API (`/api/auth`, `/api/venues`, `/api/courts`, `/api/bookings`, ...)
- `src/services/` — nghiệp vụ
