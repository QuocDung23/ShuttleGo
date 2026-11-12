import { useRouter } from 'expo-router';

import { HomeHeader } from '@/components/home/HomeHeader';
import { OverviewStats } from '@/components/home/OverviewStats';
import { PendingBookingCard } from '@/components/home/PendingBookingCard';
import { OwnerPage, OwnerText } from '@/components/ui/owner-ui';
import { useHomeViewModel } from '@/features/home/hooks/useHomeViewModel';

export default function HomePage() {
  const router = useRouter();
  const { venueName, occupancyLabel, pendingBookings, resolveBooking } = useHomeViewModel();

  return (
    <OwnerPage>
      <HomeHeader venueName={venueName} onOpenNotifications={() => router.push('/notifications')} />
      <OverviewStats pendingCount={pendingBookings.length} occupancyLabel={occupancyLabel} />
      <OwnerText size={20} weight="semibold">Đơn chờ duyệt</OwnerText>
      {pendingBookings.map((booking) => <PendingBookingCard key={booking.id} booking={booking} onApprove={() => resolveBooking(booking.id)} onReject={() => resolveBooking(booking.id)} />)}
    </OwnerPage>
  );
}
