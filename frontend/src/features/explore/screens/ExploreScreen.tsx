import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { OwnerButton, OwnerPage, OwnerText, ownerColors } from '@/shared/components/owner-ui';

const dates = [['Hôm nay', '31/10'], ['CN', '01/11'], ['T2', '02/11'], ['T3', '03/11'], ['T4', '04/11'], ['T5', '05/11']];
const hours = ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00'];

export default function ScheduleScreen() {
  const [date, setDate] = useState(0);
  const [showOrder, setShowOrder] = useState(false);
  return <OwnerPage scroll={false}>
    <View style={styles.title}><OwnerText size={24} weight="bold">Lịch sân</OwnerText></View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateRow}>
      {dates.map(([day, dateLabel], i) => <Pressable key={dateLabel} onPress={() => setDate(i)} style={[styles.date, i === date && styles.dateActive]}><OwnerText size={12} weight="medium" color={i === date ? '#fff' : ownerColors.ink}>{day}</OwnerText><OwnerText size={16} weight="semibold" color={i === date ? '#fff' : ownerColors.ink}>{dateLabel}</OwnerText></Pressable>)}
    </ScrollView>
    <OwnerText color={ownerColors.muted} style={styles.hint}>Chạm vào ô giờ để xem người đặt, duyệt đơn hoặc giữ giờ cho khách gọi điện.</OwnerText>
    <ScrollView style={styles.gridScroll} contentContainerStyle={{ paddingBottom: 12 }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          {Array.from({ length: 6 }, (_, court) => <View key={court} style={styles.gridRow}>
            <OwnerText size={13} weight="semibold" style={styles.court}>Sân {court + 1}</OwnerText>
            {hours.map((hour, i) => <Pressable key={hour} onPress={() => setShowOrder(true)} style={[styles.slot, (court === 1 && i === 0) && styles.pendingSlot]}><OwnerText size={14} weight="semibold" color={ownerColors.muted}>{hour}</OwnerText><OwnerText size={11} weight="semibold" color={ownerColors.muted}>{court === 1 && i === 0 ? 'Chờ duyệt' : 'Đã đặt'}</OwnerText></Pressable>)}
          </View>)}
        </View>
      </ScrollView>
    </ScrollView>
    <View style={styles.legend}>{[['#e9f5ed', '#15803d', 'Còn trống'], [ownerColors.accentSoft, ownerColors.accent, 'Đang chọn'], [ownerColors.blue, ownerColors.blue, 'Chờ duyệt'], [ownerColors.gray, ownerColors.gray, 'Đã đặt']].map(([fill, border, label]) => <View key={label} style={styles.legendItem}><View style={[styles.legendSquare, { backgroundColor: fill, borderColor: border }]} /><OwnerText size={11} color={ownerColors.muted}>{label}</OwnerText></View>)}</View>
    <Modal visible={showOrder} transparent animationType="slide" onRequestClose={() => setShowOrder(false)}>
      <View style={styles.scrim}><Pressable style={StyleSheet.absoluteFill} onPress={() => setShowOrder(false)} /><View style={styles.sheet}><View style={styles.handle} /><OwnerText size={20} weight="semibold">Sân 2 · T7, 31/10 · 19:00</OwnerText>{[['Người đặt', 'Trần Quốc Bảo'], ['Số điện thoại', '0903 456 789'], ['Thời gian', '19:00 – 21:00'], ['Tiền sân', '260.000đ'], ['Thanh toán', 'Trả tại sân']].map(([a,b]) => <View key={a} style={styles.detail}><OwnerText color={ownerColors.muted}>{a}</OwnerText><OwnerText weight="semibold">{b}</OwnerText></View>)}<View style={styles.sheetActions}><OwnerButton title="Từ chối" outline style={{ flex: 1 }} onPress={() => setShowOrder(false)} /><OwnerButton title="Duyệt" style={{ flex: 1 }} onPress={() => setShowOrder(false)} /></View></View></View>
    </Modal>
  </OwnerPage>;
}

const styles = StyleSheet.create({
  title: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 16 },
  dateRow: { gap: 8, paddingHorizontal: 16, paddingBottom: 16 },
  date: { width: 64, height: 56, borderRadius: 16, backgroundColor: '#fff', borderWidth: 1, borderColor: ownerColors.stroke, alignItems: 'center', justifyContent: 'center', gap: 2 },
  dateActive: { backgroundColor: ownerColors.accent, borderColor: ownerColors.accent, width: 66 },
  hint: { paddingHorizontal: 16, paddingBottom: 12, lineHeight: 20 },
  gridScroll: { flex: 1 },
  gridRow: { height: 64, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16 },
  court: { width: 56 },
  slot: { width: 72, height: 56, borderRadius: 14, backgroundColor: ownerColors.gray, alignItems: 'center', justifyContent: 'center', gap: 3 },
  pendingSlot: { backgroundColor: ownerColors.blue },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  legendItem: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  legendSquare: { width: 14, height: 14, borderRadius: 4, borderWidth: 1 },
  scrim: { flex: 1, justifyContent: 'flex-end', backgroundColor: '#0005' },
  sheet: { backgroundColor: '#fff2e9', paddingHorizontal: 16, paddingTop: 18, paddingBottom: 24, borderTopLeftRadius: 24, borderTopRightRadius: 24, gap: 16 },
  handle: { width: 32, height: 4, borderRadius: 4, backgroundColor: '#c4b5aa', alignSelf: 'center', marginBottom: 4 },
  detail: { flexDirection: 'row', justifyContent: 'space-between' },
  sheetActions: { flexDirection: 'row', gap: 8, marginTop: 2 },
});
