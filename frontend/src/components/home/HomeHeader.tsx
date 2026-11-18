import { SymbolView } from "expo-symbols";
import { Pressable, View } from "react-native";

import { OwnerText, ownerColors } from "@/components/ui/owner-ui";

export function HomeHeader({
  venueName,
  onOpenNotifications,
}: {
  venueName: string;
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
        accessibilityLabel="Thông báo"
        onPress={onOpenNotifications}
        className="h-12 w-12 items-center justify-center rounded-full"
      >
        <SymbolView
          name={{ ios: "bell", android: "notifications", web: "notifications" }}
          size={22}
          tintColor={ownerColors.ink}
        />
        <View className="absolute right-[9px] top-[9px] h-2 w-2 rounded-full bg-error" />
      </Pressable>
    </View>
  );
}
