import type { ApiBooking, BookingHistoryItem, PendingBooking } from '@/models/booking';
import {
  formatBookingDate,
  formatMoney,
  formatTimeRange,
} from '@/shared/format';

export function bookingTimeLabel(booking: ApiBooking) {
  return `${formatBookingDate(booking.bookingDate)} · ${formatTimeRange(booking.startTime, booking.endTime)}`;
}

function paymentLabel(booking: ApiBooking) {
  switch (booking.paymentStatus) {
    case 'paid':
      return 'Đã thanh toán';
    case 'refunded':
      return 'Đã hoàn tiền';
    case 'pending_verification':
      return 'Chờ xác nhận thanh toán';
    default:
      return 'Trả tại sân';
  }
}

function detailsLabel(booking: ApiBooking) {
  const court = booking.court?.name ?? 'Sân';
  return `${court} · ${formatMoney(booking.totalAmount)} · ${paymentLabel(booking)}`;
}

export function toPendingBooking(booking: ApiBooking): PendingBooking {
  return {
    id: String(booking.id),
    customerName: booking.contactName,
    time: bookingTimeLabel(booking),
    details: detailsLabel(booking),
  };
}

export function toBookingHistoryItem(booking: ApiBooking): BookingHistoryItem {
  const status: BookingHistoryItem['status'] =
    booking.status === 'pending'
      ? 'Chờ duyệt'
      : booking.status === 'confirmed'
        ? 'Đã xác nhận'
        : booking.status === 'cancelled'
          ? 'Đã hủy'
          : 'Hoàn tất';
  return { ...toPendingBooking(booking), status };
}
