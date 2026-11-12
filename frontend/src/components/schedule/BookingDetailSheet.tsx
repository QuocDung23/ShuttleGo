import { Modal, Pressable, View } from 'react-native';

import { OwnerButton, OwnerText } from '@/components/ui/owner-ui';
import type { BookingDetail } from '@/models/schedule';

export function BookingDetailSheet({ detail, visible, onClose }: { detail: BookingDetail; visible: boolean; onClose: () => void }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-scrim">
        <Pressable className="absolute inset-0" onPress={onClose} />
        <View className="gap-4 rounded-t-3xl bg-surface-container-low px-4 pb-6 pt-[18px]">
          <View className="mb-1 h-1 w-8 self-center rounded bg-on-surface-variant opacity-40" />
          <OwnerText className="font-familjen-semibold text-title">{detail.title}</OwnerText>
          {detail.rows.map(([label, value]) => <View key={label} className="flex-row justify-between"><OwnerText tone="muted">{label}</OwnerText><OwnerText className="font-familjen-semibold">{value}</OwnerText></View>)}
          <View className="mt-0.5 flex-row gap-2"><OwnerButton title="Từ chối" outline className="flex-1" onPress={onClose} /><OwnerButton title="Duyệt" className="flex-1" onPress={onClose} /></View>
        </View>
      </View>
    </Modal>
  );
}
