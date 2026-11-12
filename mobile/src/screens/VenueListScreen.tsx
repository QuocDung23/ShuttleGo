import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FlatList, Pressable, ScrollView, Text, View } from 'react-native';
import { C, Card, Empty, Input, s } from '../components/ui';
import { RootStackParamList } from '../navigation/types';
import { money } from '../utils/format';
import { useVenueListViewModel } from '../viewmodels/useVenueListViewModel';

export default function VenueListScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const vm = useVenueListViewModel();
  const priceOptions = [undefined, 70000, 100000];
  return (
    <View style={s.screen}>
      <Input placeholder="Tìm theo tên hoặc địa chỉ sân..." value={vm.filter.q ?? ''} onChangeText={(q) => vm.setFilter((f) => ({ ...f, q }))} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, marginBottom: 6 }}>
        {priceOptions.map((p) => (
          <Pressable key={String(p)} onPress={() => vm.setFilter((f) => ({ ...f, maxPrice: p }))}
            style={[s.chip, vm.filter.maxPrice === p && { backgroundColor: C.primary, borderColor: C.primary }]}>
            <Text style={{ color: vm.filter.maxPrice === p ? '#fff' : C.text }}>{p ? `≤ ${money(p)}` : 'Mọi giá'}</Text>
          </Pressable>
        ))}
        {vm.amenities.map((a) => {
          const on = vm.filter.amenities?.includes(a.code);
          return (
            <Pressable key={a.code} onPress={() => vm.toggleAmenity(a.code)} style={[s.chip, on && { backgroundColor: C.primary, borderColor: C.primary }]}>
              <Text style={{ color: on ? '#fff' : C.text }}>{a.name}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
      {vm.error && <Text style={{ color: C.danger }}>{vm.error}</Text>}
      <FlatList
        data={vm.venues} keyExtractor={(v) => v.id} refreshing={vm.loading} onRefresh={vm.reload}
        ListEmptyComponent={!vm.loading ? <Empty text="Không tìm thấy sân phù hợp" /> : null}
        renderItem={({ item }) => (
          <Pressable onPress={() => nav.navigate('VenueDetail', { venueId: item.id })}>
            <Card>
              <Text style={s.h2}>{item.name}</Text>
              <Text style={s.sub}>{item.address}{item.district ? `, ${item.district}` : ''}</Text>
              <View style={[s.row, { justifyContent: 'space-between', marginTop: 6 }]}>
                <Text style={{ color: C.primary, fontWeight: '600' }}>Từ {money(item.minPrice)}/giờ</Text>
                <Text style={s.sub}>{item.courtCount} sân · ★ {item.avgRating ?? '—'} ({item.reviewCount})</Text>
              </View>
            </Card>
          </Pressable>
        )}
      />
    </View>
  );
}
