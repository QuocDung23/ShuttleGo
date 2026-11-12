import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { OwnerCard, OwnerPage, OwnerText, ownerColors } from '@/shared/components/owner-ui';

const bars = [['CN', 48, '390k'], ['T2', 44, '360k'], ['T3', 88, '720k'], ['T4', 44, '360k'], ['T5', 44, '360k'], ['T6', 88, '720k'], ['H.nay', 48, '390k']] as const;
const filters = ['Tất cả', 'Chờ duyệt', 'Đã xác nhận', 'Hoàn tất'];

export default function RevenueScreen() {
  const [filter, setFilter] = useState('Tất cả');
  return <OwnerPage>
    <OwnerText size={24} weight="bold" style={{ marginTop: 40, marginBottom: 4 }}>Doanh thu</OwnerText>
    <OwnerCard style={styles.chartCard}>
      <OwnerText size={12} color={ownerColors.muted}>Doanh thu 7 ngày qua</OwnerText>
      <OwnerText size={26} weight="bold">3.300.000đ</OwnerText>
      <OwnerText size={12} color={ownerColors.muted}>18 đơn · 27 giờ đã bán qua ShuttleGo</OwnerText>
      <View style={styles.chart}>{bars.map(([day, height, amount]) => <View key={day} style={styles.barCol}><OwnerText size={11} color={ownerColors.muted}>{amount}</OwnerText><View style={[styles.bar, { height }, day === 'H.nay' && styles.todayBar]} /><OwnerText size={11}>{day}</OwnerText></View>)}</View>
    </OwnerCard>
    <OwnerText size={20} weight="semibold" style={{ marginTop: 12 }}>Lịch sử đơn</OwnerText>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>{filters.map(item => <Pressable key={item} onPress={() => setFilter(item)} style={[styles.filter, filter === item && styles.activeFilter]}><OwnerText size={12} weight="semibold">{item}</OwnerText></Pressable>)}</ScrollView>
    {[
      ['Phạm Gia Huy', 'T2, 02/11 · 20:00 – 22:00', 'Sân 1 · 240.000đ · Trả tại sân', 'Chờ duyệt'],
      ['Lê Thu Hà', 'CN, 01/11 · 18:00 – 19:00', 'Sân 4 · 130.000đ · Đã thanh toán', 'Đã xác nhận'],
      ['Trần Quốc Bảo', 'T7, 31/10 · 19:00 – 21:00', 'Sân 2 · 260.000đ · Trả tại sân', 'Hoàn tất'],
    ].filter(row => filter === 'Tất cả' || row[3] === filter).map(([name,time,info,status]) => <OwnerCard key={name}><View style={styles.orderTop}><OwnerText weight="semibold">{name}</OwnerText><View style={styles.status}><OwnerText size={12} weight="semibold" color={ownerColors.blueInk}>{status}</OwnerText></View></View><OwnerText color={ownerColors.muted}>{time}</OwnerText><OwnerText color={ownerColors.muted}>{info}</OwnerText></OwnerCard>)}
  </OwnerPage>;
}

const styles = StyleSheet.create({
  chartCard: { padding: 16, gap: 2 },
  chart: { height: 138, marginTop: 20, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 6 },
  barCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: 5 },
  bar: { width: '100%', maxWidth: 36, borderRadius: 8, backgroundColor: ownerColors.accentSoft },
  todayBar: { backgroundColor: ownerColors.accent },
  filters: { gap: 8, paddingBottom: 4 },
  filter: { borderWidth: 1, borderColor: ownerColors.stroke, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 7 },
  activeFilter: { backgroundColor: ownerColors.accentSoft, borderColor: ownerColors.accentSoft },
  orderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  status: { backgroundColor: ownerColors.blue, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
});
