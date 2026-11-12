# ShuttleGo Backend

REST API CRUD cho ShuttleGo — **Express 5 + TypeORM 1.x + PostgreSQL**, viết bằng TypeScript (ESM), validate bằng **zod**.

## Chạy local

```bash
cd backend
cp .env.example .env          # sửa nếu cần
docker compose up -d          # Postgres 17 ở localhost:5433 (user/pass/db: shuttlego)
npm install
npm run dev                   # http://localhost:3000/api — tự chạy migration khi khởi động
```

| Script | Mô tả |
| --- | --- |
| `npm run dev` | Chạy dev, tự reload (tsx watch) |
| `npm run build` / `npm start` | Build ra `dist/` và chạy bản build |
| `npm run typecheck` | Kiểm tra type |
| `npm run migration:generate -- src/database/migrations/<Ten>` | Sinh migration từ thay đổi entity |
| `npm run migration:run` / `migration:revert` | Chạy / rollback migration |

> `synchronize` đang **tắt**. Sửa entity xong thì generate migration, đừng sửa DB bằng tay.
> Đặt `DB_MIGRATIONS_RUN=false` trong `.env` nếu không muốn app tự chạy migration lúc khởi động.

## Cấu trúc

```
src/
├── index.ts                 # khởi động server + chạy migration
├── app.ts                   # express app, mount routers
├── config/env.ts            # load .env
├── database/
│   ├── data-source.ts       # TypeORM DataSource (app + CLI dùng chung)
│   ├── snake-naming.strategy.ts   # camelCase (JSON) <-> snake_case (DB)
│   └── migrations/
├── common/                  # enums, lỗi HTTP, error handler, helper validate/phân trang
└── modules/<tên>/
    ├── <tên>.entity.ts      # TypeORM entity
    ├── <tên>.schema.ts      # zod schema cho body/query
    ├── <tên>.service.ts     # logic + truy vấn DB
    └── <tên>.routes.ts      # express router
```

## Quy ước API

- Base URL: `/api`. JSON dùng **camelCase** (`fullName`, `venueId`...), DB dùng snake_case.
- Danh sách có phân trang: `?page=1&limit=20` → `{ data: [...], meta: { page, limit, total, totalPages } }`.
- Ngày: `YYYY-MM-DD`; giờ: `HH:mm` hoặc `HH:mm:ss`; tiền: số nguyên VND.
- Lỗi: `{ message, details? }`. Các mã: `400` dữ liệu sai hoặc id tham chiếu không tồn tại, `404` không tìm thấy, `409` trùng (phone, tên sân...), trùng giờ đặt sân, hoặc xoá bản ghi đang được dùng.
- `passwordHash` và `fcmToken` không bao giờ được trả về.

## Xác thực & phân quyền

Đăng ký/đăng nhập để lấy JWT, gửi kèm header `Authorization: Bearer <token>`.

| Endpoint | Mô tả |
| --- | --- |
| `POST /auth/register` | `{ fullName, phone, password, role? }` — `role` chỉ `player` (mặc định) hoặc `owner` |
| `POST /auth/login` | `{ phone, password }` → `{ token, user }` |
| `GET /auth/me` | User hiện tại (cần token) |

Quyền:
- **Công khai**: `GET` venues / courts / price-rules / amenities / operating-hours, `/health`.
- **Đã đăng nhập**: bookings, favorites, notifications, tạo reports (chỉ dữ liệu của bản thân).
- **owner / admin**: quản lý venue / court / price-rule / operating-hours (owner chỉ venue của mình).
- **admin**: quản lý users, amenities, duyệt venue, xử lý reports, tạo notifications.
- `401` khi thiếu/sai token, `403` khi không đủ quyền.

## Endpoints

| Resource | Endpoints | Filter (query) |
| --- | --- | --- |
| users | `GET/POST /users`, `GET/PATCH/DELETE /users/:id` | `role, status, search` |
| amenities | `GET/POST /amenities`, `GET/PATCH/DELETE /amenities/:id` | |
| venues | `GET/POST /venues`, `GET/PATCH/DELETE /venues/:id` | `ownerId, status, city, district, search, sort=newest\|name` |
| | `PATCH /venues/:id/review` — admin duyệt `{ status, reviewedBy, reviewNote? }` | |
| venue_amenities | `GET /venues/:id/amenities`, `PUT /venues/:id/amenities` `{ amenityIds: [] }` | |
| operating_hours | `GET /venues/:id/operating-hours`<br>`PUT /venues/:id/operating-hours` `{ hours: [...] }` (thay cả tuần)<br>`PUT/DELETE /venues/:id/operating-hours/:dayOfWeek` | |
| courts | `GET/POST /courts`, `GET/PATCH/DELETE /courts/:id` | `venueId, isActive` |
| price_rules | `GET/POST /price-rules`, `GET/PATCH/DELETE /price-rules/:id` | `venueId` |
| favorites | `GET/POST /favorites`, `DELETE /favorites/:userId/:venueId` | `userId, venueId` |
| bookings | `GET/POST /bookings`, `GET/PATCH/DELETE /bookings/:id` | `courtId, venueId, playerId, createdBy, status, paymentStatus, code, date, from, to` |
| notifications | `GET/POST /notifications`, `GET/PATCH/DELETE /notifications/:id`, `PATCH /notifications/read-all` `{ userId }` | `userId, isRead, type` |
| reports | `GET/POST /reports`, `GET/PATCH/DELETE /reports/:id` | `status, reporterId, venueId, bookingId, handledBy` |

`dayOfWeek`: 0 = Chủ nhật, 1 = Thứ 2, …, 6 = Thứ 7.

### Logic có sẵn

- **Bookings**: tự sinh `code` (vd. `SG7K2M9QXA`), kiểm tra `endTime > startTime`, sân phải `isActive`, và **không cho trùng giờ** trên cùng sân/ngày. Đơn `cancelled` và đơn `pending` đã quá `holdExpiresAt` không chiếm giờ. Có khoá dòng sân trong transaction để 2 request đặt cùng lúc không bị trùng.
  Đổi `status` → `confirmed` / `cancelled` thì tự set `confirmedAt` / `cancelledAt`; đổi `paymentStatus` → `paid` thì tự set `paidAt`.
- **Price rules**: các khung giờ trong cùng một venue không được chồng nhau.
- **Reports**: đổi `status` → `resolved`/`rejected` thì tự set `resolvedAt`.
- **Venues**: `GET /venues/:id` trả kèm owner, amenities, courts, operatingHours, priceRules.

### Giá trị enum

| Enum | Giá trị |
| --- | --- |
| user_role | `player`, `owner`, `admin` |
| user_status | `active`, `inactive`, `banned` |
| venue_status | `pending`, `approved`, `rejected`, `suspended` |
| booking_source | `app` (người chơi đặt), `owner` (chủ sân nhập tay) |
| booking_status | `pending`, `confirmed`, `completed`, `cancelled` |
| payment_method | `cash`, `bank_transfer` |
| payment_status | `unpaid`, `pending_verification`, `paid`, `refunded` |
| notification_type | `booking_created`, `booking_confirmed`, `booking_cancelled`, `booking_reminder`, `payment_received`, `venue_approved`, `venue_rejected`, `report_updated`, `system` |
| report_status | `pending`, `in_progress`, `resolved`, `rejected` |

## Ví dụ

```bash
# đăng ký (lấy token)
curl -X POST localhost:3000/api/auth/register -H 'Content-Type: application/json' \
  -d '{"fullName":"Nguyễn Văn A","phone":"0901234567","password":"secret123","role":"owner"}'

# đăng nhập
TOKEN=$(curl -s -X POST localhost:3000/api/auth/login -H 'Content-Type: application/json' \
  -d '{"phone":"0901234567","password":"secret123"}' | node -pe 'JSON.parse(require("fs").readFileSync(0)).token')

# đặt sân (dùng token)
curl -X POST localhost:3000/api/bookings -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"courtId":1,"contactName":"B","contactPhone":"0912345678",
       "bookingDate":"2026-11-20","startTime":"18:00","endTime":"20:00","totalAmount":240000}'

# huỷ đơn
curl -X PATCH localhost:3000/api/bookings/1 -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"status":"cancelled","cancelReason":"Bận","cancelledBy":2}'
```

## Chưa có (làm tiếp)

- Tự tính `totalAmount` từ `price_rules` + `weekendSurcharge`. Hiện client phải gửi lên.
- Kiểm tra giờ đặt có nằm trong `operating_hours` hay không.
- Upload ảnh (`avatarUrl`, `coverImageUrl`, `proofImageUrl` đang là URL dạng text).
