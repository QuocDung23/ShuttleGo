import { useEffect, useState } from 'react';
import { Image, ScrollView, Text } from 'react-native';
import { Button, Card, StatusBadge, s } from '../components/ui';
import { Booking } from '../models';
import { ScreenProps } from '../navigation/types';
import { bookingService } from '../services/bookingService';
import { dateLabel, money } from '../utils/format';
import { useAsyncAction } from '../utils/useAsync';

/** Thanh toán mô phỏng: hiển thị mã VietQR, người chơi bấm xác nhận đã chuyển khoản. */
export default function PaymentScreen({ route, navigation }: ScreenProps<'Payment'>) {
  const [b, setB] = useState<Booking | null>(null);
  const { loading, run } = useAsyncAction();
  useEffect(() => { run(async () => setB(await bookingService.detail(route.params.bookingId))); }, [route.params.bookingId, run]);
  if (!b) return null;
  return (
    <ScrollView style={s.screen}>
      <Card>
        <Text style={s.h2}>Đơn {b.code}</Text>
        <StatusBadge status={b.status} />
        <Text style={{ marginTop: 6 }}>{b.venueName} · {dateLabel(b.playDate)}</Text>
        {b.slots.map((x) => <Text key={x.id} style={s.sub}>{x.courtName}: {x.startTime}–{x.endTime} · {money(x.price)}</Text>)}
        <Text style={{ fontSize: 20, fontWeight: '700', marginTop: 6 }}>{money(b.totalAmount)}</Text>
      </Card>
      {b.payment.status === 'UNPAID' ? (
        <>
          <Text style={s.sub}>Quét mã để chuyển khoản, nội dung: SHUTTLEGO {b.code}</Text>
          {b.paymentQr && <Image source={{ uri: b.paymentQr }} style={{ width: '100%', height: 320, resizeMode: 'contain', marginVertical: 8 }} />}
          <Button title="Tôi đã chuyển khoản" loading={loading} onPress={() => run(async () => setB(await bookingService.pay(b.id)), 'Đã ghi nhận thanh toán, chờ chủ sân duyệt')} />
        </>
      ) : <Text style={[s.h2, { color: '#16A34A' }]}>✓ Đã thanh toán</Text>}
      <Button title="Xem lịch đặt của tôi" variant="outline" onPress={() => navigation.navigate('Tabs')} />
    </ScrollView>
  );
}
