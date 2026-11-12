import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { OwnerButton, OwnerText, ownerColors } from '@/components/ui/owner-ui';
import type { BookingDetail } from '@/models/schedule';

export function BookingDetailSheet({ detail, visible, onClose }: { detail: BookingDetail; visible: boolean; onClose: () => void }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.scrim}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <OwnerText size={20} weight="semibold">{detail.title}</OwnerText>
          {detail.rows.map(([label, value]) => <View key={label} style={styles.detail}><OwnerText color={ownerColors.muted}>{label}</OwnerText><OwnerText weight="semibold">{value}</OwnerText></View>)}
          <View style={styles.actions}><OwnerButton title="Từ chối" outline style={styles.action} onPress={onClose} /><OwnerButton title="Duyệt" style={styles.action} onPress={onClose} /></View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: { flex: 1, justifyContent: 'flex-end', backgroundColor: '#0005' },
  sheet: { backgroundColor: '#fff2e9', paddingHorizontal: 16, paddingTop: 18, paddingBottom: 24, borderTopLeftRadius: 24, borderTopRightRadius: 24, gap: 16 },
  handle: { width: 32, height: 4, borderRadius: 4, backgroundColor: '#c4b5aa', alignSelf: 'center', marginBottom: 4 },
  detail: { flexDirection: 'row', justifyContent: 'space-between' },
  actions: { flexDirection: 'row', gap: 8, marginTop: 2 },
  action: { flex: 1 },
});
