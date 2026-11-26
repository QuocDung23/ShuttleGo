import { randomInt, randomUUID } from 'node:crypto';
import { mkdir, rename, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BookingSource, BookingStatus, NotificationType, PaymentMethod, PaymentStatus, UserRole, VenueStatus } from '@/common/enums.js';
import { AppDataSource } from '@/database/data-source.js';
import { register } from '@/modules/auth/auth.service.js';
import { create as createBooking } from '@/modules/bookings/bookings.service.js';
import { create as createNotification } from '@/modules/notifications/notifications.service.js';
import { User } from '@/modules/users/user.entity.js';
import { Venue } from '@/modules/venues/venue.entity.js';
import { create as createVenue, findOne } from '@/modules/venues/venues.service.js';

if (process.env.DB_NAME !== 'shuttlego_test' || AppDataSource.options.database !== 'shuttlego_test') {
  throw new Error('Set DB_NAME=shuttlego_test and use a dedicated PostgreSQL database.');
}

const password = 'ShuttleGoUITest123';
const runId = randomUUID().slice(0, 8);
const dateKey = (daysFromToday: number) =>
  new Date(Date.now() + 7 * 3600000 + daysFromToday * 86400000).toISOString().slice(0, 10);
const bookingDate = dateKey(1);
const alternateDate = dateKey(2);
const phone = () => '09' + randomInt(10000000, 100000000);
const account = (role: UserRole.PLAYER | UserRole.OWNER, name: string) => register({
  fullName: name, phone: phone(), password, role,
});
const fixturePath = fileURLToPath(new URL('../../../frontend/uitests/ShuttleGoUITestData.json', import.meta.url));

await AppDataSource.initialize();
try {
  await AppDataSource.runMigrations();
  const [player, otherPlayer, owner, admin] = await Promise.all([
    account(UserRole.PLAYER, 'Người chơi XCTest'),
    account(UserRole.PLAYER, 'Người chơi thứ hai XCTest'),
    account(UserRole.OWNER, 'Chủ sân XCTest'),
    account(UserRole.PLAYER, 'Quản trị viên XCTest'),
  ]);
  await AppDataSource.getRepository(User).update(admin.user.id, { role: UserRole.ADMIN });
  const venue = await createVenue({
    name: `ShuttleGo XCTest ${runId}`,
    address: '1 đường kiểm thử', district: 'Hải Châu', city: 'Đà Nẵng',
    bankName: 'Ngân hàng thử nghiệm', bankAccountNo: '0000000000', bankAccountHolder: 'SHUTTLEGO TEST',
    courtCount: 2,
    priceRules: [
      { label: 'Giờ thường', startTime: '07:00', endTime: '17:00', pricePerHour: 100000 },
      { label: 'Giờ cao điểm', startTime: '17:00', endTime: '22:00', pricePerHour: 120000 },
    ],
  }, owner.user);
  await AppDataSource.getRepository(Venue).update(venue.id, { status: VenueStatus.APPROVED });
  const approved = await findOne(venue.id);
  const court = approved.courts?.find(({ name }) => name === 'Sân 1');
  if (!court) throw new Error('Seed did not create Sân 1.');

  const ownerBooking = (startTime: string, options: {
    source?: BookingSource; status?: BookingStatus; paymentStatus?: PaymentStatus; playerId?: number;
  } = {}) => createBooking({
    courtId: court.id, playerId: options.playerId, contactName: player.user.fullName,
    contactPhone: player.user.phone, bookingDate, startTime,
    endTime: `${String((Number(startTime.slice(0, 2)) + 1)).padStart(2, '0')}:00`,
    totalAmount: 100000, source: options.source ?? BookingSource.OWNER,
    status: options.status ?? BookingStatus.CONFIRMED,
    paymentMethod: PaymentMethod.CASH, paymentStatus: options.paymentStatus ?? PaymentStatus.PAID,
  }, owner.user);
  const [booked, ownerPending, ownerCancel, ownerPayment] = await Promise.all([
    ownerBooking('07:00'),
    ownerBooking('09:00', { status: BookingStatus.PENDING, paymentStatus: PaymentStatus.UNPAID }),
    ownerBooking('10:00', { status: BookingStatus.PENDING, paymentStatus: PaymentStatus.UNPAID }),
    ownerBooking('08:00', {
      source: BookingSource.APP, playerId: player.user.id, status: BookingStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING_VERIFICATION,
    }),
  ]);
  const notificationTitle = `Đơn XCTest đã xác nhận ${runId}`;
  await createNotification({
    userId: player.user.id, bookingId: booked.id, type: NotificationType.BOOKING_CONFIRMED,
    title: notificationTitle, body: 'Thông báo mẫu do bộ dữ liệu XCTest tạo.',
  });

  const fixtures = {
    PLAYER_PHONE: player.user.phone, OTHER_PLAYER_PHONE: otherPlayer.user.phone,
    OWNER_PHONE: owner.user.phone, ADMIN_PHONE: admin.user.phone, PLAYER_PASSWORD: password,
    REG_PLAYER_PHONE: phone(), REG_OWNER_PHONE: phone(),
    VENUE_NAME: approved.name, VENUE_ID: String(approved.id), COURT_NAME: court.name, COURT_ID: String(court.id),
    BOOKING_DATE: bookingDate, ALTERNATE_DATE: alternateDate, SLOT_START: '14:00',
    BOOKING_SUMMARY_SLOT: '12:00', BOOKING_HISTORY_SLOT: '13:00',
    SLOT_CONSECUTIVE_START: '15:00', OWNER_REALTIME_SLOT: '18:00', OWNER_RECOVERY_SLOT: '19:00',
    OWNER_BOOKING_ID: String(booked.id), OWNER_PENDING_BOOKING_ID: String(ownerPending.id),
    OWNER_CANCEL_BOOKING_ID: String(ownerCancel.id), OWNER_PAYMENT_BOOKING_ID: String(ownerPayment.id),
    PLAYER_NAME: player.user.fullName, NOTIFICATION_TITLE: notificationTitle,
    API_BASE_URL: process.env.EXPO_PUBLIC_API_URL ?? 'http://127.0.0.1:3137/api',
  };
  await mkdir(dirname(fixturePath), { recursive: true });
  await writeFile(fixturePath + '.tmp', JSON.stringify(fixtures, null, 2) + '\n');
  await rename(fixturePath + '.tmp', fixturePath);
  console.log(`Created XCTest data for ${approved.name}.`);
} finally {
  await AppDataSource.destroy();
}
