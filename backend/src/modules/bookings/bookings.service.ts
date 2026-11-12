import { randomInt } from 'node:crypto';
import { Between, LessThanOrEqual, MoreThanOrEqual, type EntityManager } from 'typeorm';
import { BookingStatus, PaymentStatus } from '../../common/enums.js';
import { badRequest, conflict, notFound } from '../../common/http-error.js';
import { assertTimeRange, definedOnly, paginate, skipTake } from '../../common/validation.js';
import { AppDataSource } from '../../database/data-source.js';
import { Court } from '../courts/court.entity.js';
import { Booking } from './booking.entity.js';
import type {
  CreateBookingInput,
  QueryBookingsInput,
  UpdateBookingInput,
} from './bookings.schema.js';

const repo = () => AppDataSource.getRepository(Booking);

const DETAIL_RELATIONS = { court: { venue: true }, player: true, creator: true } as const;

export async function findAll(query: QueryBookingsInput) {
  const { page, limit, venueId, date, from, to, ...filters } = query;
  const bookingDate =
    date ??
    (from && to ? Between(from, to) : from ? MoreThanOrEqual(from) : to ? LessThanOrEqual(to) : undefined);

  const result = await repo().findAndCount({
    where: {
      ...definedOnly({ ...filters, bookingDate }),
      ...(venueId ? { court: { venueId } } : {}),
    },
    relations: { court: { venue: true }, player: true },
    order: { bookingDate: 'DESC', startTime: 'DESC' },
    ...skipTake({ page, limit }),
  });
  return paginate(result, { page, limit });
}

export async function findOne(id: number) {
  const booking = await repo().findOne({ where: { id }, relations: DETAIL_RELATIONS });
  if (!booking) throw notFound(`Booking #${id} not found`);
  return booking;
}

export async function create(input: CreateBookingInput) {
  assertTimeRange(input.startTime, input.endTime, 'booking time');

  const id = await AppDataSource.transaction(async (manager) => {
    await lockActiveCourt(manager, input.courtId);
    await assertSlotFree(manager, input);

    const booking = manager.create(Booking, { ...input, code: generateCode() });
    applyStatusTimestamps(booking);
    return (await manager.save(booking)).id;
  });
  return findOne(id);
}

export async function update(id: number, input: UpdateBookingInput) {
  await AppDataSource.transaction(async (manager) => {
    const booking = await manager.findOneBy(Booking, { id });
    if (!booking) throw notFound(`Booking #${id} not found`);

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
  return findOne(id);
}

export async function remove(id: number) {
  const { affected } = await repo().delete({ id });
  if (!affected) throw notFound(`Booking #${id} not found`);
}

// ---------------------------------------------------------------------------

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
) {
  const qb = manager
    .createQueryBuilder(Booking, 'b')
    .where('b.courtId = :courtId', { courtId: slot.courtId })
    .andWhere('b.bookingDate = :date', { date: slot.bookingDate })
    .andWhere('b.status <> :cancelled', { cancelled: BookingStatus.CANCELLED })
    .andWhere(
      'NOT (b.status = :pending AND b.holdExpiresAt IS NOT NULL AND b.holdExpiresAt < now())',
      { pending: BookingStatus.PENDING },
    )
    .andWhere('b.startTime < :end AND b.endTime > :start', {
      start: slot.startTime,
      end: slot.endTime,
    });
  if (excludeId) qb.andWhere('b.id <> :excludeId', { excludeId });

  const clash = await qb.getOne();
  if (clash) {
    throw conflict(
      `Court is already booked ${clash.startTime}–${clash.endTime} (booking ${clash.code})`,
    );
  }
}

/** Sets confirmed_at / cancelled_at / paid_at when the status changes. */
function applyStatusTimestamps(booking: Booking, before?: Booking) {
  const now = new Date();
  if (booking.status !== before?.status) {
    if (booking.status === BookingStatus.CONFIRMED) booking.confirmedAt ??= now;
    if (booking.status === BookingStatus.CANCELLED) booking.cancelledAt = now;
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
