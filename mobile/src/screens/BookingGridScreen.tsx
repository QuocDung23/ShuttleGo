import { Pressable, ScrollView, Text, View } from 'react-native';
import { Button, C, s } from '../components/ui';
import { SlotStatus } from '../models';
import { ScreenProps } from '../navigation/types';
import { addDays, dateLabel, money, vnToday } from '../utils/format';
import { useBookingGridViewModel } from '../viewmodels/useBookingGridViewModel';

const CELL: Record<SlotStatus | 'SELECTED', { bg: string; label: string }> = {
  FREE: { bg: '#FFFFFF', label: 'Trống' },
  SELECTED: { bg: '#0E9F6E', label: 'Đang chọn' },
  PENDING: { bg: '#FDE68A', label: 'Chờ duyệt' },
  BOOKED: { bg: '#FCA5A5', label: 'Đã đặt' },
  PAST: { bg: '#E5E7EB', label: 'Đã qua' },
};

/** Chức năng cốt lõi: lưới SÂN (hàng) x KHUNG GIỜ (cột). */
export default function BookingGridScreen({ route, navigation }: ScreenProps<'BookingGrid'>) {
  const vm = useBookingGridViewModel(route.params.venueId);
  const days = Array.from({ length: 7 }, (_, i) => addDays(vnToday(), i));

  const onSubmit = async () => {
    const b = await vm.submit();
    if (b) navigation.replace('Payment', { bookingId: b.id });
  };

  return (
    <View style={s.screen}>
      <Text style={s.h2}>{route.params.venueName}</Text>
      <ScrollView horizontal style={{ flexGrow: 0, marginBottom: 8 }} showsHorizontalScrollIndicator={false}>
        {days.map((d) => (
          <Pressable key={d} onPress={() => vm.setDate(d)} style={[s.chip, vm.date === d && { backgroundColor: C.primary, borderColor: C.primary }]}>
            <Text style={{ color: vm.date === d ? '#fff' : C.text }}>{dateLabel(d).slice(0, 5)}</Text>
          </Pressable>
        ))}
      </ScrollView>
      <View style={[s.row, { flexWrap: 'wrap', marginBottom: 8 }]}>
        {Object.entries(CELL).map(([k, v]) => (
          <View key={k} style={[s.row, { marginRight: 10 }]}>
            <View style={{ width: 14, height: 14, backgroundColor: v.bg, borderWidth: 1, borderColor: C.border, marginRight: 4 }} />
            <Text style={{ fontSize: 12 }}>{v.label}</Text>
          </View>
        ))}
      </View>

      <ScrollView horizontal>
        <View>
          <View style={s.row}>
            <View style={{ width: 64 }} />
            {vm.grid?.hours.map((h) => <Text key={h} style={{ width: 56, textAlign: 'center', fontSize: 12 }}>{h}</Text>)}
          </View>
          {vm.grid?.courts.map((court) => (
            <View key={court.id} style={[s.row, { marginTop: 4 }]}>
              <Text style={{ width: 64, fontWeight: '600' }}>{court.name}</Text>
              {court.slots.map((slot) => {
                const sel = vm.isSelected(court.id, slot.startTime);
                const key = sel ? 'SELECTED' : slot.status;
                const disabled = slot.status !== 'FREE' || slot.price == null;
                return (
                  <Pressable key={slot.startTime} disabled={disabled}
                    onPress={() => vm.toggle({ courtId: court.id, courtName: court.name, startTime: slot.startTime, price: slot.price! })}
                    style={{ width: 52, height: 40, marginHorizontal: 2, borderRadius: 6, borderWidth: 1, borderColor: C.border,
                      backgroundColor: CELL[key].bg, justifyContent: 'center' }}>
                    <Text style={{ fontSize: 10, textAlign: 'center', color: sel ? '#fff' : C.sub }}>
                      {slot.status === 'FREE' && slot.price ? `${slot.price / 1000}k` : ''}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={{ marginTop: 'auto', paddingTop: 12 }}>
        <Text style={s.sub}>{vm.selected.length} khung giờ · ngày {dateLabel(vm.date)}</Text>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 6 }}>Tổng: {money(vm.total)}</Text>
        <Button title="Đặt sân" onPress={onSubmit} loading={vm.loading} style={{ opacity: vm.selected.length ? 1 : 0.5 }} />
      </View>
    </View>
  );
}
