import { BookingSource, BookingStatus, PaymentStatus } from '@/common/enums.js';
import { AppDataSource } from '@/database/data-source.js';
import { Booking } from '@/modules/bookings/booking.entity.js';

/** Convert abandoned player checkout holds into cancelled bookings. */
export async function expirePendingCheckoutBookings() {
  const result = await AppDataSource.getRepository(Booking)
    .createQueryBuilder()
    .update(Booking)
    .set({
      status: BookingStatus.CANCELLED,
      cancelledAt: new Date(),
      cancelReason: 'Hết hạn giữ chỗ',
    })
    .where('status = :pending', { pending: BookingStatus.PENDING })
    .andWhere('source = :source', { source: BookingSource.APP })
    .andWhere('paymentStatus = :unpaid', { unpaid: PaymentStatus.UNPAID })
    .andWhere('holdExpiresAt IS NOT NULL')
    .andWhere('holdExpiresAt <= now()')
    .execute();

  return result.affected ?? 0;
}
