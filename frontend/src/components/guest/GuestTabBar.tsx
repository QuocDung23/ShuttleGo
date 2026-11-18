import { useRouter } from "expo-router";
import { SymbolView, type SymbolViewProps } from "expo-symbols";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { OwnerText } from "@/components/ui/owner-ui";
import { colors } from "@/shared/theme";

type GuestTab = "explore" | "bookings" | "profile";

const tabs = [
  {
    key: "explore",
    path: "/explore",
    label: "Khám phá",
    icon: { ios: "safari", android: "explore", web: "explore" },
  },
  {
    key: "bookings",
    path: "/my-bookings",
    label: "Lịch đặt",
    icon: { ios: "calendar", android: "calendar_month", web: "calendar_month" },
  },
  {
    key: "profile",
    path: "/profile",
    label: "Tài khoản",
    icon: { ios: "person", android: "person", web: "person" },
  },
] as const satisfies {
  key: GuestTab;
  path: `/${string}`;
  label: string;
  icon: SymbolViewProps["name"];
}[];

export function GuestTabBar({ active }: { active: GuestTab }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View
      className="border-t border-guest-outline bg-guest-surface"
      style={{ height: 68 + insets.bottom, paddingBottom: insets.bottom }}
    >
      <View className="w-full max-w-[500px] flex-1 flex-row self-center px-3">
        {tabs.map((tab) => {
          const selected = active === tab.key;
          return (
            <Pressable
              key={tab.key}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              onPress={() => router.replace(tab.path)}
              className="h-full pt-5 flex-1 items-center justify-center gap-1"
            >
              <View
                className={`h-8 w-16 items-center justify-center rounded-full ${selected ? "bg-guest-selected" : ""}`}
              >
                <SymbolView
                  name={tab.icon}
                  size={21}
                  tintColor={
                    selected ? colors.guestSelectedInk : colors.guestOnSurfaceVariant
                  }
                />
              </View>
              <OwnerText
                numberOfLines={1}
                className={`text-center text-caption ${selected ? "font-familjen-semibold text-guest-on-surface" : "text-guest-on-surface-variant"}`}
              >
                {tab.label}
              </OwnerText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
