import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import { OwnerText, ownerColors } from '@/components/ui/owner-ui';

export function HomeHeader({ venueName, onOpenNotifications }: { venueName: string; onOpenNotifications: () => void }) {
  return (
    <View style={styles.heading}>
      <View style={styles.title}>
        <OwnerText size={12} color={ownerColors.muted}>⌖  {venueName}</OwnerText>
        <OwnerText size={28} weight="bold">Tổng quan</OwnerText>
      </View>
      <Pressable accessibilityLabel="Thông báo" onPress={onOpenNotifications} style={styles.bell}>
        <SymbolView name={{ ios: 'bell', android: 'notifications', web: 'notifications' }} size={22} tintColor={ownerColors.ink} />
        <View style={styles.dot} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  heading: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 66 },
  title: { flex: 1 },
  bell: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  dot: { position: 'absolute', top: 9, right: 9, width: 8, height: 8, borderRadius: 4, backgroundColor: '#b3261e' },
});
