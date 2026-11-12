import { useState } from 'react';

import type { BookingHistoryItem } from '@/models/booking';
import type { RevenueBar, RevenueFilter } from '@/models/revenue';

const bars: RevenueBar[] = [['CN', 48, '390k'], ['T2', 44, '360k'], ['T3', 88, '720k'], ['T4', 44, '360k'], ['T5', 44, '360k'], ['T6', 88, '720k'], ['H.nay', 48, '390k']];
const filters: RevenueFilter[] = ['Tất cả', 'Chờ duyệt', 'Đã xác nhận', 'Hoàn tất'];

const bookings: BookingHistoryItem[] = [
  { id: 'huy', customerName: 'Phạm Gia Huy', time: 'T2, 02/11 · 20:00 – 22:00', details: 'Sân 1 · 240.000đ · Trả tại sân', status: 'Chờ duyệt' },
  { id: 'ha', customerName: 'Lê Thu Hà', time: 'CN, 01/11 · 18:00 – 19:00', details: 'Sân 4 · 130.000đ · Đã thanh toán', status: 'Đã xác nhận' },
  { id: 'bao', customerName: 'Trần Quốc Bảo', time: 'T7, 31/10 · 19:00 – 21:00', details: 'Sân 2 · 260.000đ · Trả tại sân', status: 'Hoàn tất' },
];

export function useRevenueViewModel() {
  const [filter, setFilter] = useState<RevenueFilter>('Tất cả');
  const visibleBookings = bookings.filter((booking) => filter === 'Tất cả' || booking.status === filter);

  return { bars, filters, filter, setFilter, visibleBookings };
}
