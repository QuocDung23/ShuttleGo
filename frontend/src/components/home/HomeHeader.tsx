import { SymbolView } from "expo-symbols";
import { Pressable, View } from "react-native";

import { UnreadNotificationBadge } from "@/components/notifications/UnreadNotificationBadge";
import { OwnerText, ownerColors } from "@/components/ui/owner-ui";

export function HomeHeader({
  venueName,
  notificationCount,
  onOpenNotifications,
}: {
  venueName: string;
  notificationCount: number;
  onOpenNotifications: () => void;
}) {
  return (
    <View className="min-h-[66px] flex-row items-center gap-3">
      <View className="flex-1">
        <OwnerText tone="muted" className="text-caption">
          ⌖ {venueName}
        </OwnerText>
        <OwnerText className="font-familjen-bold text-headline-lg">
          Tổng quan
        </OwnerText>
      </View>
      <Pressable
        accessibilityLabel={notificationCount ? `Thông báo, ${notificationCount} chưa đọc` : "Thông báo"}
        onPress={onOpenNotifications}
        className="relative h-12 w-12 items-center justify-center rounded-full"
      >
        <SymbolView
          name={{ ios: "bell", android: "notifications", web: "notifications" }}
          size={22}
          tintColor={ownerColors.ink}
        />
        <UnreadNotificationBadge count={notificationCount} />
      </Pressable>
    </View>
  );
}
