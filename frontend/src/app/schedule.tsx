import { StyleSheet, View } from 'react-native';

import { BookingDetailSheet } from '@/components/schedule/BookingDetailSheet';
import { CourtScheduleGrid } from '@/components/schedule/CourtScheduleGrid';
import { DateSelector } from '@/components/schedule/DateSelector';
import { ScheduleLegend } from '@/components/schedule/ScheduleLegend';
import { OwnerPage, OwnerText, ownerColors } from '@/components/ui/owner-ui';
import { useScheduleViewModel } from '@/features/schedule/hooks/useScheduleViewModel';

export default function SchedulePage() {
  const viewModel = useScheduleViewModel();

  return (
    <OwnerPage scroll={false}>
      <View style={styles.title}><OwnerText size={24} weight="bold">Lịch sân</OwnerText></View>
      <DateSelector dates={viewModel.dates} selectedIndex={viewModel.selectedDateIndex} onSelect={viewModel.selectDate} />
      <OwnerText color={ownerColors.muted} style={styles.hint}>Chạm vào ô giờ để xem người đặt, duyệt đơn hoặc giữ giờ cho khách gọi điện.</OwnerText>
      <CourtScheduleGrid courts={viewModel.courts} onOpenBooking={viewModel.openBookingDetail} />
      <ScheduleLegend />
      <BookingDetailSheet detail={viewModel.bookingDetail} visible={viewModel.isBookingDetailVisible} onClose={viewModel.closeBookingDetail} />
    </OwnerPage>
  );
}

const styles = StyleSheet.create({
  title: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 16 },
  hint: { paddingHorizontal: 16, paddingBottom: 12, lineHeight: 20 },
});
