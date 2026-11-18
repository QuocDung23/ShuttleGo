import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OwnerButton, OwnerText } from '@/components/ui/owner-ui';
import { ApiError } from '@/data/api/client';
import { bookingRepository } from '@/data/repositories/bookingRepository';
import { formatCountdown } from '@/features/booking/pricing';
import type { ApiBooking } from '@/models/booking';
import {
  formatBookingDate,
  formatMoney,
  formatTimeRange,
  timeToMinutes,
} from '@/shared/format';

function errorMessage(error: unknown, fallback: string) {
  return error instanceof ApiError ? error.message || fallback : fallback;
}

export default function BookingConfirmPage() {
  const router = useRouter();
  const params = useLocalSearchParams<{ bookingId?: string }>();
  const bookingId = Number(params.bookingId);
  const validBookingId = Number.isInteger(bookingId) && bookingId > 0;

  const [booking, setBooking] = useState<ApiBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [now, setNow] = useState(() => Date.now());
  const skipAutoCancelRef = useRef(false);
  const bookingRef = useRef<ApiBooking | null>(null);
  bookingRef.current = booking;

  useEffect(() => {
    if (!validBookingId) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError('');
        const data = await bookingRepository.get(bookingId);
        if (!cancelled) setBooking(data);
      } catch (loadError) {
        if (loadError instanceof ApiError && loadError.status === 401) {
          skipAutoCancelRef.current = true;
          router.push({
            pathname: '/login',
            params: { redirect: `/(guest)/booking/confirm?bookingId=${bookingId}` },
          });
          return;
        }
        if (!cancelled) setError(errorMessage(loadError, 'Không thể tải thông tin đặt sân.'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [bookingId, validBookingId, router]);

  // Closing the payment sheet by swiping down cancels the unpaid checkout hold.
  // Delay activation to avoid treating React Strict Mode's setup cleanup as a real dismiss.
  useEffect(() => {
    let mountedForReal = false;
    const activationTimer = setTimeout(() => {
      mountedForReal = true;
    }, 0);
    return () => {
      clearTimeout(activationTimer);
      if (!mountedForReal || skipAutoCancelRef.current || !validBookingId) return;

      const current = bookingRef.current;
      if (
        current &&
        (current.status !== 'pending' ||
          current.paymentStatus !== 'unpaid' ||
          !current.holdExpiresAt ||
          Date.parse(current.holdExpiresAt) <= Date.now())
      ) {
        return;
      }
      void bookingRepository.cancelPendingCheckout(bookingId).catch(() => undefined);
    };
  }, [bookingId, validBookingId]);

  // Tick the hold countdown every second while this sheet is visible.
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const venue = booking?.court?.venue;
  const remainingMs = useMemo(() => {
    if (!booking?.holdExpiresAt) return 0;
    return Math.max(0, Date.parse(booking.holdExpiresAt) - now);
  }, [booking?.holdExpiresAt, now]);
  const holdExpired = remainingMs <= 0;
  const canCancelHold = Boolean(
    booking &&
      booking.status === 'pending' &&
      booking.paymentStatus === 'unpaid' &&
      booking.holdExpiresAt &&
      !holdExpired,
  );

  const hours = booking
    ? (timeToMinutes(booking.endTime) - timeToMinutes(booking.startTime)) / 60
    : 0;
  const rows: [string, string][] = booking
    ? [
        ['Sân', venue?.name ?? 'Sân'],
        ['Ngày', formatBookingDate(booking.bookingDate)],
        ['Giờ', formatTimeRange(booking.startTime, booking.endTime)],
        ['Court', `${booking.court?.name ?? 'Sân'} · ${hours} giờ`],
        ['Mã đặt sân', booking.code],
      ]
    : [];

  const onSubmit = async () => {
    if (!validBookingId || submitting) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const updated = await bookingRepository.confirmPayment(bookingId);
      setBooking(updated);
      skipAutoCancelRef.current = true;
      router.replace({
        pathname: '/(guest)/booking/success',
        params: { bookingId: String(bookingId) },
      });
    } catch (submitErr) {
      if (submitErr instanceof ApiError && submitErr.status === 401) {
        skipAutoCancelRef.current = true;
        router.push({
          pathname: '/login',
          params: { redirect: `/(guest)/booking/confirm?bookingId=${bookingId}` },
        });
        return;
      }
      setSubmitError(
        errorMessage(submitErr, 'Không thể gửi xác nhận. Vui lòng thử lại.'),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const cancelHold = async () => {
    if (!booking || submitting || cancelling) return;
    setCancelling(true);
    setSubmitError('');
    try {
      await bookingRepository.cancelPendingCheckout(booking.id);
      skipAutoCancelRef.current = true;
      router.back();
    } catch (cancelError) {
      if (cancelError instanceof ApiError && cancelError.status === 401) {
        skipAutoCancelRef.current = true;
        router.push({
          pathname: '/login',
          params: { redirect: `/(guest)/booking/confirm?bookingId=${booking.id}` },
        });
        return;
      }
      setSubmitError(errorMessage(cancelError, 'Không thể hủy giữ chỗ. Vui lòng thử lại.'));
    } finally {
      setCancelling(false);
    }
  };

  const confirmCancelHold = () => {
    Alert.alert(
      'Hủy giữ chỗ?',
      'Khung giờ sẽ được trả lại để người khác có thể chọn.',
      [
        { text: 'Tiếp tục thanh toán', style: 'cancel' },
        { text: 'Hủy giữ chỗ', style: 'destructive', onPress: () => void cancelHold() },
      ],
    );
  };

  if (!validBookingId) {
    return (
      <SafeAreaView edges={['top', 'bottom']} className="flex-1 items-center justify-center bg-guest-background px-6">
        <OwnerText className="text-center text-body text-guest-on-surface-variant">
          {error || 'Không tìm thấy đặt sân.'}
        </OwnerText>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-guest-background">
      <ScrollView
        contentContainerClassName="gap-5 px-5 pb-8 pt-5"
        showsVerticalScrollIndicator={false}
      >
        <View>
          <OwnerText className="font-familjen-bold text-headline text-guest-on-surface text-center">
            Thanh toán 
          </OwnerText>
          <OwnerText className="mt-1 text-body text-guest-on-surface-variant">
            Chuyển khoản đúng nội dung và số tiền bên dưới, sau đó báo cho chúng tôi.
          </OwnerText>
        </View>

        {loading ? (
          <OwnerText className="text-body text-guest-on-surface-variant">
            Đang tải thông tin đặt sân...
          </OwnerText>
        ) : error ? (
          <OwnerText className="text-body text-error">{error}</OwnerText>
        ) : booking ? (
          <>
            {/* Booking summary */}
            <View className="gap-3 rounded-2xl border border-guest-outline bg-guest-surface p-4">
              {rows.map(([label, value]) => (
                <View key={label} className="flex-row items-center justify-between gap-3">
                  <OwnerText className="text-body text-guest-on-surface-variant">{label}</OwnerText>
                  <OwnerText className="flex-1 text-right text-body font-familjen-medium text-guest-on-surface">
                    {value}
                  </OwnerText>
                </View>
              ))}
              <View className="mt-1 flex-row items-center justify-between border-t border-guest-outline pt-3">
                <OwnerText className="text-body text-guest-on-surface-variant">Tổng tiền</OwnerText>
                <OwnerText className="font-familjen-bold text-title text-primary">
                  {formatMoney(booking.totalAmount)}
                </OwnerText>
              </View>
            </View>

            {/* Bank details / QR from the venue — no QR is generated by the app. */}
            <View className="items-center gap-3 rounded-2xl border border-guest-outline bg-guest-surface px-5 py-6">
              {venue?.bankQrImageUrl ? (
                <View className="h-56 w-56 items-center justify-center overflow-hidden rounded-2xl border border-divider bg-white p-2">
                  <Image
                    source={{ uri: venue.bankQrImageUrl }}
                    contentFit="contain"
                    style={{ width: '100%', height: '100%' }}
                  />
                </View>
              ) : null}
              <View className="items-center gap-0.5">
                <OwnerText className="font-familjen-semibold text-title text-guest-on-surface">
                  {venue?.bankName ?? 'Chuyển khoản ngân hàng'}
                </OwnerText>
                <OwnerText className="font-familjen-bold text-body text-primary">
                  {venue?.bankAccountNo ?? '—'}
                </OwnerText>
                {venue?.bankAccountHolder ? (
                  <OwnerText className="text-body-sm text-guest-on-surface-variant">
                    Chủ TK: {venue.bankAccountHolder}
                  </OwnerText>
                ) : null}
                <OwnerText className="mt-2 text-center text-body-sm text-guest-on-surface-variant">
                  Nội dung chuyển khoản: {booking.code}
                </OwnerText>
              </View>
            </View>

            <View className="flex-row items-center justify-between rounded-xl border border-guest-outline bg-guest-surface px-3 py-2">
              <OwnerText className="text-caption text-guest-on-surface-variant">
                {holdExpired ? 'Đã hết hạn giữ chỗ' : 'Thời gian giữ chỗ'}
              </OwnerText>
              <OwnerText
                className={`font-familjen-semibold text-body-sm ${
                  holdExpired ? 'text-error' : 'text-primary'
                }`}
              >
                {holdExpired ? '00:00' : formatCountdown(remainingMs)}
              </OwnerText>
            </View>

            {holdExpired ? (
              <>
                <OwnerText className="text-center text-body text-error">
                  Hạn giữ chỗ đã qua. Vui lòng chọn giờ khác để đặt lại.
                </OwnerText>
                <OwnerButton
                  title="Chọn giờ lại"
                  outline
                  onPress={() => {
                    skipAutoCancelRef.current = true;
                    router.replace({
                      pathname: '/(guest)/booking',
                      params: { venueId: String(booking.court?.venueId ?? '') },
                    })
                  }}
                />
              </>
            ) : (
              <>
                {submitError ? (
                  <OwnerText className="text-center text-body text-error">{submitError}</OwnerText>
                ) : null}
                {canCancelHold ? (
                  <View className="flex-row items-center gap-2">
                    <View style={{ flex: 3 }}>
                      <OwnerButton
                        title={cancelling ? 'Đang hủy' : 'Hủy'}
                        outline
                        className="w-full px-2"
                        disabled={submitting || cancelling}
                        onPress={confirmCancelHold}
                      />
                    </View>
                    <View style={{ flex: 7 }}>
                      <OwnerButton
                        title={submitting ? 'Đang gửi...' : 'Tôi đã chuyển khoản'}
                        className="w-full px-2"
                        disabled={submitting || cancelling}
                        onPress={() => void onSubmit()}
                      />
                    </View>
                  </View>
                ) : (
                  <OwnerButton
                    title={submitting ? 'Đang gửi xác nhận...' : 'Tôi đã chuyển khoản'}
                    disabled={submitting || cancelling}
                    onPress={() => void onSubmit()}
                  />
                )}
              </>
            )}
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
