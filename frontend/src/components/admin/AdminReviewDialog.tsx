import { Modal, Pressable, TextInput, View } from 'react-native';
import { useState } from 'react';

import { OwnerButton, OwnerText, ownerColors } from '@/components/ui/owner-ui';

export function AdminReviewDialog({
  visible,
  title,
  description,
  confirmLabel,
  isSubmitting = false,
  onCancel,
  onConfirm,
}: {
  visible: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  isSubmitting?: boolean;
  onCancel: () => void;
  onConfirm: (note: string | null) => void;
}) {
  const [note, setNote] = useState('');

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel}>
      <Pressable onPress={onCancel} className="flex-1 justify-end bg-black/35">
        <Pressable onPress={() => {}} className="gap-4 rounded-t-3xl bg-background px-5 pb-8 pt-6">
          <View className="self-center rounded-full bg-divider" style={{ width: 40, height: 4 }} />
          <View className="gap-2">
            <OwnerText className="font-familjen-bold text-title">{title}</OwnerText>
            <OwnerText tone="muted">{description}</OwnerText>
          </View>
          <TextInput
            accessibilityLabel="Ghi chú"
            value={note}
            onChangeText={setNote}
            editable={!isSubmitting}
            placeholder="Ghi chú (không bắt buộc)"
            placeholderTextColor={ownerColors.muted}
            multiline
            className="min-h-20 rounded-2xl border border-divider bg-surface px-4 py-3 font-familjen text-body text-on-surface"
          />
          <View className="flex-row gap-3">
            <OwnerButton
              title="Đóng"
              outline
              disabled={isSubmitting}
              onPress={onCancel}
              className="flex-1"
            />
            <OwnerButton
              title={isSubmitting ? 'Đang lưu...' : confirmLabel}
              disabled={isSubmitting}
              onPress={() => onConfirm(note.trim() || null)}
              className="flex-1"
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
