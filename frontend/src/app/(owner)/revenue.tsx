import { BookingHistoryCard } from '@/components/revenue/BookingHistoryCard';
import { RevenueChart } from '@/components/revenue/RevenueChart';
import { RevenueFilters } from '@/components/revenue/RevenueFilters';
import { OwnerPage, OwnerText } from '@/components/ui/owner-ui';
import { useRevenueViewModel } from '@/features/revenue/hooks/useRevenueViewModel';

export default function RevenuePage() {
  const { bars, filters, filter, setFilter, visibleBookings } = useRevenueViewModel();

  return (
    <OwnerPage>
      <OwnerText className="mb-1 mt-10 font-familjen-bold text-headline">Doanh thu</OwnerText>
      <RevenueChart bars={bars} />
      <OwnerText className="mt-3 font-familjen-semibold text-title">Lịch sử đơn</OwnerText>
      <RevenueFilters filters={filters} value={filter} onChange={setFilter} />
      {visibleBookings.map((booking) => <BookingHistoryCard key={booking.id} booking={booking} />)}
    </OwnerPage>
  );
}
