import { StyleSheet, View } from 'react-native';

import { OwnerText, ownerColors } from '@/components/ui/owner-ui';

const items = [['#e9f5ed', '#15803d', 'Còn trống'], [ownerColors.accentSoft, ownerColors.accent, 'Đang chọn'], [ownerColors.blue, ownerColors.blue, 'Chờ duyệt'], [ownerColors.gray, ownerColors.gray, 'Đã đặt']];

export function ScheduleLegend() {
  return <View style={styles.legend}>{items.map(([fill, border, label]) => <View key={label} style={styles.item}><View style={[styles.square, { backgroundColor: fill, borderColor: border }]} /><OwnerText size={11} color={ownerColors.muted}>{label}</OwnerText></View>)}</View>;
}

const styles = StyleSheet.create({
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  item: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  square: { width: 14, height: 14, borderRadius: 4, borderWidth: 1 },
});
