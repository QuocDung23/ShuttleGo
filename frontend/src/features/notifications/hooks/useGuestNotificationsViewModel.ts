import { useState } from "react";

import type { AppNotification } from "@/models/notification";

const guestNotifications: AppNotification[] = [
  {
    id: "g1",
    title: "Chủ sân đã duyệt đơn của bạn",
    description: "Nhà thi đấu Phú Thọ · T7, 31/10 · 18:00 – 20:00",
    ago: "2 giờ trước",
  },
  {
    id: "g2",
    title: "Sắp đến giờ chơi",
    description:
      "Bạn có lịch tại Nhà thi đấu Phú Thọ lúc 18:00 hôm nay. Hãy đến sớm 10 phút để nhận sân.",
    ago: "3 giờ trước",
  },
  {
    id: "g3",
    title: "Đơn chưa thanh toán",
    description:
      "Đơn tại CLB cầu lông Tân Bình đã được xác nhận. Hãy thanh toán trước giờ chơi.",
    ago: "Hôm qua",
  },
  {
    id: "g4",
    title: "Đơn đã hủy",
    description: "Sân Hoàng Diệu · T3, 20/10 · 06:00 – 07:00",
    ago: "20/10",
    isCancellation: true,
  },
];

export function useGuestNotificationsViewModel() {
  const [unreadIds, setUnreadIds] = useState(
    () => new Set(["g1", "g2"])
  );

  const markRead = (id: string) =>
    setUnreadIds((current) => {
      const next = new Set(current);
      next.delete(id);
      return next;
    });

  return {
    notifications: guestNotifications,
    unreadIds,
    markRead,
    markAllRead: () => setUnreadIds(new Set()),
    unreadCount: unreadIds.size,
  };
}
