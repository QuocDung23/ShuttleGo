import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { OwnerButton, OwnerCard, OwnerPage, OwnerText, ownerColors } from '@/shared/components/owner-ui';

const orders = [
  ['Trần Quốc Bảo', 'T7, 31/10 · 19:00 – 21:00', 'Sân 2 · 260.000đ · Trả tại sân'],
  ['Lê Thu Hà', 'CN, 01/11 · 18:00 – 19:00', 'Sân 4 · 130.000đ · Đã thanh toán'],
  ['Phạm Gia Huy', 'T2, 02/11 · 20:00 – 22:00', 'Sân 1 · 240.000đ · Trả tại sân'],
];

export default function HomeScreen() {
  const router = useRouter();
  return (
    <OwnerPage>
      <View style={styles.heading}>
        <View style={{ flex: 1 }}>
          <OwnerText size={12} color={ownerColors.muted}>⌖  Sân cầu lông Kỳ Hòa</OwnerText>
          <OwnerText size={28} weight="bold">Tổng quan</OwnerText>
        </View>
        <Pressable accessibilityLabel="Thông báo" onPress={() => router.push('/notifications')} style={styles.bell}><OwnerText size={22}>♧</OwnerText><View style={styles.dot} /></Pressable>
      </View>
      <View style={styles.stats}>
        <OwnerCard style={styles.stat}><OwnerText size={12} color={ownerColors.muted}>Đơn chờ duyệt</OwnerText><OwnerText size={24} weight="bold">3</OwnerText></OwnerCard>
        <OwnerCard style={styles.stat}><OwnerText size={12} color={ownerColors.muted}>Hôm nay đã kín</OwnerText><OwnerText size={24} weight="bold">49/96 giờ</OwnerText></OwnerCard>
      </View>
      <OwnerText size={20} weight="semibold">Đơn chờ duyệt</OwnerText>
      {orders.map(([name, time, details]) => <OwnerCard key={name}>
        <View style={styles.orderHead}><OwnerText weight="semibold">{name}</OwnerText><View style={styles.status}><OwnerText size={12} weight="semibold" color={ownerColors.blueInk}>Chờ duyệt</OwnerText></View></View>
        <View style={styles.orderInfo}><OwnerText color={ownerColors.muted}>{time}</OwnerText><OwnerText color={ownerColors.muted}>{details}</OwnerText></View>
        <View style={styles.actions}><OwnerButton title="Từ chối" outline style={styles.action} /><OwnerButton title="Duyệt" style={styles.action} /></View>
      </OwnerCard>)}
    </OwnerPage>
  );
}

const styles = StyleSheet.create({
  heading: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 66 },
  bell: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  dot: { position: 'absolute', top: 9, right: 9, width: 8, height: 8, borderRadius: 4, backgroundColor: '#b3261e' },
  stats: { flexDirection: 'row', gap: 8 },
  stat: { flex: 1, height: 84, padding: 14, justifyContent: 'center', gap: 4 },
  orderHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  status: { borderRadius: 20, backgroundColor: ownerColors.blue, paddingHorizontal: 14, paddingVertical: 5 },
  orderInfo: { paddingLeft: 22, gap: 8 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  action: { minWidth: 120, minHeight: 46 },
});
