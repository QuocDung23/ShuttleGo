import { In } from 'typeorm';
import { BookingSource, BookingStatus, PaymentStatus } from '@/common/enums.js';
import { AppDataSource } from '@/database/data-source.js';
import { Booking } from '@/modules/bookings/booking.entity.js';
import { BookingHold } from '@/modules/bookings/booking-hold.entity.js';
import { Court } from '@/modules/courts/court.entity.js';
import { realtime } from '@/realtime/realtime.js';

type ExpiredRange = {
  courtId: number;
  bookingDate: string;
  startTime: string;
  endTime: string;
};

function expiredRanges(raw: unknown[]): ExpiredRange[] {
  return (raw as Record<string, unknown>[]).map((row) => ({
    courtId: Number(row.court_id),
    bookingDate: String(row.booking_date),
    startTime: String(row.start_time),
    endTime: String(row.end_time),
  }));
}

async function publishExpiredRanges(ranges: ExpiredRange[], reason: 'booking_cancelled' | 'hold_expired') {
  if (ranges.length === 0) return;
  const courts = await AppDataSource.getRepository(Court).findBy({
    id: In([...new Set(ranges.map((range) => range.courtId))]),
  });
  const venueByCourt = new Map(courts.map((court) => [court.id, court.venueId]));
  for (const range of ranges) {
    const venueId = venueByCourt.get(range.courtId);
    if (!venueId) continue;
    if (reason === 'hold_expired') {
      realtime.schedule(venueId, range.bookingDate, 'slot.hold_changed', {
        venueId,
        ...range,
        action: 'expired',
      });
    }
    realtime.schedule(venueId, range.bookingDate, 'schedule.changed', {
      venueId,
      ...range,
      reason,
    });
  }
}

/** Convert abandoned player checkout holds into cancelled bookings. */
export async function expirePendingCheckoutBookings() {
  const result = await AppDataSource.getRepository(Booking)
    .createQueryBuilder()
    .update(Booking)
    .set({
      status: BookingStatus.CANCELLED,
      cancelledAt: new Date(),
      cancelReason: 'Hết hạn giữ chỗ',
      holdExpiresAt: null,
    })
    .where('status = :pending', { pending: BookingStatus.PENDING })
    .andWhere('source = :source', { source: BookingSource.APP })
    .andWhere('paymentStatus = :unpaid', { unpaid: PaymentStatus.UNPAID })
    .andWhere('holdExpiresAt IS NOT NULL')
    .andWhere('holdExpiresAt <= now()')
    .returning(['courtId', 'bookingDate', 'startTime', 'endTime'])
    .execute();

  await publishExpiredRanges(expiredRanges(result.raw), 'booking_cancelled');
  return result.affected ?? 0;
}

/** Remove expired slot selections and invalidate availability for active watchers. */
export async function expireBookingHolds() {
  const result = await AppDataSource.getRepository(BookingHold)
    .createQueryBuilder()
    .delete()
    .from(BookingHold)
    .where('expiresAt <= now()')
    .returning(['courtId', 'bookingDate', 'startTime', 'endTime'])
    .execute();

  await publishExpiredRanges(expiredRanges(result.raw), 'hold_expired');
  return result.affected ?? 0;
}
