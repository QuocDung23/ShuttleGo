import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { OwnerText, ownerColors } from '@/components/ui/owner-ui';
import type { ScheduleCourt } from '@/models/schedule';

export function CourtScheduleGrid({ courts, onOpenBooking }: { courts: ScheduleCourt[]; onOpenBooking: () => void }) {
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          {courts.map((court) => <View key={court.id} style={styles.row}>
            <OwnerText size={13} weight="semibold" style={styles.court}>{court.name}</OwnerText>
            {court.slots.map((slot) => <Pressable key={slot.hour} onPress={onOpenBooking} style={[styles.slot, slot.status === 'Chờ duyệt' && styles.pendingSlot]}><OwnerText size={14} weight="semibold" color={ownerColors.muted}>{slot.hour}</OwnerText><OwnerText size={11} weight="semibold" color={ownerColors.muted}>{slot.status}</OwnerText></Pressable>)}
          </View>)}
        </View>
      </ScrollView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingBottom: 12 },
  row: { height: 64, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16 },
  court: { width: 56 },
  slot: { width: 72, height: 56, borderRadius: 14, backgroundColor: ownerColors.gray, alignItems: 'center', justifyContent: 'center', gap: 3 },
  pendingSlot: { backgroundColor: ownerColors.blue },
});
