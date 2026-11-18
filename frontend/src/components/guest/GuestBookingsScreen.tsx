import { useFocusEffect, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GuestTabBar } from '@/components/guest/GuestTabBar';
import { OwnerButton, OwnerText } from '@/components/ui/owner-ui';
import { ApiError } from '@/data/api/client';
import { bookingRepository } from '@/data/repositories/bookingRepository';
import { useAuth } from '@/features/auth/AuthContext';
import { useRealtimeRefresh } from '@/features/realtime/RealtimeProvider';
import {
  bookingStatusLabel,
  bookingTimeLabel,
  isHoldExpired,
} from '@/features/booking/bookingView';
import type { ApiBooking } from '@/models/booking';
import { formatMoney } from '@/shared/format';
import { colors } from '@/shared/theme';

function paymentText(booking: ApiBooking) {
  if (isHoldExpired(booking)) return 'Hết hạn giữ chỗ';
  switch (booking.paymentStatus) {
    case 'paid':
      return 'Đã thanh toán';
    case 'pending_verification':
      return 'Chờ chủ sân xác nhận';
    case 'refunded':
      return 'Đã hoàn tiền';
    default:
      return 'Chưa báo chuyển khoản';
  }
}

export function GuestBookingsScreen() {
  const router = useRouter();
  const { status } = useAuth();
  const [bookings, setBookings] = useState<ApiBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = status === 'signedIn' ? await bookingRepository.listAll() : [];
      setBookings(data);
    } catch (loadError) {
      setError(
        loadError instanceof ApiError
          ? loadError.message || 'Không thể tải lịch đặt.'
          : 'Không thể tải lịch đặt. Vui lòng thử lại.',
      );
    } finally {
      setLoading(false);
    }
  }, [status]);

  useRealtimeRefresh(
    ['booking.checkout_created', 'booking.payment_reported', 'booking.status_changed'],
    () => void load(),
    status === 'signedIn',
  );

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        setLoading(true);
        setError('');
        try {
          const data = status === 'signedIn' ? await bookingRepository.listAll() : [];
          if (!cancelled) setBookings(data);
        } catch (loadError) {
          if (!cancelled) {
            setError(
              loadError instanceof ApiError
                ? loadError.message || 'Không thể tải lịch đặt.'
                : 'Không thể tải lịch đặt. Vui lòng thử lại.',
            );
          }
        } finally {
          if (!cancelled) setLoading(false);
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [status]),
  );

  const isSignedOut = status === 'signedOut';

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-guest-background">
      <ScrollView
        contentContainerClassName="w-full max-w-[560px] self-center grow px-4 pb-6 pt-3"
        showsVerticalScrollIndicator={false}
      >
        <OwnerText className="font-familjen-bold text-headline-lg text-guest-on-surface">
          Lịch đặt
        </OwnerText>

        {loading ? (
          <View className="mt-8 items-center">
            <OwnerText className="text-body text-guest-on-surface-variant">
              Đang tải lịch đặt...
            </OwnerText>
          </View>
        ) : error ? (
          <View className="mt-8 items-center gap-4">
            <OwnerText className="text-center text-body text-error">{error}</OwnerText>
            <OwnerButton title="Thử lại" outline onPress={() => void load()} />
          </View>
        ) : isSignedOut ? (
          <View className="mt-7 flex-1 items-center justify-center gap-4 pb-10">
            <SymbolView
              name={{ ios: 'calendar', android: 'calendar_month', web: 'calendar_month' }}
              tintColor={colors.guestOnSurfaceVariant}
              size={44}
            />
            <OwnerText className="font-familjen-bold text-title text-guest-on-surface">
              Chưa có lịch đặt nào
            </OwnerText>
            <OwnerText className="max-w-[300px] text-center text-body text-guest-on-surface-variant">
              Đăng nhập để quản lý và xem các lượt đặt sân của bạn.
            </OwnerText>
            <OwnerButton title="Khám phá sân" onPress={() => router.replace('/(guest)/explore')} />
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/login')}
              className="min-h-11 items-center justify-center"
            >
              <OwnerText tone="primary" className="font-familjen-semibold">
                Đăng nhập để xem lịch đặt
              </OwnerText>
            </Pressable>
          </View>
        ) : bookings.length === 0 ? (
          <View className="mt-7 flex-1 items-center justify-center gap-4 pb-10">
            <SymbolView
              name={{ ios: 'calendar', android: 'calendar_month', web: 'calendar_month' }}
              tintColor={colors.guestOnSurfaceVariant}
              size={44}
            />
            <OwnerText className="font-familjen-bold text-title text-guest-on-surface">
              Chưa có lịch đặt nào
            </OwnerText>
            <OwnerText className="max-w-[300px] text-center text-body text-guest-on-surface-variant">
              Các lượt đặt sân của bạn sẽ hiển thị ở đây sau khi đặt.
            </OwnerText>
            <OwnerButton title="Khám phá sân" onPress={() => router.replace('/(guest)/explore')} />
          </View>
        ) : (
          <View className="mt-5 gap-3">
            {bookings.map((booking) => {
              const expired = isHoldExpired(booking);
              const canPay =
                booking.paymentStatus === 'unpaid' &&
                (booking.status === 'pending' || expired);
              const confirmed = booking.status === 'confirmed';
              const cancelled = booking.status === 'cancelled';
              const cardClasses = confirmed
                ? 'border-slot-available-outline bg-slot-available-background'
                : cancelled
                  ? 'border-error/30 bg-error-container'
                  : 'border-guest-outline bg-guest-surface';
              const badgeClasses = confirmed
                ? 'border-slot-available-outline bg-guest-surface'
                : cancelled || expired
                  ? 'border-error/30 bg-guest-surface'
                  : booking.status === 'pending'
                    ? 'border-slot-pending-background bg-slot-pending-background'
                    : 'border-guest-outline bg-slot-booked-background';
              const badgeTextClass = confirmed
                ? 'text-slot-available-foreground'
                : cancelled || expired
                  ? 'text-error'
                  : booking.status === 'pending'
                    ? 'text-slot-pending-foreground'
                    : 'text-guest-on-surface-variant';
              const statusLabel = cancelled ? 'Đã hủy' : bookingStatusLabel(booking);
              return (
                <Pressable
                  key={booking.id}
                  accessibilityRole="button"
                  onPress={() =>
                    router.push({
                      pathname: canPay
                        ? '/(guest)/booking/confirm'
                        : '/(guest)/booking/success',
                      params: { bookingId: String(booking.id) },
                    })
                  }
                  className={`gap-2 rounded-2xl border p-4 ${cardClasses}`}
                >
                  <View className="flex-row items-start justify-between gap-2">
                    <OwnerText className="flex-1 font-familjen-bold text-label text-guest-on-surface">
                      {booking.court?.venue?.name ?? 'Sân'}
                    </OwnerText>
                    <View className={`rounded-full border px-3 py-1 ${badgeClasses}`}>
                      <OwnerText className={`text-caption font-familjen-bold ${badgeTextClass}`}>
                        {confirmed ? '✓ ' : cancelled ? '× ' : ''}{statusLabel}
                      </OwnerText>
                    </View>
                  </View>
                  <OwnerText className="text-body-sm text-guest-on-surface-variant">
                    {bookingTimeLabel(booking)}
                  </OwnerText>
                  <OwnerText className="text-body-sm text-guest-on-surface-variant">
                    {booking.court?.name ?? 'Sân'} · {formatMoney(booking.totalAmount)} ·{' '}
                    {paymentText(booking)}
                  </OwnerText>
                  {cancelled && booking.cancelReason ? (
                    <OwnerText className="text-caption font-familjen-medium text-error">
                      Lý do hủy: {booking.cancelReason}
                    </OwnerText>
                  ) : null}
                  <OwnerText className="text-caption text-guest-on-surface-variant">
                    Mã: {booking.code}
                  </OwnerText>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>

      <GuestTabBar active="bookings" />
    </SafeAreaView>
  );
}
