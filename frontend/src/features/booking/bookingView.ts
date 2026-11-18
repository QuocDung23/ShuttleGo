import type { ApiBooking, BookingHistoryItem, PendingBooking } from '@/models/booking';
import {
  formatBookingDate,
  formatMoney,
  formatTimeRange,
} from '@/shared/format';

export function bookingTimeLabel(booking: ApiBooking) {
  return `${formatBookingDate(booking.bookingDate)} · ${formatTimeRange(booking.startTime, booking.endTime)}`;
}

/** A pending/unpaid booking whose server-issued hold has passed is shown as expired. */
export function isHoldExpired(booking: ApiBooking) {
  if (booking.paymentStatus !== 'unpaid') return false;
  return Boolean(booking.holdExpiresAt && Date.parse(booking.holdExpiresAt) <= Date.now());
}

export function bookingStatusLabel(booking: ApiBooking) {
  if (isHoldExpired(booking)) return 'Hết hạn giữ chỗ';
  if (
    booking.status === 'pending' &&
    booking.paymentStatus === 'unpaid' &&
    booking.holdExpiresAt
  ) {
    return 'Đang chọn';
  }
  switch (booking.status) {
    case 'pending':
      return 'Chờ duyệt';
    case 'confirmed':
      return 'Đã xác nhận';
    case 'cancelled':
      return 'Đã hủy';
    default:
      return 'Hoàn tất';
  }
}

function paymentLabel(booking: ApiBooking) {
  switch (booking.paymentStatus) {
    case 'paid':
      return 'Đã thanh toán';
    case 'refunded':
      return 'Đã hoàn tiền';
    case 'pending_verification':
      return 'Chờ chủ sân xác nhận';
    default:
      return isHoldExpired(booking) ? 'Hết hạn giữ chỗ' : 'Chưa báo chuyển khoản';
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
  const status = bookingStatusLabel(booking) as BookingHistoryItem['status'];
  return { ...toPendingBooking(booking), status };
}
