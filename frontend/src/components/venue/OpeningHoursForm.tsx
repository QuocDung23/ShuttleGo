import { StyleSheet } from 'react-native';

import { OwnerCard, OwnerChip, OwnerText, ownerColors } from '@/components/ui/owner-ui';

export function OpeningHoursForm({ days }: { days: string[] }) {
  return <><OwnerText color={ownerColors.muted}>Thiết lập giờ hoạt động của sân</OwnerText>{days.map((day) => <OwnerCard key={day} style={styles.row}><OwnerText weight="semibold">{day}</OwnerText><OwnerText>06:00 – 22:00</OwnerText><OwnerChip title="Mở cửa" selected /></OwnerCard>)}</>;
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
