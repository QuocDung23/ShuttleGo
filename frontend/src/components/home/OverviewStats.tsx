import { StyleSheet, View } from 'react-native';

import { OwnerCard, OwnerText, ownerColors } from '@/components/ui/owner-ui';

export function OverviewStats({ pendingCount, occupancyLabel }: { pendingCount: number; occupancyLabel: string }) {
  return (
    <View style={styles.stats}>
      <OwnerCard style={styles.stat}><OwnerText size={12} color={ownerColors.muted}>Đơn chờ duyệt</OwnerText><OwnerText size={24} weight="bold">{pendingCount}</OwnerText></OwnerCard>
      <OwnerCard style={styles.stat}><OwnerText size={12} color={ownerColors.muted}>Hôm nay đã kín</OwnerText><OwnerText size={24} weight="bold">{occupancyLabel}</OwnerText></OwnerCard>
    </View>
  );
}

const styles = StyleSheet.create({
  stats: { flexDirection: 'row', gap: 8 },
  stat: { flex: 1, height: 84, padding: 14, justifyContent: 'center', gap: 4 },
});
