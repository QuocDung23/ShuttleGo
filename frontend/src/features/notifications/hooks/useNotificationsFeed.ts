import { useCallback, useEffect, useState } from "react";

import { notificationRepository } from "@/data/repositories/notificationRepository";
import { useAuth } from "@/features/auth/AuthContext";
import type { AppNotification, ApiNotification } from "@/models/notification";
import { formatRelativeTime } from "@/shared/format";

function toAppNotification(item: ApiNotification): AppNotification {
  return {
    id: String(item.id),
    title: item.title,
    description: item.body,
    ago: formatRelativeTime(item.createdAt),
    isCancellation: item.type.toLowerCase().includes("cancel"),
  };
}

type NotificationsSnapshot = {
  notifications: AppNotification[];
  unreadIds: Set<string>;
};

const notificationsCache = new Map<number, NotificationsSnapshot>();

export function useNotificationsFeed() {
  const { user } = useAuth();
  const cacheKey = user?.id ?? 0;
  const cached = notificationsCache.get(cacheKey);
  const [notifications, setNotifications] = useState<AppNotification[]>(cached?.notifications ?? []);
  const [unreadIds, setUnreadIds] = useState<Set<string>>(() => cached?.unreadIds ?? new Set());
  const [loading, setLoading] = useState(cached === undefined);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      const previous = notificationsCache.get(cacheKey);
      if (previous) {
        setNotifications(previous.notifications);
        setUnreadIds(previous.unreadIds);
      }
      setLoading(previous === undefined);
      setError("");
      void notificationRepository
        .list()
        .then((res) => {
          if (!active) return;
          const next = {
            notifications: res.data.map(toAppNotification),
            unreadIds: new Set(res.data.filter((item) => !item.isRead).map((item) => String(item.id))),
          };
          notificationsCache.set(cacheKey, next);
          setNotifications(next.notifications);
          setUnreadIds(next.unreadIds);
        })
        .catch((e) => {
          if (active && previous === undefined) {
            setError(e instanceof Error ? e.message : "Không tải được thông báo.");
          }
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    });

    return () => {
      active = false;
    };
  }, [cacheKey]);

  const markRead = useCallback((id: string) => {
    setUnreadIds((current) => {
      const next = new Set(current);
      next.delete(id);
      notificationsCache.set(cacheKey, { notifications, unreadIds: next });
      return next;
    });
    void notificationRepository.markRead(Number(id)).catch(() => {
      // Revert the optimistic update if the server rejects the change.
      setUnreadIds((current) => {
        const next = new Set(current).add(id);
        notificationsCache.set(cacheKey, { notifications, unreadIds: next });
        return next;
      });
    });
  }, [cacheKey, notifications]);

  const markAllRead = useCallback(() => {
    const previous = unreadIds;
    setUnreadIds(new Set());
    notificationsCache.set(cacheKey, { notifications, unreadIds: new Set() });
    if (!user) return;
    void notificationRepository.markAllRead(user.id).catch(() => {
      setUnreadIds(previous);
      notificationsCache.set(cacheKey, { notifications, unreadIds: previous });
    });
  }, [cacheKey, notifications, unreadIds, user]);

  return { notifications, unreadIds, markRead, markAllRead, loading, error };
}
