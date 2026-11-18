import { useLocalSearchParams, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { OwnerButton, OwnerCard, OwnerText } from '@/components/ui/owner-ui';
import { ApiError } from '@/data/api/client';
import { bookingRepository } from '@/data/repositories/bookingRepository';
import { bookingStatusLabel } from '@/features/booking/bookingView';
import type { ApiBooking } from '@/models/booking';
import { useRealtimeRefresh } from '@/features/realtime/RealtimeProvider';
import { formatBookingDate, formatMoney, formatTimeRange } from '@/shared/format';
import { colors } from '@/shared/theme';

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between gap-4">
      <OwnerText className="text-body-lg text-guest-on-surface-variant">{label}</OwnerText>
      <OwnerText className="flex-1 text-right font-familjen-semibold text-body-lg text-guest-on-surface">
        {value}
      </OwnerText>
    </View>
  );
}

function StatusStep({
  symbol,
  symbolClass,
  label,
  description,
}: {
  symbol: string;
  symbolClass: string;
  label: string;
  description: string;
}) {
  return (
    <View className="flex-row items-start gap-3">
      <View className={`h-8 w-8 items-center justify-center rounded-full ${symbolClass}`}>
        <OwnerText className="font-familjen-bold text-label text-white">
          {symbol}
        </OwnerText>
      </View>
      <View className="flex-1">
        <OwnerText className="font-familjen-semibold text-title-sm text-guest-on-surface">
          {label}
        </OwnerText>
        <OwnerText className="text-body text-guest-on-surface-variant">
          {description}
        </OwnerText>
      </View>
    </View>
  );
}

export default function BookingSuccessPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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
  const completed = booking?.status === 'completed';
  const statusLabel = booking
    ? cancelled
      ? 'Đã hủy'
      : completed
        ? 'Hoàn thành'
        : bookingStatusLabel(booking)
    : '';
  const statusContainerClass = confirmed
    ? 'border border-slot-available-outline bg-guest-surface'
    : cancelled
      ? 'bg-error-container'
      : completed
        ? 'bg-slot-booked-background'
        : 'bg-slot-pending-background';
  const statusTextClass = confirmed
    ? 'text-slot-available-foreground'
    : cancelled
      ? 'text-error'
      : completed
        ? 'text-guest-on-surface-variant'
        : 'text-slot-pending-foreground';

  const paymentMethodLabel = booking?.paymentMethod === 'cash'
    ? 'Trả tại sân'
    : booking?.paymentMethod === 'bank_transfer'
      ? 'Chuyển khoản'
      : 'Chưa xác định';
  const paymentStatusLabel = booking?.paymentMethod === 'cash' && booking.paymentStatus === 'unpaid'
    ? 'Trả tại sân'
    : booking?.paymentStatus === 'paid'
      ? 'Đã thanh toán'
      : booking?.paymentStatus === 'pending_verification'
        ? 'Chờ chủ sân xác nhận'
        : booking?.paymentStatus === 'refunded'
          ? 'Đã hoàn tiền'
          : 'Chưa thanh toán';
  const venue = booking?.court?.venue;
  const venueAddress = venue?.address ?? [venue?.district, venue?.city].filter(Boolean).join(', ');

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-guest-background">
      <View className="h-16 flex-row items-center px-3">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Quay lại"
          onPress={() => router.back()}
          className="h-12 w-12 items-center justify-center rounded-full"
        >
          <SymbolView
            name={{ ios: 'arrow.left', android: 'arrow_back', web: 'arrow_back' }}
            tintColor={colors.guestOnSurfaceVariant}
            size={26}
          />
        </Pressable>
        <OwnerText className="ml-1 flex-1 font-familjen-bold text-title text-guest-on-surface">
          Chi tiết đơn
        </OwnerText>
      </View>

      {booking ? (
        <ScrollView
          className="flex-1"
          contentContainerClassName="gap-3 px-4 pb-6 pt-2"
          showsVerticalScrollIndicator={false}
        >
          <OwnerCard className="gap-3">
            <View className="flex-row items-center justify-between gap-2">
              <OwnerText className="flex-1 font-familjen-semibold text-title text-guest-on-surface">
                {venue?.name ?? 'Sân'}
              </OwnerText>
              <View className={`flex-row items-center gap-1 rounded-full px-3 py-1.5 ${statusContainerClass}`}>
                <OwnerText className={`font-familjen-bold text-label ${statusTextClass}`}>
                  {cancelled ? '× ' : confirmed || completed ? '✓ ' : ''}{statusLabel}
                </OwnerText>
              </View>
            </View>
            <View className="flex-row items-center gap-2">
              <SymbolView
                name={{ ios: 'mappin', android: 'location_on', web: 'location_on' }}
                tintColor={colors.guestOnSurfaceVariant}
                size={20}
              />
              <OwnerText className="flex-1 text-body-lg text-guest-on-surface-variant">
                {venueAddress || 'Chưa cập nhật địa chỉ'}
              </OwnerText>
            </View>
            <View className="h-px bg-divider" />
            <DetailRow label="Ngày" value={formatBookingDate(booking.bookingDate)} />
            <DetailRow label="Giờ" value={formatTimeRange(booking.startTime, booking.endTime)} />
            <DetailRow label="Sân" value={booking.court?.name ?? 'Sân'} />
            <DetailRow label="Mã đơn" value={booking.code} />
          </OwnerCard>

          <OwnerCard className="gap-4">
            <OwnerText className="font-familjen-semibold text-title text-guest-on-surface">
              Trạng thái đơn
            </OwnerText>
            <StatusStep
              symbol={cancelled ? '×' : confirmed || completed ? '✓' : '…'}
              symbolClass={cancelled
                ? 'bg-error'
                : confirmed
                  ? 'bg-slot-available-outline'
                  : completed
                    ? 'bg-primary'
                    : 'bg-outline'}
              label={statusLabel}
              description={cancelled
                ? booking.cancelReason || 'Khung giờ đã được mở lại'
                : confirmed
                  ? 'Chủ sân đã duyệt đơn của bạn'
                  : completed
                    ? 'Đơn đã hoàn thành'
                    : 'Đơn đang chờ chủ sân duyệt'}
            />
          </OwnerCard>

          <OwnerCard className="gap-4">
            <OwnerText className="font-familjen-semibold text-title text-guest-on-surface">
              Thanh toán
            </OwnerText>
            <DetailRow label="Phương thức" value={paymentMethodLabel} />
            <DetailRow label="Trạng thái" value={paymentStatusLabel} />
            <View className="h-px bg-divider" />
            <View className="flex-row items-end justify-between gap-4">
              <OwnerText className="font-familjen-semibold text-title-sm text-guest-on-surface">
                Tổng cộng
              </OwnerText>
              <OwnerText className="font-familjen-bold text-headline text-guest-on-surface">
                {formatMoney(booking.totalAmount)}
              </OwnerText>
            </View>
          </OwnerCard>
        </ScrollView>
      ) : (
        <View className="flex-1 items-center justify-center px-6">
          <OwnerText className={`text-center text-body ${error ? 'text-error' : 'text-guest-on-surface-variant'}`}>
            {!validBookingId ? 'Không tìm thấy đặt sân.' : (error || 'Đang tải thông tin đặt sân...')}
          </OwnerText>
        </View>
      )}

      {booking ? (
        <View
          className="flex-row items-center gap-3 border-t border-divider bg-guest-surface px-4 pt-3"
          style={{ paddingBottom: Math.max(16, insets.bottom) }}
        >
          <OwnerButton
            title="Xem lịch đặt"
            className="flex-1"
            onPress={() => router.replace('/(guest)/my-bookings')}
          />
          <OwnerButton
            title="Về trang chủ"
            outline
            className="flex-1"
            onPress={() => router.replace('/(guest)/explore')}
          />
        </View>
      ) : null}
    </SafeAreaView>
  );
}
