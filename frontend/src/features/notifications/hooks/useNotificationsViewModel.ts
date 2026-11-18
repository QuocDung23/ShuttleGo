import { useNotificationsFeed } from "@/features/notifications/hooks/useNotificationsFeed";

export function useNotificationsViewModel() {
  const { notifications, unreadIds, markRead, markAllRead, loading, error } = useNotificationsFeed();
  return { notifications, unreadIds, markRead, markAllRead, loading, error };
}
