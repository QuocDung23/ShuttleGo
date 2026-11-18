import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OwnerButton, OwnerText } from '@/components/ui/owner-ui';
import { ApiError } from '@/data/api/client';
import { bookingRepository } from '@/data/repositories/bookingRepository';
import {
  bookingStatusLabel,
  bookingTimeLabel,
} from '@/features/booking/bookingView';
import type { ApiBooking } from '@/models/booking';
import { useRealtimeRefresh } from '@/features/realtime/RealtimeProvider';
import { formatMoney } from '@/shared/format';

export default function BookingSuccessPage() {
  const router = useRouter();
  const params = useLocalSearchParams<{ bookingId?: string }>();
  const bookingId = Number(params.bookingId);
  const [booking, setBooking] = useState<ApiBooking | null>(null);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  const validBookingId = Number.isInteger(bookingId) && bookingId > 0;

  useEffect(() => {
    if (!validBookingId) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await bookingRepository.get(bookingId);
        if (!cancelled) setBooking(data);
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof ApiError
              ? loadError.message || 'Không thể tải thông tin đặt sân.'
              : 'Không thể tải thông tin đặt sân.',
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [bookingId, validBookingId, reloadKey]);

  useRealtimeRefresh(
    ['booking.payment_reported', 'booking.status_changed'],
    () => setReloadKey((value) => value + 1),
    validBookingId,
  );

  const confirmed = booking?.status === 'confirmed';
  const cancelled = booking?.status === 'cancelled';
  const statusLabel = booking
    ? cancelled
      ? 'Đã hủy'
      : bookingStatusLabel(booking)
    : '';
  const statusContainerClass = confirmed
    ? 'bg-slot-available-background'
    : cancelled
      ? 'bg-error-container'
      : 'bg-primary-container';
  const statusTextClass = confirmed
    ? 'text-slot-available-foreground'
    : cancelled
      ? 'text-error'
      : 'text-primary';

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-guest-background">
      <View className="flex-1 justify-center gap-4 px-5">
        <View
          className={`h-16 w-16 self-center items-center justify-center rounded-full ${statusContainerClass}`}
        >
          <OwnerText className={`font-familjen-bold text-title ${statusTextClass}`}>
            {cancelled ? '×' : '✓'}
          </OwnerText>
        </View>
        <OwnerText className="text-center font-familjen-bold text-title text-guest-on-surface">
          {confirmed
            ? 'Đặt sân đã được xác nhận'
            : cancelled
              ? 'Đơn đặt sân đã bị hủy'
              : 'Đã gửi yêu cầu đặt sân'}
        </OwnerText>
        <OwnerText className="text-center text-body text-guest-on-surface-variant">
          {confirmed
            ? 'Chủ sân đã xác nhận đơn đặt sân của bạn.'
            : cancelled
              ? 'Đơn đặt sân này đã được hủy.'
              : 'Chúng tôi đã nhận thông báo chuyển khoản. Đơn của bạn đang chờ chủ sân xác nhận.'}
        </OwnerText>

        <View
          className={`mt-3 gap-3 rounded-2xl border p-4 ${
            confirmed
              ? 'border-slot-available-outline bg-slot-available-background'
              : cancelled
                ? 'border-error/30 bg-error-container'
                : 'border-guest-outline bg-guest-surface'
          }`}
        >
          {booking ? (
            <>
              <View className={`self-start rounded-full px-3 py-1 ${statusContainerClass}`}>
                <OwnerText className={`font-familjen-bold text-caption ${statusTextClass}`}>
                  {confirmed ? '✓ ' : cancelled ? '× ' : ''}
                  {statusLabel}
                </OwnerText>
              </View>
              <OwnerText className="font-familjen-bold text-label text-guest-on-surface">
                {booking.court?.venue?.name ?? 'Sân'}
              </OwnerText>
              <OwnerText className="text-body-sm text-guest-on-surface-variant">
                {bookingTimeLabel(booking)}
              </OwnerText>
              <OwnerText className="text-body-sm text-guest-on-surface-variant">
                {booking.court?.name ?? 'Sân'} · {formatMoney(booking.totalAmount)}
              </OwnerText>
              <OwnerText className="text-body-sm text-guest-on-surface-variant">
                Mã đặt sân: {booking.code}
              </OwnerText>
              {cancelled && booking.cancelReason ? (
                <OwnerText className="border-t border-error/30 pt-2 text-body-sm font-familjen-medium text-error">
                  Lý do hủy: {booking.cancelReason}
                </OwnerText>
              ) : null}
            </>
          ) : (
            <OwnerText className="text-body text-guest-on-surface-variant">
              {!validBookingId ? 'Không tìm thấy đặt sân.' : (error || 'Đang tải thông tin đặt sân...')}
            </OwnerText>
          )}
        </View>

        <View className="mt-3 gap-3">
          <OwnerButton title="Xem lịch đặt" onPress={() => router.replace('/(guest)/my-bookings')} />
          <OwnerButton title="Về trang chủ" outline onPress={() => router.replace('/(guest)/explore')} />
        </View>
      </View>
    </SafeAreaView>
  );
}
