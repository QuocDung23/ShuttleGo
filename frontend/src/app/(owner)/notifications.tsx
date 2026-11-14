import { useRouter } from 'expo-router';
import { Pressable } from 'react-native';

import { NotificationList } from '@/components/notifications/NotificationList';
import { OwnerHeader, OwnerPage, OwnerText } from '@/components/ui/owner-ui';
import { useNotificationsViewModel } from '@/features/notifications/hooks/useNotificationsViewModel';

export default function NotificationsPage() {
  const router = useRouter();
  const viewModel = useNotificationsViewModel();

  return <OwnerPage scroll={false}><OwnerHeader title="Thông báo" back onBack={() => router.back()} right={<Pressable accessibilityLabel="Đánh dấu tất cả đã đọc" onPress={viewModel.markAllRead}><OwnerText tone="muted" className="text-title">✓</OwnerText></Pressable>} /><NotificationList notifications={viewModel.notifications} unreadIds={viewModel.unreadIds} onMarkRead={viewModel.markRead} /></OwnerPage>;
}
