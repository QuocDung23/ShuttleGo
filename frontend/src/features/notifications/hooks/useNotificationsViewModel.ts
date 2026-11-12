import { useState } from 'react';

import type { AppNotification } from '@/models/notification';

const notifications: AppNotification[] = [
  { id: '1', title: 'Đơn mới chờ duyệt', description: 'Phạm Gia Huy · Sân 1 · T2, 02/11 · 20:00 – 22:00', ago: '15 phút trước' },
  { id: '2', title: 'Đơn mới chờ duyệt', description: 'Lê Thu Hà · Sân 4 · CN, 01/11 · 18:00 – 19:00 · Đã thanh toán', ago: '1 giờ trước' },
  { id: '3', title: 'Đơn mới chờ duyệt', description: 'Trần Quốc Bảo · Sân 2 · T7, 31/10 · 19:00 – 21:00', ago: '2 giờ trước' },
  { id: '4', title: 'Người chơi đã hủy đơn', description: 'Khung giờ T5, 29/10 · 18:00 – 19:00 tại Sân 3 đã được mở lại.', ago: '2 ngày trước', isCancellation: true },
];

export function useNotificationsViewModel() {
  const [unreadIds, setUnreadIds] = useState(() => new Set(['1', '2', '3']));
  const markRead = (id: string) => setUnreadIds((current) => {
    const next = new Set(current);
    next.delete(id);
    return next;
  });

  return {
    notifications,
    unreadIds,
    markRead,
    markAllRead: () => setUnreadIds(new Set()),
  };
}
