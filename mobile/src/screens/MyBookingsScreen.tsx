import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FlatList, Pressable, Text, View } from 'react-native';
import { Button, C, Card, Empty, StatusBadge, s } from '../components/ui';
import { RootStackParamList } from '../navigation/types';
import { dateLabel, money } from '../utils/format';
import { TABS, useMyBookingsViewModel } from '../viewmodels/useMyBookingsViewModel';

export default function MyBookingsScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const vm = useMyBookingsViewModel();
  return (
    <View style={s.screen}>
      <View style={[s.row, { marginBottom: 8 }]}>
        {TABS.map((t) => (
          <Pressable key={t.key} onPress={() => vm.setTab(t.key)} style={[s.chip, vm.tab === t.key && { backgroundColor: C.primary, borderColor: C.primary }]}>
            <Text style={{ color: vm.tab === t.key ? '#fff' : C.text }}>{t.label}</Text>
          </Pressable>
        ))}
      </View>
      <FlatList
        data={vm.items} keyExtractor={(b) => b.id} refreshing={vm.loading} onRefresh={vm.reload}
        ListEmptyComponent={!vm.loading ? <Empty text="Chưa có đơn nào" /> : null}
        renderItem={({ item: b }) => (
          <Card>
            <View style={[s.row, { justifyContent: 'space-between' }]}>
              <Text style={{ fontWeight: '700' }}>{b.venueName}</Text>
              <StatusBadge status={b.status} />
            </View>
            <Text style={s.sub}>{dateLabel(b.playDate)} · {b.slots.map((x) => `${x.courtName} ${x.startTime}`).join(', ')}</Text>
            <Text>Mã {b.code} · {money(b.totalAmount)} · {b.payment.status === 'PAID' ? 'Đã TT' : b.payment.status === 'REFUNDED' ? 'Đã hoàn tiền' : 'Chưa TT'}</Text>
            {b.rejectReason && <Text style={{ color: C.danger }}>Lý do: {b.rejectReason}</Text>}
            <View style={[s.row, { flexWrap: 'wrap', gap: 6, marginTop: 6 }]}>
              {['PENDING', 'CONFIRMED'].includes(b.status) && b.payment.status === 'UNPAID' &&
                <Button title="Thanh toán" onPress={() => nav.navigate('Payment', { bookingId: b.id })} />}
              {['PENDING', 'CONFIRMED'].includes(b.status) && <Button title="Hủy đặt" variant="outline" onPress={() => vm.cancel(b)} />}
              {b.status === 'COMPLETED' && !b.reviewed && <Button title="Đánh giá 5★" variant="outline" onPress={() => vm.review(b, 5)} />}
              {['CANCELLED', 'REJECTED'].includes(b.status) && <Button title="Xóa" variant="danger" onPress={() => vm.remove(b)} />}
            </View>
          </Card>
        )}
      />
    </View>
  );
}
