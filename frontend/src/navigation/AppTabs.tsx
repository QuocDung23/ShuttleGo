import { usePathname, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { OwnerText, ownerColors } from '@/components/ui/owner-ui';

const tabs = [
  { path: '/', icon: { ios: 'square.grid.2x2.fill', android: 'grid_view', web: 'grid_view' }, label: 'Tổng quan' },
  { path: '/schedule', icon: { ios: 'calendar', android: 'calendar_month', web: 'calendar_month' }, label: 'Lịch sân' },
  { path: '/revenue', icon: { ios: 'chart.bar.fill', android: 'bar_chart', web: 'bar_chart' }, label: 'Doanh thu' },
  { path: '/account', icon: { ios: 'person.crop.circle', android: 'account_circle', web: 'account_circle' }, label: 'Tài khoản' },
] as const;

export default function AppTabs() {
  const pathname = usePathname();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const active = tabs.find(tab => tab.path === pathname)?.path;
  return <View style={[styles.bar,{height:64+Math.max(insets.bottom,8),paddingBottom:Math.max(insets.bottom,8)}]}>
    {tabs.map(tab => { const selected = active === tab.path; return <Pressable accessibilityRole="tab" accessibilityState={{selected}} key={tab.path} onPress={() => router.replace(tab.path)} style={styles.tab}>
      <View style={[styles.icon,{backgroundColor:selected?ownerColors.accentSoft:'transparent'}]}><SymbolView name={tab.icon} size={18} tintColor={selected?'#4a1a05':ownerColors.muted} />{tab.path==='/'&&<View style={styles.badge}><OwnerText size={10} weight="bold" color="#fff">3</OwnerText></View>}</View>
      <OwnerText size={12} weight={selected?'semibold':'regular'}>{tab.label}</OwnerText>
    </Pressable>; })}
  </View>;
}

const styles=StyleSheet.create({
  bar:{height:80,flexDirection:'row',alignItems:'center',justifyContent:'space-around',backgroundColor:'#f8ebe2',paddingHorizontal:8},
  tab:{flex:1,alignItems:'center',justifyContent:'center',gap:4,minHeight:64},
  icon:{height:32,minWidth:64,borderRadius:999,alignItems:'center',justifyContent:'center'},
  badge:{position:'absolute',right:5,top:-2,minWidth:16,height:16,borderRadius:8,backgroundColor:'#b3261e',alignItems:'center',justifyContent:'center'},
});
