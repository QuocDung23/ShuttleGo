import { BookingHistoryCard } from '@/components/revenue/BookingHistoryCard';
import { RevenueChart } from '@/components/revenue/RevenueChart';
import { RevenueFilters } from '@/components/revenue/RevenueFilters';
import { OwnerPage, OwnerText } from '@/components/ui/owner-ui';
import { useRevenueViewModel } from '@/features/revenue/hooks/useRevenueViewModel';

export default function RevenuePage() {
  const { bars, filters, filter, setFilter, visibleBookings } = useRevenueViewModel();

  return (
    <OwnerPage>
      <OwnerText size={24} weight="bold" style={{ marginTop: 40, marginBottom: 4 }}>Doanh thu</OwnerText>
      <RevenueChart bars={bars} />
      <OwnerText size={20} weight="semibold" style={{ marginTop: 12 }}>Lịch sử đơn</OwnerText>
      <RevenueFilters filters={filters} value={filter} onChange={setFilter} />
      {visibleBookings.map((booking) => <BookingHistoryCard key={booking.id} booking={booking} />)}
    </OwnerPage>
  );
}
