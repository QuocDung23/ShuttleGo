import { Pressable, ScrollView, View } from "react-native";

import { OwnerText } from "@/components/ui/owner-ui";
import type { AppNotification } from "@/models/notification";

export function NotificationList({
  notifications,
  unreadIds,
  onMarkRead,
}: {
  notifications: AppNotification[];
  unreadIds: Set<string>;
  onMarkRead: (id: string) => void;
}) {
  return (
    <ScrollView>
      {notifications.map((notification) => {
        const unread = unreadIds.has(notification.id);
        return (
          <Pressable
            key={notification.id}
            onPress={() => onMarkRead(notification.id)}
            className={`min-h-[107px] flex-row gap-3 border-b border-divider p-4 ${unread ? "bg-surface" : "bg-background"}`}
          >
            <View className="h-10 w-10 items-center justify-center rounded-full bg-primary-container">
              <OwnerText tone="onPrimaryContainer" className="text-title">
                {notification.isCancellation ? "↶" : "▣"}
              </OwnerText>
            </View>
            <View className="flex-1 gap-[3px]">
              <View className="flex-row items-center justify-between">
                <OwnerText className="font-familjen-semibold text-title-sm">
                  {notification.title}
                </OwnerText>
                {unread && <View className="h-2 w-2 rounded-full bg-primary" />}
              </View>
              <OwnerText tone="muted" className="leading-5">
                {notification.description}
              </OwnerText>
              <OwnerText tone="muted" className="text-caption">
                {notification.ago}
              </OwnerText>
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
