import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { OwnerText, ownerColors } from '@/components/ui/owner-ui';
import type { ScheduleDate } from '@/models/schedule';

export function DateSelector({ dates, selectedIndex, onSelect }: { dates: ScheduleDate[]; selectedIndex: number; onSelect: (index: number) => void }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {dates.map((date, index) => {
        const selected = index === selectedIndex;
        return <Pressable key={date.label} onPress={() => onSelect(index)} style={[styles.date, selected && styles.active]}><OwnerText size={12} weight="medium" color={selected ? '#fff' : ownerColors.ink}>{date.day}</OwnerText><OwnerText size={16} weight="semibold" color={selected ? '#fff' : ownerColors.ink}>{date.label}</OwnerText></Pressable>;
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: 8, paddingHorizontal: 16, paddingBottom: 16 },
  date: { width: 64, height: 56, borderRadius: 16, backgroundColor: '#fff', borderWidth: 1, borderColor: ownerColors.stroke, alignItems: 'center', justifyContent: 'center', gap: 2 },
  active: { backgroundColor: ownerColors.accent, borderColor: ownerColors.accent, width: 66 },
});
