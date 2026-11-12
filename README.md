# ShuttleGO – Ứng dụng đặt sân cầu lông

Monorepo gồm `backend/` (Node.js Express + PostgreSQL) và `mobile/` (React Native + Expo, TypeScript, MVVM).
Thiết kế chi tiết (ERD, lưu trữ, kiến trúc, CRUD): **[docs/THIET_KE.md](docs/THIET_KE.md)**.

## Chạy backend
Yêu cầu: Node 18+ và PostgreSQL 14+.

```bash
cd backend
npm install
cp .env.example .env              # sửa DATABASE_URL nếu cần
createdb shuttlego                # hoặc tạo DB bằng pgAdmin
npm run db:init                   # tạo bảng (cần biến DATABASE_URL trong shell, hoặc: psql -d shuttlego -f db/schema.sql)
npm run db:seed                   # dữ liệu mẫu
npm run dev                       # http://localhost:4000/api
npm test                          # 66 kiểm thử E2E (CẢNH BÁO: xóa sạch dữ liệu, nên dùng DB riêng)
```

Tài khoản mẫu (mật khẩu `123456`): `player@shuttlego.vn` (người chơi), `owner@shuttlego.vn` (chủ sân).

## Chạy app
```bash
cd mobile
npm install
# Sửa app.json -> expo.extra.apiUrl thành IP LAN của máy chạy backend, ví dụ http://192.168.1.10:4000/api
npx expo start                    # quét QR bằng Expo Go
```

Lưu ý: thông báo đẩy từ xa (push) không chạy trên Expo Go với Android từ SDK 53 trở đi, cần development build (`npx expo run:android` hoặc EAS). Thông báo trong app (bảng `notifications`) vẫn hoạt động bình thường.
