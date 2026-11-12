import { StyleSheet, View } from 'react-native';

import { OwnerButton, OwnerCard, OwnerText, ownerColors } from '@/components/ui/owner-ui';
import type { PendingBooking } from '@/models/booking';

export function PendingBookingCard({ booking, onApprove, onReject }: { booking: PendingBooking; onApprove: () => void; onReject: () => void }) {
  return (
    <OwnerCard>
      <View style={styles.header}><OwnerText weight="semibold">{booking.customerName}</OwnerText><View style={styles.status}><OwnerText size={12} weight="semibold" color={ownerColors.blueInk}>Chờ duyệt</OwnerText></View></View>
      <View style={styles.info}><OwnerText color={ownerColors.muted}>{booking.time}</OwnerText><OwnerText color={ownerColors.muted}>{booking.details}</OwnerText></View>
      <View style={styles.actions}><OwnerButton title="Từ chối" outline style={styles.action} onPress={onReject} /><OwnerButton title="Duyệt" style={styles.action} onPress={onApprove} /></View>
    </OwnerCard>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  status: { borderRadius: 20, backgroundColor: ownerColors.blue, paddingHorizontal: 14, paddingVertical: 5 },
  info: { paddingLeft: 22, gap: 8 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  action: { minWidth: 120, minHeight: 46 },
});
