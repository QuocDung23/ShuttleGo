import { ActivityIndicator, View } from 'react-native';

import { BookingDetailSheet } from '@/components/schedule/BookingDetailSheet';
import { CourtScheduleGrid } from '@/components/schedule/CourtScheduleGrid';
import { DateSelector } from '@/components/schedule/DateSelector';
import { ScheduleLegend } from '@/components/schedule/ScheduleLegend';
import { OwnerPage, OwnerText } from '@/components/ui/owner-ui';
import { useScheduleViewModel } from '@/features/schedule/hooks/useScheduleViewModel';

export default function SchedulePage() {
  const viewModel = useScheduleViewModel();

  return (
    <OwnerPage scroll={false}>
      <View className="px-4 pb-4 pt-1"><OwnerText className="font-familjen-bold text-headline">Lịch sân</OwnerText></View>
      <DateSelector dates={viewModel.dates} selectedIndex={viewModel.selectedDateIndex} onSelect={viewModel.selectDate} />
      <OwnerText tone="muted" className="px-4 pb-3 leading-5">Ô xanh là giờ còn trống. Chạm vào giờ đã đặt hoặc chờ duyệt để xem thông tin.</OwnerText>
      {viewModel.loading ? (
        <View className="items-center py-8"><ActivityIndicator /></View>
      ) : viewModel.error ? (
        <OwnerText tone="muted" className="px-4 text-caption">{viewModel.error}</OwnerText>
      ) : viewModel.courts.length === 0 ? (
        <OwnerText tone="muted" className="px-4 text-caption">Chưa có sân nào đang hoạt động.</OwnerText>
      ) : viewModel.isClosed ? (
        <OwnerText tone="muted" className="px-4 text-caption">Sân nghỉ vào ngày này theo giờ mở cửa đã cài đặt.</OwnerText>
      ) : (
        <CourtScheduleGrid courts={viewModel.courts} onOpenBooking={viewModel.openBookingDetail} />
      )}
      <ScheduleLegend />
      <BookingDetailSheet
        detail={viewModel.bookingDetail}
        visible={viewModel.isBookingDetailVisible}
        onClose={viewModel.closeBookingDetail}
      />
    </OwnerPage>
  );
}
