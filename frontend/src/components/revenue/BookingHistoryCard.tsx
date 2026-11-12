import { StyleSheet, View } from 'react-native';

import { OwnerCard, OwnerText, ownerColors } from '@/components/ui/owner-ui';
import type { BookingHistoryItem } from '@/models/booking';

export function BookingHistoryCard({ booking }: { booking: BookingHistoryItem }) {
  return <OwnerCard><View style={styles.header}><OwnerText weight="semibold">{booking.customerName}</OwnerText><View style={styles.status}><OwnerText size={12} weight="semibold" color={ownerColors.blueInk}>{booking.status}</OwnerText></View></View><OwnerText color={ownerColors.muted}>{booking.time}</OwnerText><OwnerText color={ownerColors.muted}>{booking.details}</OwnerText></OwnerCard>;
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  status: { backgroundColor: ownerColors.blue, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
});
