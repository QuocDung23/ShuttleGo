import { useRouter } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { HomeHeader } from '@/components/home/HomeHeader';
import { OverviewStats } from '@/components/home/OverviewStats';
import { PendingBookingCard } from '@/components/home/PendingBookingCard';
import { OwnerPage, OwnerText } from '@/components/ui/owner-ui';
import { useHomeViewModel } from '@/features/home/hooks/useHomeViewModel';

export default function DashboardPage() {
  const router = useRouter();
  const { venueName, occupancyLabel, pendingBookings, resolveBooking, loading, error } =
    useHomeViewModel();

  return (
    <OwnerPage>
      <HomeHeader venueName={venueName} onOpenNotifications={() => router.push('/(owner)/notifications')} />
      {loading ? (
        <View className="items-center py-8"><ActivityIndicator /></View>
      ) : error ? (
        <OwnerText tone="muted" className="text-caption">{error}</OwnerText>
      ) : (
        <>
          <OverviewStats pendingCount={pendingBookings.length} occupancyLabel={occupancyLabel} />
          <OwnerText className="font-familjen-semibold text-title">Đơn chờ duyệt</OwnerText>
          {pendingBookings.length === 0 ? (
            <OwnerText tone="muted" className="text-caption">Không có đơn chờ duyệt.</OwnerText>
          ) : null}
          {pendingBookings.map((booking) => (
            <PendingBookingCard
              key={booking.id}
              booking={booking}
              onApprove={() => void resolveBooking(booking.id, 'confirmed')}
              onReject={() => void resolveBooking(booking.id, 'cancelled')}
            />
          ))}
        </>
      )}
    </OwnerPage>
  );
}
