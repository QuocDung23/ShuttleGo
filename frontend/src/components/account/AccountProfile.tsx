import { StyleSheet, View } from 'react-native';

import { OwnerText, ownerColors } from '@/components/ui/owner-ui';

export function AccountProfile({ initials, name, description }: { initials: string; name: string; description: string }) {
  return <View style={styles.profile}><View style={styles.avatar}><OwnerText size={20} weight="semibold" color="#4a1a05">{initials}</OwnerText></View><View><OwnerText size={16} weight="semibold">{name}</OwnerText><OwnerText color={ownerColors.muted}>{description}</OwnerText></View></View>;
}

const styles = StyleSheet.create({
  profile: { flexDirection: 'row', alignItems: 'center', gap: 16, marginVertical: 6 },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: ownerColors.accentSoft, alignItems: 'center', justifyContent: 'center' },
});
