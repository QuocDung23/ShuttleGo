import { StyleSheet, View } from 'react-native';

import { OwnerCard, OwnerText, ownerColors } from '@/components/ui/owner-ui';
import type { RevenueBar } from '@/models/revenue';

export function RevenueChart({ bars }: { bars: RevenueBar[] }) {
  return (
    <OwnerCard style={styles.card}>
      <OwnerText size={12} color={ownerColors.muted}>Doanh thu 7 ngày qua</OwnerText>
      <OwnerText size={26} weight="bold">3.300.000đ</OwnerText>
      <OwnerText size={12} color={ownerColors.muted}>18 đơn · 27 giờ đã bán qua ShuttleGo</OwnerText>
      <View style={styles.chart}>{bars.map(([day, height, amount]) => <View key={day} style={styles.column}><OwnerText size={11} color={ownerColors.muted}>{amount}</OwnerText><View style={[styles.bar, { height }, day === 'H.nay' && styles.today]} /><OwnerText size={11}>{day}</OwnerText></View>)}</View>
    </OwnerCard>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, gap: 2 },
  chart: { height: 138, marginTop: 20, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 6 },
  column: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: 5 },
  bar: { width: '100%', maxWidth: 36, borderRadius: 8, backgroundColor: ownerColors.accentSoft },
  today: { backgroundColor: ownerColors.accent },
});
