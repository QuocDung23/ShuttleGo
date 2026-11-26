import assert from 'node:assert/strict';
import test from 'node:test';

import { registerSchema } from '../src/modules/auth/auth.schema.js';
import {
  assertWithinWindow,
  buildHourSlots,
  calculateBookingTotal,
} from '../src/modules/bookings/booking-rules.js';
import { selectBookingHoldSchema } from '../src/modules/bookings/booking-holds.schema.js';

const registration = { fullName: 'Test Player', phone: '0901234567', password: '123456' };

test('AUTH-06 | mật khẩu ở hai biên và ngoài biên', () => {
  const cases = [[5, false], [6, true], [72, true], [73, false]] as const;
  for (const [length, valid] of cases) {
    assert.equal(
      registerSchema.safeParse({ ...registration, password: 'a'.repeat(length) }).success,
      valid,
      'password length ' + length,
    );
  }
});

const window = { isOpen: true, openTime: '07:00', closeTime: '22:00' };

test('SLOT-07 | từ chối khung giờ lệch block', () => {
  assert.throws(() => assertWithinWindow(window, '07:30', '08:30'), /block một tiếng/);
});

test('SLOT-08 | từ chối cả hai đầu ngoài giờ mở cửa', () => {
  assert.throws(() => assertWithinWindow(window, '06:00', '07:00'), /ngoài giờ mở cửa/);
  assert.throws(() => assertWithinWindow(window, '22:00', '23:00'), /ngoài giờ mở cửa/);
});

test('SLOT-09 | chấp nhận block đầu và cuối ngày', () => {
  assert.doesNotThrow(() => assertWithinWindow(window, '07:00', '08:00'));
  assert.doesNotThrow(() => assertWithinWindow(window, '21:00', '22:00'));
});

test('SLOT-10 | từ chối tính tiền khi khung giờ thiếu giá', () => {
  assert.throws(
    () => calculateBookingTotal([], 0, '2026-11-27', '07:00', '08:00'),
    /không có quy tắc giá/,
  );
});

test('BOOK-05 | từ chối giữ chỗ khi thiếu sân hoặc ngày', () => {
  const time = { startTime: '07:00', endTime: '08:00' };
  assert.equal(selectBookingHoldSchema.safeParse({ ...time, courtId: 1 }).success, false);
  assert.equal(selectBookingHoldSchema.safeParse({ ...time, bookingDate: '2026-11-27' }).success, false);
});
