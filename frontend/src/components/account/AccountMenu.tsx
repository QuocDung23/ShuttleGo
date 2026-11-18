import type { Href } from 'expo-router';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { Pressable } from 'react-native';

import { OwnerCard, OwnerText, ownerColors } from '@/components/ui/owner-ui';

type AccountMenuItem = { icon: SymbolViewProps['name']; title: string; path: Href };

export function AccountMenu({ items, onNavigate }: { items: readonly AccountMenuItem[]; onNavigate: (path: Href) => void }) {
  return <OwnerCard className="gap-0 py-1">{items.map(({ icon, title, path }) => <Pressable key={title} onPress={() => onNavigate(path)} className="h-14 flex-row items-center gap-[18px] px-4"><SymbolView name={icon} size={22} tintColor={ownerColors.muted} /><OwnerText className="flex-1 text-title-sm">{title}</OwnerText><OwnerText tone="muted" className="text-title">›</OwnerText></Pressable>)}</OwnerCard>;
}
