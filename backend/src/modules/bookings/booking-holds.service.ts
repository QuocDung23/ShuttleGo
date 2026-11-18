import type { AuthUser } from '@/common/auth.js';
import { UserRole, VenueStatus } from '@/common/enums.js';
import { badRequest, conflict, forbidden, notFound } from '@/common/http-error.js';
import { assertTimeRange } from '@/common/validation.js';
import { AppDataSource } from '@/database/data-source.js';
import { Booking } from '@/modules/bookings/booking.entity.js';
import { BookingHold } from '@/modules/bookings/booking-hold.entity.js';
import {
  applyActiveOccupancyFilter,
  assertWithinWindow,
  BOOKING_SELECTION_HOLD_MS,
  calculateBookingTotal,
  dayOfWeekForDate,
  resolveOpeningWindow,
} from '@/modules/bookings/booking-rules.js';
import { Court } from '@/modules/courts/court.entity.js';
import { User } from '@/modules/users/user.entity.js';
import { Venue } from '@/modules/venues/venue.entity.js';
import type { SelectBookingHoldInput } from '@/modules/bookings/booking-holds.schema.js';

function assertPlayer(user: AuthUser) {
  if (user.role !== UserRole.PLAYER) throw forbidden('Chỉ người chơi mới có thể giữ khung giờ.');
}

export async function findMine(user: AuthUser) {
  assertPlayer(user);
  const hold = await AppDataSource.getRepository(BookingHold).findOneBy({ playerId: user.id });
  return hold && hold.expiresAt.getTime() > Date.now() ? hold : null;
}

export async function select(input: SelectBookingHoldInput, user: AuthUser) {
  assertPlayer(user);
  assertTimeRange(input.startTime, input.endTime, 'booking time');

  return AppDataSource.transaction(async (manager) => {
    // Serialize simultaneous first selections by the same player.
    const player = await manager.findOne(User, {
      where: { id: user.id },
      lock: { mode: 'pessimistic_write' },
    });
    if (!player) throw notFound('Không tìm thấy tài khoản người chơi.');

    const court = await manager.findOne(Court, {
      where: { id: input.courtId },
      lock: { mode: 'pessimistic_write' },
    });
    if (!court || !court.isActive) throw badRequest('Sân này hiện không hoạt động.');

    const venue = await manager.findOne(Venue, {
      where: { id: court.venueId },
      relations: { operatingHours: true, priceRules: true },
    });
    if (!venue || venue.status !== VenueStatus.APPROVED) {
      throw badRequest('Sân chưa được duyệt, chưa nhận giữ giờ.');
    }
    if (!venue.bankAccountNo && !venue.bankQrImageUrl) {
      throw badRequest('Sân chưa cấu hình thông tin thanh toán. Vui lòng liên hệ sân.');
    }

    const today = new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString().slice(0, 10);
    if (input.bookingDate < today) throw badRequest('Không thể chọn ngày đã qua.');
    const hours = venue.operatingHours?.find((row) => row.dayOfWeek === dayOfWeekForDate(input.bookingDate));
    const window = resolveOpeningWindow(hours, venue.priceRules ?? []);
    assertWithinWindow(window, input.startTime, input.endTime);
    calculateBookingTotal(
      venue.priceRules ?? [],
      venue.weekendSurcharge,
      input.bookingDate,
      input.startTime,
      input.endTime,
    );

    const bookingClash = await applyActiveOccupancyFilter(
      manager.createQueryBuilder(Booking, 'b')
        .where('b.courtId = :courtId', { courtId: court.id })
        .andWhere('b.bookingDate = :date', { date: input.bookingDate })
        .andWhere('b.startTime < :end AND b.endTime > :start', {
          start: input.startTime,
          end: input.endTime,
        }),
    ).getOne();
    if (bookingClash) throw conflict('Khung giờ này vừa được đặt. Vui lòng chọn giờ khác.');

    const holdClash = await manager.createQueryBuilder(BookingHold, 'h')
      .where('h.courtId = :courtId', { courtId: court.id })
      .andWhere('h.bookingDate = :date', { date: input.bookingDate })
      .andWhere('h.startTime < :end AND h.endTime > :start', {
        start: input.startTime,
        end: input.endTime,
      })
      .andWhere('h.expiresAt > now()')
      .andWhere('h.playerId <> :playerId', { playerId: user.id })
      .getOne();
    if (holdClash) throw conflict('Khung giờ này đang được người khác chọn.');

    const existing = await manager.findOne(BookingHold, {
      where: { playerId: user.id },
      lock: { mode: 'pessimistic_write' },
    });
    const next = manager.create(BookingHold, {
      ...(existing ? { id: existing.id } : {}),
      playerId: user.id,
      courtId: court.id,
      bookingDate: input.bookingDate,
      startTime: input.startTime,
      endTime: input.endTime,
      expiresAt: new Date(Date.now() + BOOKING_SELECTION_HOLD_MS),
    });
    return manager.save(BookingHold, next);
  });
}

export async function releaseMine(user: AuthUser) {
  assertPlayer(user);
  await AppDataSource.getRepository(BookingHold).delete({ playerId: user.id });
}
