import { useState } from 'react';
import { Alert, Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { Button, C, Card, Input, s } from '../components/ui';
import { DayType } from '../models';
import { ScreenProps } from '../navigation/types';
import { hhmm, money } from '../utils/format';
import { useVenueFormViewModel } from '../viewmodels/useOwnerVenueViewModel';

/** Màn THÊM / SỬA cơ sở, kèm THÊM / SỬA / XÓA sân con và bảng giá. */
export default function VenueFormScreen({ route }: ScreenProps<'VenueForm'>) {
  const vm = useVenueFormViewModel(route.params?.venueId);
  const [courtName, setCourtName] = useState('');
  const [price, setPrice] = useState({ dayType: 'ALL' as DayType, startTime: '06:00', endTime: '17:00', pricePerSlot: '' });

  return (
    <ScrollView style={s.screen} keyboardShouldPersistTaps="handled">
      <Input label="Tên cơ sở *" value={vm.form.name} onChangeText={(v) => vm.set('name', v)} />
      <Input label="Địa chỉ *" value={vm.form.address} onChangeText={(v) => vm.set('address', v)} />
      <Input label="Quận / huyện" value={vm.form.district ?? ''} onChangeText={(v) => vm.set('district', v)} />
      <Input label="Số điện thoại" value={vm.form.phone ?? ''} onChangeText={(v) => vm.set('phone', v)} keyboardType="phone-pad" />
      <View style={[s.row, { gap: 8 }]}>
        <View style={{ flex: 1 }}><Input label="Giờ mở" value={vm.form.openTime} onChangeText={(v) => vm.set('openTime', v)} /></View>
        <View style={{ flex: 1 }}><Input label="Giờ đóng" value={vm.form.closeTime} onChangeText={(v) => vm.set('closeTime', v)} /></View>
      </View>
      <Text style={s.label}>Tiện ích</Text>
      <View style={[s.row, { flexWrap: 'wrap' }]}>
        {vm.allAmenities.map((a) => {
          const on = vm.form.amenities?.includes(a.code);
          return (
            <Pressable key={a.code} onPress={() => vm.toggleAmenity(a.code)} style={[s.chip, on && { backgroundColor: C.primary, borderColor: C.primary }]}>
              <Text style={{ color: on ? '#fff' : C.text }}>{a.name}</Text>
            </Pressable>
          );
        })}
      </View>
      {vm.isEdit && (
        <View style={[s.row, { justifyContent: 'space-between', marginVertical: 8 }]}>
          <Text>Đang hoạt động</Text>
          <Switch value={vm.form.isActive ?? true} onValueChange={(v) => vm.set('isActive', v)} />
        </View>
      )}
      <Button title={vm.isEdit ? 'Lưu thay đổi' : 'Tạo cơ sở'} onPress={vm.save} loading={vm.loading} />

      {vm.detail && (
        <>
          <Text style={s.h2}>Sân con</Text>
          {vm.detail.courts.map((c) => (
            <Card key={c.id} style={[s.row, { justifyContent: 'space-between' }]}>
              <Pressable onPress={() => Alert.prompt?.('Đổi tên sân', '', (n) => n && vm.renameCourt(c.id, n), 'plain-text', c.name)}>
                <Text style={{ fontWeight: '600', color: c.isActive ? C.text : C.sub }}>{c.name}</Text>
              </Pressable>
              <View style={[s.row, { gap: 8 }]}>
                <Switch value={c.isActive} onValueChange={(v) => vm.toggleCourt(c.id, v)} />
                <Pressable onPress={() => vm.removeCourt(c.id)}><Text style={{ color: C.danger }}>Xóa</Text></Pressable>
              </View>
            </Card>
          ))}
          <View style={[s.row, { gap: 8 }]}>
            <View style={{ flex: 1 }}><Input placeholder="Tên sân mới, vd: Sân 5" value={courtName} onChangeText={setCourtName} /></View>
            <Button title="Thêm" onPress={() => { if (courtName.trim()) { vm.addCourt(courtName.trim()); setCourtName(''); } }} style={{ marginBottom: 12 }} />
          </View>

          <Text style={s.h2}>Bảng giá (mỗi giờ)</Text>
          {vm.detail.priceRules.map((p) => (
            <Card key={p.id} style={[s.row, { justifyContent: 'space-between' }]}>
              <Text>{p.dayType} · {hhmm(p.startTime)}–{hhmm(p.endTime)} · {money(p.pricePerSlot)}</Text>
              <View style={[s.row, { gap: 12 }]}>
                <Pressable onPress={() => vm.updatePrice(p.id, p.pricePerSlot + 10000)}><Text style={{ color: C.primary }}>+10k</Text></Pressable>
                <Pressable onPress={() => vm.removePrice(p.id)}><Text style={{ color: C.danger }}>Xóa</Text></Pressable>
              </View>
            </Card>
          ))}
          <View style={[s.row, { marginBottom: 6 }]}>
            {(['ALL', 'WEEKDAY', 'WEEKEND'] as DayType[]).map((d) => (
              <Pressable key={d} onPress={() => setPrice({ ...price, dayType: d })} style={[s.chip, price.dayType === d && { backgroundColor: C.primary, borderColor: C.primary }]}>
                <Text style={{ color: price.dayType === d ? '#fff' : C.text }}>{d === 'ALL' ? 'Mọi ngày' : d === 'WEEKDAY' ? 'T2–T6' : 'T7–CN'}</Text>
              </Pressable>
            ))}
          </View>
          <View style={[s.row, { gap: 6 }]}>
            <View style={{ flex: 1 }}><Input label="Từ" value={price.startTime} onChangeText={(v) => setPrice({ ...price, startTime: v })} /></View>
            <View style={{ flex: 1 }}><Input label="Đến" value={price.endTime} onChangeText={(v) => setPrice({ ...price, endTime: v })} /></View>
            <View style={{ flex: 1.3 }}><Input label="Giá (đ)" value={price.pricePerSlot} keyboardType="numeric" onChangeText={(v) => setPrice({ ...price, pricePerSlot: v })} /></View>
          </View>
          <Button title="Thêm khung giá" variant="outline"
            onPress={() => vm.addPrice({ ...price, pricePerSlot: Number(price.pricePerSlot) || 0 })} />
        </>
      )}
      <View style={{ height: 60 }} />
    </ScrollView>
  );
}
