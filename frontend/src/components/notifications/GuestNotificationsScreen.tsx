import { useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { OwnerText } from "@/components/ui/owner-ui";
import { useGuestNotificationsViewModel } from "@/features/notifications/hooks/useGuestNotificationsViewModel";
import type { AppNotification } from "@/models/notification";
import { colors } from "@/shared/theme";

export function GuestNotificationsScreen() {
  const router = useRouter();
  const { notifications, unreadIds, markRead, markAllRead } =
    useGuestNotificationsViewModel();

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-guest-background">
      {/* Header */}
      <View className="min-h-16 flex-row items-center px-4">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Quay lại"
          onPress={() => router.back()}
          className="h-12 w-12 items-center justify-center"
        >
          <OwnerText
            className="text-[26px] text-guest-on-surface-variant"
            style={{ lineHeight: 30 }}
          >
            ‹
          </OwnerText>
        </Pressable>
        <OwnerText className="flex-1 font-familjen-semibold text-title text-guest-on-surface">
          Thông báo
        </OwnerText>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Đánh dấu tất cả đã đọc"
          onPress={markAllRead}
          className="h-12 w-12 items-center justify-center"
        >
          <SymbolView
            name={{
              ios: "checkmark",
              android: "done_all",
              web: "done_all",
            }}
            size={20}
            tintColor={colors.guestOnSurfaceVariant}
          />
        </Pressable>
      </View>

      {/* List */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {notifications.map((notification) => (
          <GuestNotificationItem
            key={notification.id}
            notification={notification}
            unread={unreadIds.has(notification.id)}
            onPress={() => markRead(notification.id)}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function GuestNotificationItem({
  notification,
  unread,
  onPress,
}: {
  notification: AppNotification;
  unread: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`min-h-[107px] flex-row gap-3 border-b border-guest-outline p-4 ${
        unread ? "bg-guest-surface" : "bg-guest-background"
      }`}
    >
      {/* Avatar placeholder */}
      <View className="h-10 w-10 items-center justify-center rounded-full bg-guest-selected">
        <OwnerText className="text-title text-guest-selected-ink">
          {notification.isCancellation ? "↶" : "▣"}
        </OwnerText>
      </View>

      {/* Content */}
      <View className="flex-1 gap-[3px]">
        <View className="flex-row items-center justify-between">
          <OwnerText className="flex-1 font-familjen-semibold text-title-sm text-guest-on-surface">
            {notification.title}
          </OwnerText>
          {unread && (
            <View className="ml-2 h-2 w-2 rounded-full bg-primary" />
          )}
        </View>
        <OwnerText className="leading-5 text-guest-on-surface-variant">
          {notification.description}
        </OwnerText>
        <OwnerText className="text-caption text-guest-on-surface-variant">
          {notification.ago}
        </OwnerText>
      </View>
    </Pressable>
  );
}
