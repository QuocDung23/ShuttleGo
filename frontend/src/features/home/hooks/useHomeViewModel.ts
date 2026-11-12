import { useState } from 'react';

import type { PendingBooking } from '@/models/booking';

const initialBookings: PendingBooking[] = [
  { id: 'bao', customerName: 'Trần Quốc Bảo', time: 'T7, 31/10 · 19:00 – 21:00', details: 'Sân 2 · 260.000đ · Trả tại sân' },
  { id: 'ha', customerName: 'Lê Thu Hà', time: 'CN, 01/11 · 18:00 – 19:00', details: 'Sân 4 · 130.000đ · Đã thanh toán' },
  { id: 'huy', customerName: 'Phạm Gia Huy', time: 'T2, 02/11 · 20:00 – 22:00', details: 'Sân 1 · 240.000đ · Trả tại sân' },
];

export function useHomeViewModel() {
  const [pendingBookings, setPendingBookings] = useState(initialBookings);
  const resolveBooking = (id: string) => setPendingBookings((current) => current.filter((booking) => booking.id !== id));

  return {
    venueName: 'Sân cầu lông Kỳ Hòa',
    occupancyLabel: '49/96 giờ',
    pendingBookings,
    resolveBooking,
  };
}
