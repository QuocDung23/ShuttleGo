import type { Href } from 'expo-router';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { Pressable, StyleSheet } from 'react-native';

import { OwnerCard, OwnerText, ownerColors } from '@/components/ui/owner-ui';

type AccountMenuItem = { icon: SymbolViewProps['name']; title: string; path: Href };

export function AccountMenu({ items, onNavigate }: { items: readonly AccountMenuItem[]; onNavigate: (path: Href) => void }) {
  return <OwnerCard style={styles.card}>{items.map(({ icon, title, path }) => <Pressable key={title} onPress={() => onNavigate(path)} style={styles.row}><SymbolView name={icon} size={22} tintColor={ownerColors.muted} /><OwnerText size={16} style={styles.title}>{title}</OwnerText><OwnerText size={20} color={ownerColors.muted}>›</OwnerText></Pressable>)}</OwnerCard>;
}

const styles = StyleSheet.create({
  card: { paddingVertical: 4, gap: 0 },
  row: { height: 56, flexDirection: 'row', alignItems: 'center', gap: 18, paddingHorizontal: 16 },
  title: { flex: 1 },
});
