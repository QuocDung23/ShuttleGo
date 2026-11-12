-- ShuttleGO - PostgreSQL schema
-- Chạy: psql $DATABASE_URL -f db/schema.sql

CREATE EXTENSION IF NOT EXISTS pgcrypto; -- gen_random_uuid()

DROP TABLE IF EXISTS notifications, device_tokens, reviews, payments,
  booking_slots, bookings, price_rules, venue_amenities, amenities,
  venue_images, courts, venues, users CASCADE;
DROP TYPE IF EXISTS user_role, booking_status, payment_status, payment_method, day_type CASCADE;

CREATE TYPE user_role      AS ENUM ('PLAYER', 'OWNER');
CREATE TYPE booking_status AS ENUM ('PENDING', 'CONFIRMED', 'REJECTED', 'CANCELLED', 'COMPLETED');
CREATE TYPE payment_status AS ENUM ('UNPAID', 'PAID', 'REFUNDED');
CREATE TYPE payment_method AS ENUM ('VIETQR', 'CASH');
CREATE TYPE day_type       AS ENUM ('WEEKDAY', 'WEEKEND', 'ALL');

-- 1. Người dùng (người chơi + chủ sân)
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name     VARCHAR(100) NOT NULL,
  email         VARCHAR(150) NOT NULL UNIQUE,
  phone         VARCHAR(20),
  password_hash TEXT         NOT NULL,
  avatar_url    TEXT,
  role          user_role    NOT NULL DEFAULT 'PLAYER',
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- 2. Cơ sở / địa điểm sân (1 chủ sân có nhiều cơ sở)
CREATE TABLE venues (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id    UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        VARCHAR(150) NOT NULL,
  description TEXT,
  address     VARCHAR(255) NOT NULL,
  district    VARCHAR(80),
  city        VARCHAR(80)  NOT NULL DEFAULT 'TP.HCM',
  latitude    DOUBLE PRECISION,
  longitude   DOUBLE PRECISION,
  phone       VARCHAR(20),
  open_time   TIME         NOT NULL DEFAULT '06:00',
  close_time  TIME         NOT NULL DEFAULT '22:00',
  is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
  CHECK (open_time < close_time)
);
CREATE INDEX idx_venues_district ON venues(district);
CREATE INDEX idx_venues_owner    ON venues(owner_id);

-- 3. Sân con (Sân 1, Sân 2... thuộc một cơ sở) - là các "hàng" của lưới sân
CREATE TABLE courts (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id   UUID        NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  name       VARCHAR(50) NOT NULL,
  is_active  BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (venue_id, name)
);

-- 4. Ảnh cơ sở
CREATE TABLE venue_images (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id   UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  url        TEXT NOT NULL,
  sort_order INT  NOT NULL DEFAULT 0
);

-- 5. Tiện ích (đỗ xe, nước uống, phòng thay đồ...) và bảng nối N-N
CREATE TABLE amenities (
  id   SERIAL PRIMARY KEY,
  code VARCHAR(30) NOT NULL UNIQUE,
  name VARCHAR(80) NOT NULL
);
CREATE TABLE venue_amenities (
  venue_id   UUID NOT NULL REFERENCES venues(id)    ON DELETE CASCADE,
  amenity_id INT  NOT NULL REFERENCES amenities(id) ON DELETE CASCADE,
  PRIMARY KEY (venue_id, amenity_id)
);

-- 6. Bảng giá theo khung giờ (1 slot = 1 giờ)
CREATE TABLE price_rules (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id       UUID    NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  day_type       day_type NOT NULL DEFAULT 'ALL',
  start_time     TIME    NOT NULL,
  end_time       TIME    NOT NULL,
  price_per_slot INTEGER NOT NULL CHECK (price_per_slot >= 0),
  CHECK (start_time < end_time)
);
CREATE INDEX idx_price_rules_venue ON price_rules(venue_id);

-- 7. Đơn đặt sân
CREATE TABLE bookings (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code          VARCHAR(12)  NOT NULL UNIQUE,
  user_id       UUID         NOT NULL REFERENCES users(id)  ON DELETE RESTRICT,
  venue_id      UUID         NOT NULL REFERENCES venues(id) ON DELETE RESTRICT,
  play_date     DATE         NOT NULL,
  status        booking_status NOT NULL DEFAULT 'PENDING',
  total_amount  INTEGER      NOT NULL CHECK (total_amount >= 0),
  note          TEXT,
  reject_reason TEXT,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX idx_bookings_user  ON bookings(user_id, created_at DESC);
CREATE INDEX idx_bookings_venue ON bookings(venue_id, play_date);

-- 8. Chi tiết đơn: mỗi dòng = 1 sân x 1 khung giờ
CREATE TABLE booking_slots (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID    NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  court_id   UUID    NOT NULL REFERENCES courts(id)   ON DELETE RESTRICT,
  play_date  DATE    NOT NULL,
  start_time TIME    NOT NULL,
  end_time   TIME    NOT NULL,
  price      INTEGER NOT NULL CHECK (price >= 0),
  is_active  BOOLEAN NOT NULL DEFAULT TRUE,  -- FALSE khi đơn bị hủy/từ chối -> nhả slot
  CHECK (start_time < end_time)
);
-- CHỐNG ĐẶT TRÙNG: một sân, một ngày, một giờ chỉ có tối đa 1 slot đang hiệu lực
CREATE UNIQUE INDEX uq_slot_no_double_booking
  ON booking_slots (court_id, play_date, start_time) WHERE is_active;
CREATE INDEX idx_slots_booking ON booking_slots(booking_id);

-- 9. Thanh toán (mô phỏng VietQR)
CREATE TABLE payments (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
  method     payment_method NOT NULL DEFAULT 'VIETQR',
  amount     INTEGER        NOT NULL CHECK (amount >= 0),
  status     payment_status NOT NULL DEFAULT 'UNPAID',
  reference  VARCHAR(60),
  paid_at    TIMESTAMPTZ
);

-- 10. Đánh giá sân (mỗi đơn hoàn thành đánh giá 1 lần)
CREATE TABLE reviews (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID     NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
  venue_id   UUID     NOT NULL REFERENCES venues(id)   ON DELETE CASCADE,
  booking_id UUID     NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
  rating     SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment    TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_reviews_venue ON reviews(venue_id);

-- 11. Thông báo trong app + token thiết bị cho push
CREATE TABLE notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type       VARCHAR(30)  NOT NULL,  -- BOOKING_CREATED | BOOKING_CONFIRMED | BOOKING_REJECTED | REMINDER
  title      VARCHAR(150) NOT NULL,
  body       TEXT         NOT NULL,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  is_read    BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX idx_notif_user ON notifications(user_id, is_read, created_at DESC);

CREATE TABLE device_tokens (
  id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token    TEXT NOT NULL UNIQUE,
  platform VARCHAR(10) NOT NULL DEFAULT 'expo'
);

-- Dữ liệu mẫu cho tiện ích
INSERT INTO amenities (code, name) VALUES
  ('PARKING', 'Chỗ đỗ xe'), ('DRINKS', 'Nước uống'), ('LOCKER', 'Phòng thay đồ'),
  ('SHOWER', 'Phòng tắm'), ('AC', 'Máy lạnh'), ('RENTAL', 'Cho thuê vợt');
