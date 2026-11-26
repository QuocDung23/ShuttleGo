# Automated tests for ShuttleGo

Bộ test bao phủ **53 mã case** cho 5 feature AUTH, SLOT, BOOK, OWN và NOTI; không gồm VEN, CFG. Mỗi case có mã trong tên XCTest hoặc Node test để đối chiếu với bảng test case. NOTI-08 được kiểm tra ở cả UI và backend. UI chạy bằng XCUITest trên iOS Simulator; validation và HTTP/database/realtime chạy bằng Node.js test runner.

| Feature | XCTest trên iOS | Backend/logic | Case IDs |
| --- | --- | --- | --- |
| AUTH | `AuthUITests.swift` — đăng ký player/owner, đăng nhập player/admin, sai mật khẩu, đăng xuất, trường bắt buộc | `http.test.ts`, `week5.test.ts` — trùng số điện thoại, số điện thoại sai, trường rỗng, độ dài mật khẩu | AUTH-01…AUTH-13 |
| SLOT | `SlotUITests.swift` — venue đã duyệt, danh sách sân, đổi ngày, chọn giờ, giá, giờ đã đặt | `week5.test.ts` — block giờ, biên giờ hoạt động, thiếu quy tắc giá | SLOT-01…SLOT-10 |
| BOOK | `BookingUITests.swift` — tóm tắt checkout, lịch sử đơn, trạng thái báo chuyển khoản | `http.test.ts`, `week5.test.ts` — đặt trùng đồng thời, hai sân, thiếu dữ liệu, hold/checkout hết hạn, hủy và retry | BOOK-01…BOOK-10 |
| OWN | `OwnerUITests.swift` — lịch, chi tiết, duyệt/từ chối đơn, xác nhận thanh toán, refresh/reconnect | `http.test.ts` — quyền xem/sửa booking của chủ sân khác | OWN-01…OWN-10 |
| NOTI | `NotificationUITests.swift` — trạng thái rỗng và thông báo không lộ sang người nhận khác | `http.test.ts` — tạo/lưu, quyền riêng tư (NOTI-08), realtime và khôi phục sau reconnect | NOTI-01…NOTI-10 |

## Chuẩn bị PostgreSQL và dữ liệu test

Dùng database riêng có tên `shuttlego_test`; seed có kiểm tra tên database trước khi ghi dữ liệu. Ví dụ khởi động PostgreSQL:

```bash
docker run --rm -d --name shuttlego-xctest-db -p 127.0.0.1:5434:5432 \
  -e POSTGRES_DB=shuttlego_test -e POSTGRES_PASSWORD=postgres postgres:17-alpine
```

Từ thư mục `backend/`, cấu hình kết nối và tạo fixtures:

```bash
export DB_NAME=shuttlego_test DB_HOST=127.0.0.1 DB_PORT=5434
export DB_USER=postgres DB_PASSWORD=postgres PORT=3137
export EXPO_PUBLIC_API_URL=http://127.0.0.1:3137/api
npm run seed:uitest
npm run dev
```

Seed chạy migrations, tạo player thứ nhất/thứ hai, owner, admin, một venue đã duyệt với hai sân và hai mức giá, các booking mẫu cho SLOT/OWN, cùng notification mẫu cho NOTI. Fixture JSON được sinh tại `frontend/uitests/ShuttleGoUITestData.json` để test bundle sử dụng; file này không đưa vào Excel hay commit.

Dùng database chỉ dành cho test. Seed sinh bản ghi mới mỗi lần chạy; để làm sạch bộ dữ liệu, tạo lại database riêng trước khi seed. Chạy seed lại khi qua ngày mới vì booking fixture dùng ngày mai và ngày kế tiếp.

## Chạy backend và lưu log

Từ thư mục `backend/` (sau khi đã cấu hình các biến kết nối ở trên):

```bash
mkdir -p ../frontend/test-results
set -o pipefail
SHUTTLEGO_TEST_DB=1 npm test 2>&1 | tee ../frontend/test-results/backend.tap
```

`backend.tap` lưu chi tiết từng case, assertion lỗi và stack trace. Một số NOTI case đang kiểm tra hành vi backend có thể chưa được cài đặt (notification tự phát sinh khi đổi trạng thái booking/venue, và event realtime); các case đó sẽ hiện `not ok` cho đến khi feature được implement.

## Chạy iOS UI tests bằng Xcode

Từ thư mục `frontend/`:

```bash
SHUTTLEGO_XCTEST=1 EXPO_PUBLIC_API_URL=http://127.0.0.1:3137/api npx expo prebuild --platform ios
open ios/LTDD.xcworkspace
```

Chọn scheme `ShuttleGoUITests` và iOS Simulator, sau đó nhấn **⌘U**. Trong Test Navigator, có thể chạy riêng từng lớp: `AuthUITests`, `SlotUITests`, `BookingUITests`, `OwnerUITests`, hoặc `NotificationUITests`. Nếu workspace đã được tạo, sau khi đổi test target có thể chạy `ruby uitests/configure-target.rb ios vn.shuttlego.app`.

Lưu kết quả thành `.xcresult` để mở trong Xcode và xem từng assertion, screenshot, activity log:

```bash
mkdir -p test-results
EXPO_PUBLIC_API_URL=http://127.0.0.1:3137/api xcodebuild test \
  -workspace ios/LTDD.xcworkspace -scheme ShuttleGoUITests \
  -destination 'platform=iOS Simulator,name=iPhone 17' \
  -parallel-testing-enabled NO \
  -resultBundlePath "test-results/ShuttleGo-$(date +%Y%m%d-%H%M%S).xcresult"
```

Mở báo cáo bằng `open test-results/ShuttleGo-<timestamp>.xcresult` hoặc xem Test Navigator trong Xcode (**⌘9**). Các tài khoản và dữ liệu được seed trước, không cần nhập thủ công khi test chạy.
