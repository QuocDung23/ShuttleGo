import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { Booking, BookingStatus } from '../models';
import { bookingService } from '../services/bookingService';
import { useAsyncAction } from '../utils/useAsync';

export const TABS: { key: string; label: string; status?: BookingStatus[] }[] = [
  { key: 'upcoming', label: 'Sắp tới', status: ['PENDING', 'CONFIRMED'] },
  { key: 'done', label: 'Đã chơi', status: ['COMPLETED'] },
  { key: 'closed', label: 'Đã hủy', status: ['CANCELLED', 'REJECTED'] },
];

/** ViewModel lịch sử đặt sân: xem theo trạng thái, thanh toán, HỦY (sửa trạng thái), XÓA khỏi lịch sử, đánh giá. */
export function useMyBookingsViewModel() {
  const [tab, setTab] = useState(TABS[0].key);
  const [items, setItems] = useState<Booking[]>([]);
  const { loading, run } = useAsyncAction();

  const load = useCallback(() => run(async () => setItems(await bookingService.mine(TABS.find((t) => t.key === tab)!.status))), [tab, run]);
  useEffect(() => { load(); }, [load]);

  const replace = (b: Booking) => setItems((xs) => xs.map((x) => (x.id === b.id ? b : x)));
  const confirm = (title: string, msg: string, fn: () => void) =>
    Alert.alert(title, msg, [{ text: 'Không' }, { text: 'Đồng ý', style: 'destructive', onPress: fn }]);

  return {
    tab, setTab, items, loading, reload: load,
    pay: (b: Booking) => run(async () => replace(await bookingService.pay(b.id)), 'Đã ghi nhận thanh toán'),
    cancel: (b: Booking) => confirm('Hủy đặt sân', `Hủy đơn ${b.code}? Chỉ hủy được trước giờ chơi 12 tiếng.`,
      () => run(async () => { await bookingService.cancel(b.id); load(); }, 'Đã hủy đơn')),
    remove: (b: Booking) => confirm('Xóa đơn', 'Xóa đơn này khỏi lịch sử?',
      () => run(async () => { await bookingService.remove(b.id); setItems((xs) => xs.filter((x) => x.id !== b.id)); })),
    review: (b: Booking, rating: number, comment?: string) =>
      run(async () => { await bookingService.review(b.id, rating, comment); replace({ ...b, reviewed: true }); }, 'Cảm ơn bạn đã đánh giá'),
  };
}
