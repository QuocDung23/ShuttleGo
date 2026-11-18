import { useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, View } from 'react-native';

import { NotificationList } from '@/components/notifications/NotificationList';
import { OwnerHeader, OwnerPage, OwnerText } from '@/components/ui/owner-ui';
import { useNotificationsViewModel } from '@/features/notifications/hooks/useNotificationsViewModel';

export default function NotificationsPage() {
  const router = useRouter();
  const viewModel = useNotificationsViewModel();

  return (
    <OwnerPage scroll={false}>
      <OwnerHeader
        title="Thông báo"
        back
        onBack={() => router.back()}
        right={
          <Pressable
            accessibilityLabel="Đánh dấu tất cả đã đọc"
            onPress={viewModel.markAllRead}
          >
            <OwnerText tone="muted" className="text-title">✓</OwnerText>
          </Pressable>
        }
      />
      {viewModel.loading ? (
        <View className="items-center py-8"><ActivityIndicator /></View>
      ) : viewModel.error ? (
        <OwnerText tone="muted" className="px-4 text-caption">{viewModel.error}</OwnerText>
      ) : viewModel.notifications.length === 0 ? (
        <OwnerText tone="muted" className="px-4 text-caption">Chưa có thông báo nào.</OwnerText>
      ) : (
        <NotificationList
          notifications={viewModel.notifications}
          unreadIds={viewModel.unreadIds}
          onMarkRead={viewModel.markRead}
        />
      )}
    </OwnerPage>
  );
}
