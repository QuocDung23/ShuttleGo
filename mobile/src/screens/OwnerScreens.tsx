import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback } from 'react';
import { Alert, FlatList, Pressable, Text, View } from 'react-native';
import { Button, C, Card, Empty, s } from '../components/ui';
import { RootStackParamList } from '../navigation/types';
import { dateLabel, money } from '../utils/format';
import { useOwnerBookingsViewModel } from '../viewmodels/useOwnerBookingsViewModel';
import { useOwnerVenuesViewModel } from '../viewmodels/useOwnerVenueViewModel';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function OwnerVenuesScreen() {
  const nav = useNavigation<Nav>();
  const vm = useOwnerVenuesViewModel();
  useFocusEffect(useCallback(() => { vm.reload(); }, [vm.reload])); // quay lại từ form -> tải lại
  return (
    <View style={s.screen}>
      <Button title="+ Thêm cơ sở" onPress={() => nav.navigate('VenueForm', {})} />
      <FlatList
        data={vm.venues} keyExtractor={(v) => v.id} ListEmptyComponent={<Empty text="Chưa có cơ sở nào" />}
        renderItem={({ item: v }) => (
          <Card>
            <Text style={s.h2}>{v.name} {!v.isActive && <Text style={{ color: C.danger }}>(ngừng)</Text>}</Text>
            <Text style={s.sub}>{v.address} · {v.courtCount} sân · từ {money(v.minPrice)}</Text>
            <View style={[s.row, { gap: 6 }]}>
              <Button title="Sửa" variant="outline" onPress={() => nav.navigate('VenueForm', { venueId: v.id })} />
              <Button title="Xóa" variant="danger" onPress={() => vm.remove(v)} />
            </View>
          </Card>
        )}
      />
    </View>
  );
}

export function OwnerBookingsScreen() {
  const vm = useOwnerBookingsViewModel();
  const reject = (id: string) => {
    const b = vm.items.find((x) => x.id === id)!;
    Alert.alert('Từ chối đơn', 'Chọn lý do', [
      { text: 'Sân bảo trì', onPress: () => vm.reject(b, 'Sân bảo trì') },
      { text: 'Chưa nhận thanh toán', onPress: () => vm.reject(b, 'Chưa nhận được thanh toán') },
      { text: 'Đóng', style: 'cancel' },
    ]);
  };
  return (
    <View style={s.screen}>
      <View style={[s.row, { marginBottom: 8 }]}>
        {[['PENDING', 'Chờ duyệt'], ['CONFIRMED', 'Đã duyệt'], ['CANCELLED,REJECTED', 'Đã hủy']].map(([k, l]) => (
          <Pressable key={k} onPress={() => vm.setStatus(k)} style={[s.chip, vm.status === k && { backgroundColor: C.primary, borderColor: C.primary }]}>
            <Text style={{ color: vm.status === k ? '#fff' : C.text }}>{l}</Text>
          </Pressable>
        ))}
      </View>
      <FlatList
        data={vm.items} keyExtractor={(b) => b.id} refreshing={vm.loading} onRefresh={vm.reload}
        ListEmptyComponent={!vm.loading ? <Empty text="Không có đơn" /> : null}
        renderItem={({ item: b }) => (
          <Card>
            <Text style={{ fontWeight: '700' }}>{b.code} · {b.userName} {b.userPhone ? `(${b.userPhone})` : ''}</Text>
            <Text style={s.sub}>{b.venueName} · {dateLabel(b.playDate)}</Text>
            <Text>{b.slots.map((x) => `${x.courtName} ${x.startTime}–${x.endTime}`).join(', ')}</Text>
            <Text>{money(b.totalAmount)} · {b.payment.status === 'PAID' ? '✓ Khách báo đã TT' : 'Chưa TT'}</Text>
            {b.status === 'PENDING' && (
              <View style={[s.row, { gap: 6 }]}>
                <Button title="Duyệt" onPress={() => vm.approve(b)} />
                <Button title="Từ chối" variant="danger" onPress={() => reject(b.id)} />
              </View>
            )}
          </Card>
        )}
      />
    </View>
  );
}
