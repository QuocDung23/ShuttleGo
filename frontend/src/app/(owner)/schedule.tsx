import { View } from 'react-native';

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
      <OwnerText tone="muted" className="px-4 pb-3 leading-5">Chạm vào ô giờ để xem người đặt, duyệt đơn hoặc giữ giờ cho khách gọi điện.</OwnerText>
      <CourtScheduleGrid courts={viewModel.courts} onOpenBooking={viewModel.openBookingDetail} />
      <ScheduleLegend />
      <BookingDetailSheet detail={viewModel.bookingDetail} visible={viewModel.isBookingDetailVisible} onClose={viewModel.closeBookingDetail} />
    </OwnerPage>
  );
}
