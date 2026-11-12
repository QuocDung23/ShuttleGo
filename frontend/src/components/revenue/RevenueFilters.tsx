import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { OwnerText, ownerColors } from '@/components/ui/owner-ui';
import type { RevenueFilter } from '@/models/revenue';

export function RevenueFilters({ filters, value, onChange }: { filters: RevenueFilter[]; value: RevenueFilter; onChange: (filter: RevenueFilter) => void }) {
  return <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>{filters.map((item) => <Pressable key={item} onPress={() => onChange(item)} style={[styles.filter, value === item && styles.active]}><OwnerText size={12} weight="semibold">{item}</OwnerText></Pressable>)}</ScrollView>;
}

const styles = StyleSheet.create({
  filters: { gap: 8, paddingBottom: 4 },
  filter: { borderWidth: 1, borderColor: ownerColors.stroke, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 7 },
  active: { backgroundColor: ownerColors.accentSoft, borderColor: ownerColors.accentSoft },
});
