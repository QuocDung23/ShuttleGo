import { usePathname, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { OwnerText, ownerColors } from '@/components/ui/owner-ui';

const tabs = [
  { path: '/dashboard', icon: { ios: 'square.grid.2x2.fill', android: 'grid_view', web: 'grid_view' }, label: 'Tổng quan' },
  { path: '/schedule', icon: { ios: 'calendar', android: 'calendar_month', web: 'calendar_month' }, label: 'Lịch sân' },
  { path: '/revenue', icon: { ios: 'chart.bar.fill', android: 'bar_chart', web: 'bar_chart' }, label: 'Doanh thu' },
  { path: '/account', icon: { ios: 'person.crop.circle', android: 'account_circle', web: 'account_circle' }, label: 'Tài khoản' },
] as const;

export default function AppTabs() {
  const pathname = usePathname();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const active = tabs.find(tab => tab.path === pathname)?.path;
  return <View className="flex-row items-center justify-around bg-surface-container px-2" style={{height:64+Math.max(insets.bottom,8),paddingBottom:Math.max(insets.bottom,8)}}>
    {tabs.map(tab => { const selected = active === tab.path; return <Pressable accessibilityRole="tab" accessibilityState={{selected}} key={tab.path} onPress={() => router.replace(tab.path)} className="min-h-16 flex-1 items-center justify-center gap-1">
      <View className={`h-8 min-w-16 items-center justify-center rounded-full ${selected ? 'bg-primary-container' : ''}`}><SymbolView name={tab.icon} size={18} tintColor={selected?ownerColors.accentInk:ownerColors.muted} />{tab.path==='/dashboard'&&<View className="absolute -top-0.5 right-[5px] h-4 min-w-4 items-center justify-center rounded-lg bg-error"><OwnerText tone="onPrimary" className="font-familjen-bold text-[10px]">3</OwnerText></View>}</View>
      <OwnerText className={`text-caption ${selected ? 'font-familjen-semibold' : ''}`}>{tab.label}</OwnerText>
    </Pressable>; })}
  </View>;
}
