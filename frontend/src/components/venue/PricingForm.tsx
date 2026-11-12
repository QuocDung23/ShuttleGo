import { Pressable, StyleSheet, View } from 'react-native';

import { OwnerText, ownerColors } from '@/components/ui/owner-ui';

const money = (value: number) => `${value.toLocaleString('vi-VN')}đ`;

export function PricingForm({ rows, prices, onChangePrice }: { rows: readonly (readonly [string, string])[]; prices: number[]; onChangePrice: (index: number, delta: number) => void }) {
  return <><OwnerText color={ownerColors.muted} size={16} style={styles.description}>Giá tính cho mỗi giờ trên một sân. Người chơi thấy giá này khi chọn giờ.</OwnerText><View style={styles.card}>{rows.map(([label, description], index) => <View key={label} style={styles.row}><View style={styles.label}><OwnerText weight="semibold">{label}</OwnerText><OwnerText size={12} color={ownerColors.muted}>{description}</OwnerText></View><Pressable onPress={() => onChangePrice(index, -10000)} style={styles.stepper}><OwnerText size={22}>−</OwnerText></Pressable><OwnerText weight="semibold" style={styles.value}>{index === 2 ? '17:00' : money(prices[index])}</OwnerText><Pressable onPress={() => onChangePrice(index, 10000)} style={styles.stepper}><OwnerText size={22}>+</OwnerText></Pressable></View>)}</View><OwnerText weight="semibold">Người chơi sẽ thấy</OwnerText><View style={styles.preview}>{[['06:00', '80k'], ['16:00', '80k'], ['17:00', '120k'], ['21:00', '120k']].map(([time, price]) => <View key={time} style={styles.previewCell}><OwnerText weight="semibold" color={ownerColors.greenInk}>{time}</OwnerText><OwnerText size={11} weight="semibold" color={ownerColors.greenInk}>{price}</OwnerText></View>)}</View><OwnerText size={11} color={ownerColors.muted}>Ngày thường. Cuối tuần: 90.000đ giờ thường, 130.000đ giờ cao điểm.</OwnerText></>;
}

const styles = StyleSheet.create({
  description: { lineHeight: 24 },
  card: { backgroundColor: '#fff', borderColor: ownerColors.border, borderWidth: 1, borderRadius: 24, overflow: 'hidden' },
  row: { minHeight: 72, paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: ownerColors.border, flexDirection: 'row', alignItems: 'center', gap: 8 },
  label: { flex: 1 },
  stepper: { height: 48, width: 48, borderRadius: 24, borderWidth: 1, borderColor: ownerColors.stroke, alignItems: 'center', justifyContent: 'center' },
  value: { width: 82, textAlign: 'center' },
  preview: { flexDirection: 'row', gap: 8 },
  previewCell: { flex: 1, minHeight: 56, borderRadius: 12, borderColor: '#15803d', borderWidth: 1, backgroundColor: ownerColors.green, alignItems: 'center', justifyContent: 'center', gap: 2 },
});
