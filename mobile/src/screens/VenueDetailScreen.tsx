import { useEffect, useState } from 'react';
import { Image, ScrollView, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Button, Card, s } from '../components/ui';
import { VenueDetail } from '../models';
import { ScreenProps } from '../navigation/types';
import { venueService } from '../services/venueService';
import { hhmm, money } from '../utils/format';
import { useAsyncAction } from '../utils/useAsync';

const DAY: Record<string, string> = { WEEKDAY: 'T2–T6', WEEKEND: 'T7–CN', ALL: 'Mọi ngày' };

export default function VenueDetailScreen({ route, navigation }: ScreenProps<'VenueDetail'>) {
  const [v, setV] = useState<VenueDetail | null>(null);
  const { run } = useAsyncAction();
  useEffect(() => { run(async () => setV(await venueService.detail(route.params.venueId))); }, [route.params.venueId, run]);
  if (!v) return null;
  return (
    <ScrollView style={s.screen}>
      {v.images[0] && <Image source={{ uri: v.images[0].url }} style={{ height: 180, borderRadius: 12, marginBottom: 12 }} />}
      <Text style={s.title}>{v.name}</Text>
      <Text style={s.sub}>{v.address}{v.district ? `, ${v.district}` : ''}</Text>
      <Text style={s.sub}>Mở cửa {hhmm(v.openTime)} – {hhmm(v.closeTime)} · {v.courts.filter((c) => c.isActive).length} sân · ★ {v.avgRating ?? '—'}</Text>
      <Text style={s.h2}>Bảng giá</Text>
      <Card>
        {v.priceRules.map((p) => (
          <View key={p.id} style={[s.row, { justifyContent: 'space-between', paddingVertical: 4 }]}>
            <Text>{DAY[p.dayType]} · {hhmm(p.startTime)}–{hhmm(p.endTime)}</Text>
            <Text style={{ fontWeight: '600' }}>{money(p.pricePerSlot)}/giờ</Text>
          </View>
        ))}
      </Card>
      {v.latitude != null && v.longitude != null && (
        <MapView style={{ height: 180, borderRadius: 12, marginBottom: 12 }}
          initialRegion={{ latitude: v.latitude, longitude: v.longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 }}>
          <Marker coordinate={{ latitude: v.latitude, longitude: v.longitude }} title={v.name} />
        </MapView>
      )}
      <Button title="Xem giờ trống & đặt sân" onPress={() => navigation.navigate('BookingGrid', { venueId: v.id, venueName: v.name })} />
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}
