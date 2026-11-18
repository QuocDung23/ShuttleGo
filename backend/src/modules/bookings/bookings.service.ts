import { randomInt } from 'node:crypto';
import {
  Between,
  IsNull,
  LessThanOrEqual,
  Not,
  MoreThanOrEqual,
  type EntityManager,
  type FindOptionsWhere,
} from 'typeorm';
import type { AuthUser } from '@/common/auth.js';
import {
  BookingSource,
  BookingStatus,
  PaymentMethod,
  PaymentStatus,
  UserRole,
  VenueStatus,
} from '@/common/enums.js';
import { badRequest, conflict, forbidden, notFound } from '@/common/http-error.js';
import { assertTimeRange, definedOnly, paginate, skipTake } from '@/common/validation.js';
import { AppDataSource } from '@/database/data-source.js';
import { Booking } from '@/modules/bookings/booking.entity.js';
import { BookingHold } from '@/modules/bookings/booking-hold.entity.js';
import { expirePendingCheckoutBookings } from '@/modules/bookings/booking-expiration.js';
import {
  applyActiveOccupancyFilter,
  assertWithinWindow,
  BOOKING_HOLD_MS,
  calculateBookingTotal,
  dayOfWeekForDate,
  resolveOpeningWindow,
} from '@/modules/bookings/booking-rules.js';
import { Court } from '@/modules/courts/court.entity.js';
import { Venue } from '@/modules/venues/venue.entity.js';
import type {
  CreateBookingInput,
  QueryBookingsInput,
  UpdateBookingInput,
} from '@/modules/bookings/bookings.schema.js';

const repo = () => AppDataSource.getRepository(Booking);

const DETAIL_RELATIONS = { court: { venue: true }, player: true, creator: true } as const;

export async function findAll(query: QueryBookingsInput, user: AuthUser) {
  await expirePendingCheckoutBookings();
  const { page, limit, venueId, date, from, to, ...filters } = query;
  const bookingDate =
    date ??
    (from && to ? Between(from, to) : from ? MoreThanOrEqual(from) : to ? LessThanOrEqual(to) : undefined);

  const court = definedOnly({
    ...(venueId ? { venueId } : {}),
    // Owners only see bookings on courts of their own venues.
    ...(user.role === UserRole.OWNER ? { venue: { ownerId: user.id } } : {}),
  }) as FindOptionsWhere<Court>;

  const base: FindOptionsWhere<Booking> = {
    ...definedOnly({ ...filters, bookingDate }),
    ...(Object.keys(court).length ? { court } : {}),
  };

  // Players only see bookings they made or are the player of.
  const where =
    user.role === UserRole.PLAYER
      ? [
          { ...base, playerId: user.id },
          { ...base, createdBy: user.id },
        ]
      : user.role === UserRole.OWNER
        ? [
            { ...base, source: BookingSource.OWNER },
            { ...base, source: BookingSource.APP, paymentStatus: Not(PaymentStatus.UNPAID) },
            { ...base, source: BookingSource.APP, playerId: IsNull() },
          ]
      : base;

  const result = await repo().findAndCount({
    where,
    relations: { court: { venue: true }, player: true },
    order: { bookingDate: 'DESC', startTime: 'DESC' },
    ...skipTake({ page, limit }),
  });
  return paginate(result, { page, limit });
}

export async function findOne(id: number, user?: AuthUser) {
  await expirePendingCheckoutBookings();
  const booking = await repo().findOne({ where: { id }, relations: DETAIL_RELATIONS });
  if (!booking) throw notFound(`Booking #${id} not found`);
  if (user) assertBookingAccess(user, booking);
  return booking;
}

export async function create(input: CreateBookingInput, user: AuthUser) {
  assertTimeRange(input.startTime, input.endTime, 'booking time');

  const isPlayerBooking = user.role === UserRole.PLAYER;

  const id = await AppDataSource.transaction(async (manager) => {
    const court = await lockActiveCourt(manager, input.courtId);
    const venue = await manager.findOne(Venue, {
      where: { id: court.venueId },
      relations: { operatingHours: true, priceRules: true },
    });
    if (!venue) throw badRequest(`Court #${court.id} has no venue`);
    if (venue.status !== VenueStatus.APPROVED) {
      throw badRequest('Sân chưa được duyệt, chưa nhận đặt sân.');
    }

    if (isPlayerBooking) assertPlayerCanBook(venue, input);
    await assertSlotFree(manager, input, undefined, isPlayerBooking ? user.id : undefined);

    const booking = manager.create(Booking, {
      ...input,
      ...(isPlayerBooking
        ? {
            playerId: user.id,
            createdBy: user.id,
            source: BookingSource.APP,
            status: BookingStatus.PENDING,
            paymentMethod: PaymentMethod.BANK_TRANSFER,
            paymentStatus: PaymentStatus.UNPAID,
            holdExpiresAt: new Date(Date.now() + BOOKING_HOLD_MS),
            proofImageUrl: null,
          }
        : {
            createdBy: user.id,
            playerId: user.role === UserRole.PLAYER ? user.id : (input.playerId ?? null),
          }),
      code: generateCode(),
    });
    applyStatusTimestamps(booking);
    const saved = await manager.save(booking);
    if (isPlayerBooking) await manager.delete(BookingHold, { playerId: user.id });
    return saved.id;
  });
  return findOne(id, user);
}

/** Player-created bookings must use the venue's real hours, price and bank info. */
function assertPlayerCanBook(venue: Venue, input: CreateBookingInput) {
  // Compare calendar dates in UTC+7 so a late evening in Vietnam is not "tomorrow".
  const today = new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString().slice(0, 10);
  if (input.bookingDate < today) {
    throw badRequest('Không thể đặt sân vào ngày đã qua.');
  }
  if (!venue.bankAccountNo && !venue.bankQrImageUrl) {
    throw badRequest('Sân chưa cấu hình thông tin thanh toán. Vui lòng liên hệ sân.');
  }

  const hours = venue.operatingHours?.find(
    (row) => row.dayOfWeek === dayOfWeekForDate(input.bookingDate),
  );
  const window = resolveOpeningWindow(hours, venue.priceRules ?? []);
  assertWithinWindow(window, input.startTime, input.endTime);

  const expected = calculateBookingTotal(
    venue.priceRules ?? [],
    venue.weekendSurcharge,
    input.bookingDate,
    input.startTime,
    input.endTime,
  );
  if (input.totalAmount !== expected) {
    throw badRequest(`Tổng tiền không khớp. Số tiền đúng là ${expected}đ.`);
  }
}

export async function update(id: number, input: UpdateBookingInput, user: AuthUser) {
  await AppDataSource.transaction(async (manager) => {
    const booking = await manager.findOne(Booking, { where: { id }, relations: DETAIL_RELATIONS });
    if (!booking) throw notFound(`Booking #${id} not found`);
    assertBookingAccess(user, booking);

    const before = { ...booking };
    manager.merge(Booking, booking, input);
    assertTimeRange(booking.startTime, booking.endTime, 'booking time');

    const slotChanged =
      booking.courtId !== before.courtId ||
      booking.bookingDate !== before.bookingDate ||
      booking.startTime !== before.startTime ||
      booking.endTime !== before.endTime;
    const reactivated =
      before.status === BookingStatus.CANCELLED && booking.status !== BookingStatus.CANCELLED;

    if ((slotChanged || reactivated) && booking.status !== BookingStatus.CANCELLED) {
      if (booking.courtId !== before.courtId) await lockActiveCourt(manager, booking.courtId);
      else await lockCourt(manager, booking.courtId);
      await assertSlotFree(manager, booking, id);
    }

    applyStatusTimestamps(booking, before);
    await manager.save(booking);
  });
  return findOne(id, user);
}

/**
 * Player payment claim. This is the only PATCH action a player may take:
 * they report a transfer, the server clears the hold and keeps status pending
 * for the owner to verify. All other booking fields stay server-owned.
 */
export async function claimPayment(id: number, user: AuthUser) {
  await expirePendingCheckoutBookings();
  await AppDataSource.transaction(async (manager) => {
    // Lock the row itself (no joins) so the lock works on Postgres even when
    // relations are nullable; the ownership check only needs the id columns.
    const booking = await manager.findOne(Booking, {
      where: { id },
      lock: { mode: 'pessimistic_write' },
    });
    if (!booking) throw notFound(`Booking #${id} not found`);

    if (
      user.role !== UserRole.PLAYER ||
      (booking.playerId !== user.id && booking.createdBy !== user.id)
    ) {
      throw forbidden('Bạn không có quyền báo chuyển khoản cho đặt sân này.');
    }
    if (
      booking.paymentStatus === PaymentStatus.UNPAID &&
      booking.holdExpiresAt &&
      booking.holdExpiresAt.getTime() <= Date.now()
    ) {
      throw conflict('Thời gian giữ chỗ đã hết. Vui lòng chọn giờ lại.');
    }
    if (booking.status !== BookingStatus.PENDING) {
      throw conflict('Đặt sân không còn ở trạng thái chờ xử lý.');
    }
    if (booking.paymentStatus !== PaymentStatus.UNPAID) {
      throw conflict('Đặt sân này đã được báo chuyển khoản.');
    }
    if (!booking.holdExpiresAt) throw conflict('Đặt sân này không còn thời gian giữ chỗ.');

    const before = { ...booking };
    booking.paymentStatus = PaymentStatus.PENDING_VERIFICATION;
    booking.holdExpiresAt = null;
    applyStatusTimestamps(booking, before);
    await manager.save(booking);
  });
  return findOne(id, user);
}

/** Player cancels an unpaid checkout hold before reporting the transfer. */
export async function cancelPendingCheckout(id: number, user: AuthUser) {
  if (user.role !== UserRole.PLAYER) throw forbidden('Chỉ người đặt mới có thể hủy giữ chỗ.');
  await expirePendingCheckoutBookings();

  await AppDataSource.transaction(async (manager) => {
    const booking = await manager.findOne(Booking, {
      where: { id },
      lock: { mode: 'pessimistic_write' },
    });
    if (!booking) throw notFound(`Booking #${id} not found`);
    if (booking.playerId !== user.id && booking.createdBy !== user.id) {
      throw forbidden('Bạn không có quyền hủy giữ chỗ này.');
    }
    if (booking.status !== BookingStatus.PENDING || booking.paymentStatus !== PaymentStatus.UNPAID) {
      throw conflict('Chỉ có thể hủy giữ chỗ chưa báo chuyển khoản.');
    }
    if (!booking.holdExpiresAt || booking.holdExpiresAt.getTime() <= Date.now()) {
      throw conflict('Thời gian giữ chỗ đã hết. Vui lòng chọn giờ lại.');
    }

    await lockCourt(manager, booking.courtId);
    const before = { ...booking };
    booking.status = BookingStatus.CANCELLED;
    booking.cancelledBy = user.id;
    booking.cancelReason = 'Người chơi hủy giữ chỗ';
    booking.holdExpiresAt = null;
    applyStatusTimestamps(booking, before);
    await manager.save(booking);
  });

  return findOne(id, user);
}

export async function remove(id: number, user: AuthUser) {
  const booking = await repo().findOne({ where: { id }, relations: DETAIL_RELATIONS });
  if (!booking) throw notFound(`Booking #${id} not found`);
  assertBookingAccess(user, booking);
  await repo().remove(booking);
}

// ---------------------------------------------------------------------------

function assertBookingAccess(user: AuthUser, booking: Booking) {
  if (user.role === UserRole.ADMIN) return;
  if (
    user.role === UserRole.PLAYER &&
    (booking.playerId === user.id || booking.createdBy === user.id)
  ) {
    return;
  }
  if (user.role === UserRole.OWNER && booking.court?.venue?.ownerId === user.id) {
    const isUnpaidPlayerCheckout =
      booking.source === BookingSource.APP &&
      booking.playerId !== null &&
      booking.paymentStatus === PaymentStatus.UNPAID &&
      booking.holdExpiresAt !== null;
    if (isUnpaidPlayerCheckout) throw notFound(`Booking #${booking.id} not found`);
    return;
  }
  throw forbidden('You cannot access this booking');
}

/** Row-locks the court so two concurrent bookings of the same court are serialized. */
async function lockCourt(manager: EntityManager, courtId: number) {
  const court = await manager.findOne(Court, {
    where: { id: courtId },
    lock: { mode: 'pessimistic_write' },
  });
  if (!court) throw badRequest(`Court #${courtId} not found`);
  return court;
}

async function lockActiveCourt(manager: EntityManager, courtId: number) {
  const court = await lockCourt(manager, courtId);
  if (!court.isActive) throw badRequest(`Court #${courtId} is not active`);
  return court;
}

/** A slot is taken by any non-cancelled booking, except pending holds that already expired. */
async function assertSlotFree(
  manager: EntityManager,
  slot: Pick<Booking, 'courtId' | 'bookingDate' | 'startTime' | 'endTime'>,
  excludeId?: number,
  excludeHoldPlayerId?: number,
) {
  const qb = applyActiveOccupancyFilter(
    manager
      .createQueryBuilder(Booking, 'b')
      .where('b.courtId = :courtId', { courtId: slot.courtId })
      .andWhere('b.bookingDate = :date', { date: slot.bookingDate })
      .andWhere('b.startTime < :end AND b.endTime > :start', {
        start: slot.startTime,
        end: slot.endTime,
      }),
  );
  if (excludeId) qb.andWhere('b.id <> :excludeId', { excludeId });

  const clash = await qb.getOne();
  if (clash) {
    throw conflict(
      `Court is already booked ${clash.startTime}–${clash.endTime} (booking ${clash.code})`,
    );
  }

  const holds = manager.createQueryBuilder(BookingHold, 'h')
    .where('h.courtId = :courtId', { courtId: slot.courtId })
    .andWhere('h.bookingDate = :date', { date: slot.bookingDate })
    .andWhere('h.startTime < :end AND h.endTime > :start', {
      start: slot.startTime,
      end: slot.endTime,
    })
    .andWhere('h.expiresAt > now()');
  if (excludeHoldPlayerId) holds.andWhere('h.playerId <> :playerId', { playerId: excludeHoldPlayerId });
  if (await holds.getOne()) {
    throw conflict('Khung giờ này đang được người khác chọn. Vui lòng chọn giờ khác.');
  }
}

/** Sets confirmed_at / cancelled_at / paid_at when the status changes. */
function applyStatusTimestamps(booking: Booking, before?: Booking) {
  const now = new Date();
  if (booking.status !== before?.status) {
    if (booking.status === BookingStatus.CONFIRMED) booking.confirmedAt ??= now;
    if (booking.status === BookingStatus.CANCELLED) booking.cancelledAt = now;
    // Keep timestamps consistent when a booking is reopened / un-confirmed.
    if (before?.status === BookingStatus.CANCELLED && booking.status !== BookingStatus.CANCELLED) {
      booking.cancelledAt = null;
    }
    if (before?.status === BookingStatus.CONFIRMED && booking.status === BookingStatus.PENDING) {
      booking.confirmedAt = null;
    }
  }
  if (booking.paymentStatus !== before?.paymentStatus && booking.paymentStatus === PaymentStatus.PAID) {
    booking.paidAt ??= now;
  }
}

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/** e.g. "SG7K2M9QXA" */
function generateCode() {
  let code = 'SG';
  for (let i = 0; i < 8; i++) code += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  return code;
}
