import { ActivityIndicator, View } from 'react-native';

import { BookingHistoryCard } from '@/components/revenue/BookingHistoryCard';
import { RevenueChart } from '@/components/revenue/RevenueChart';
import { RevenueFilters } from '@/components/revenue/RevenueFilters';
import { OwnerPage, OwnerText } from '@/components/ui/owner-ui';
import { useRevenueViewModel } from '@/features/revenue/hooks/useRevenueViewModel';

export default function RevenuePage() {
  const {
    bars,
    totalRevenue,
    bookingCount,
    hoursSold,
    filters,
    filter,
    setFilter,
    visibleBookings,
    loading,
    error,
  } = useRevenueViewModel();

  return (
    <OwnerPage>
      <OwnerText className="mb-1 mt-10 font-familjen-bold text-headline">Doanh thu</OwnerText>
      {loading ? (
        <View className="items-center py-8"><ActivityIndicator /></View>
      ) : error ? (
        <OwnerText tone="muted" className="text-caption">{error}</OwnerText>
      ) : (
        <>
          <RevenueChart
            bars={bars}
            totalRevenue={totalRevenue}
            bookingCount={bookingCount}
            hoursSold={hoursSold}
          />
          <OwnerText className="mt-3 font-familjen-semibold text-title">Lịch sử đơn</OwnerText>
          <RevenueFilters filters={filters} value={filter} onChange={setFilter} />
          {visibleBookings.length === 0 ? (
            <OwnerText tone="muted" className="text-caption">Không có đơn nào.</OwnerText>
          ) : null}
          {visibleBookings.map((booking) => <BookingHistoryCard key={booking.id} booking={booking} />)}
        </>
      )}
    </OwnerPage>
  );
}
