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

export function useNotificationsFeed() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadIds, setUnreadIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      setLoading(true);
      setError("");
      void notificationRepository
        .list()
        .then((res) => {
          if (!active) return;
          setNotifications(res.data.map(toAppNotification));
          setUnreadIds(new Set(res.data.filter((item) => !item.isRead).map((item) => String(item.id))));
        })
        .catch((e) => {
          if (active) setError(e instanceof Error ? e.message : "Không tải được thông báo.");
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    });

    return () => {
      active = false;
    };
  }, []);

  const markRead = useCallback((id: string) => {
    setUnreadIds((current) => {
      const next = new Set(current);
      next.delete(id);
      return next;
    });
    void notificationRepository.markRead(Number(id)).catch(() => {
      // Revert the optimistic update if the server rejects the change.
      setUnreadIds((current) => new Set(current).add(id));
    });
  }, []);

  const markAllRead = useCallback(() => {
    const previous = unreadIds;
    setUnreadIds(new Set());
    if (!user) return;
    void notificationRepository.markAllRead(user.id).catch(() => {
      setUnreadIds(previous);
    });
  }, [unreadIds, user]);

  return { notifications, unreadIds, markRead, markAllRead, loading, error };
}
