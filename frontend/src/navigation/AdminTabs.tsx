import { usePathname, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { OwnerText, ownerColors } from '@/components/ui/owner-ui';
import { adminVenueRepository } from '@/features/admin/adminVenueRepository';
import { useRealtimeRefresh } from '@/features/realtime/RealtimeProvider';

const tabs = [
  { path: '/admin/courts', label: 'Quản lý sân', icon: { ios: 'building.2', android: 'stadium', web: 'stadium' } },
  { path: '/admin/approvals', label: 'Duyệt sân', icon: { ios: 'checkmark.seal', android: 'fact_check', web: 'fact_check' } },
] as const;

export default function AdminTabs() {
  const pathname = usePathname();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [pendingCount, setPendingCount] = useState(0);
  const refreshPendingCount = useCallback(async () => {
    try {
      setPendingCount(await adminVenueRepository.countPending());
    } catch {
      // Keep the last known count; the approvals screen still has its own retry state.
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => void refreshPendingCount(), 0);
    return () => clearTimeout(timer);
  }, [refreshPendingCount]);

  useRealtimeRefresh(
    ['venue.application_submitted', 'venue.review_changed'],
    () => void refreshPendingCount(),
  );

  return (
    <View
      className="flex-row items-center justify-around border-t border-divider bg-surface-container px-2"
      style={{ height: 64 + Math.max(insets.bottom, 8), paddingBottom: Math.max(insets.bottom, 8) }}
    >
      {tabs.map((tab) => {
        const selected = pathname === tab.path;
        const showPendingCount = tab.path === '/admin/approvals' && pendingCount > 0;
        return (
          <Pressable
            key={tab.path}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={showPendingCount ? `${tab.label}, ${pendingCount} hồ sơ chờ duyệt` : tab.label}
            onPress={() => router.replace(tab.path)}
            className="min-h-16 flex-1 items-center justify-center gap-1"
          >
            <View className={`relative h-8 min-w-16 items-center justify-center rounded-full ${selected ? 'bg-primary-container' : ''}`}>
              <SymbolView name={tab.icon} size={19} tintColor={selected ? ownerColors.accentInk : ownerColors.muted} />
              {showPendingCount ? (
                <View className="absolute -right-1 -top-1 min-w-5 items-center justify-center rounded-full bg-error px-1 py-0.5">
                  <OwnerText tone="onPrimary" className="font-familjen-bold text-[11px] leading-4">
                    {pendingCount > 99 ? '99+' : pendingCount}
                  </OwnerText>
                </View>
              ) : null}
            </View>
            <OwnerText className={`text-caption ${selected ? 'font-familjen-semibold' : ''}`}>{tab.label}</OwnerText>
          </Pressable>
        );
      })}
    </View>
  );
}
