import { useNotificationsFeed } from "@/features/notifications/hooks/useNotificationsFeed";

export function useGuestNotificationsViewModel() {
  const { notifications, unreadIds, markRead, markAllRead, loading, error } = useNotificationsFeed();
  return {
    notifications,
    unreadIds,
    markRead,
    markAllRead,
    loading,
    error,
    unreadCount: unreadIds.size,
  };
}
