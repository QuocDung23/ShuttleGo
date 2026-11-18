import { usePathname, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { OwnerText, ownerColors } from '@/components/ui/owner-ui';

const tabs = [
  { path: '/admin/courts', label: 'Quản lý sân', icon: { ios: 'building.2', android: 'stadium', web: 'stadium' } },
  { path: '/admin/approvals', label: 'Duyệt sân', icon: { ios: 'checkmark.seal', android: 'fact_check', web: 'fact_check' } },
] as const;

export default function AdminTabs() {
  const pathname = usePathname();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  return (
    <View
      className="flex-row items-center justify-around border-t border-divider bg-surface-container px-2"
      style={{ height: 64 + Math.max(insets.bottom, 8), paddingBottom: Math.max(insets.bottom, 8) }}
    >
      {tabs.map((tab) => {
        const selected = pathname === tab.path;
        return (
          <Pressable
            key={tab.path}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => router.replace(tab.path)}
            className="min-h-16 flex-1 items-center justify-center gap-1"
          >
            <View className={`h-8 min-w-16 items-center justify-center rounded-full ${selected ? 'bg-primary-container' : ''}`}>
              <SymbolView name={tab.icon} size={19} tintColor={selected ? ownerColors.accentInk : ownerColors.muted} />
            </View>
            <OwnerText className={`text-caption ${selected ? 'font-familjen-semibold' : ''}`}>{tab.label}</OwnerText>
          </Pressable>
        );
      })}
    </View>
  );
}
