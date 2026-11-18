import { useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { GuestTabBar } from "@/components/guest/GuestTabBar";
import { OwnerButton, OwnerText } from "@/components/ui/owner-ui";
import { getMockAccount } from "@/features/auth/mockSession";
import { colors } from "@/shared/theme";

export function GuestBookingsScreen() {
  const router = useRouter();
  const isPlayer = getMockAccount()?.role === "player";

  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      className="flex-1 bg-guest-background"
    >
      <ScrollView
        contentContainerClassName="w-full max-w-[560px] self-center grow px-4 pb-6 pt-3"
        showsVerticalScrollIndicator={false}
      >
        <OwnerText className="font-familjen-bold text-headline-lg text-guest-on-surface">
          Lịch đặt
        </OwnerText>
        <View className="mt-7 flex-1 items-center justify-center gap-4 pb-10">
          <View className="h-[92px] w-[92px] items-center justify-center rounded-full bg-guest-selected">
            <SymbolView
              name={{
                ios: "calendar",
                android: "calendar_month",
                web: "calendar_month",
              }}
              size={42}
              tintColor={colors.guestSelectedInk}
            />
          </View>
          <View className="items-center gap-2">
            <OwnerText className="text-center font-familjen-semibold text-title text-guest-on-surface">
              Chưa có lịch đặt nào
            </OwnerText>
            <OwnerText className="max-w-[300px] text-center text-body text-guest-on-surface-variant">
              {isPlayer
                ? "Các lượt đặt sân của bạn sẽ hiển thị ở đây sau khi xác nhận."
                : "Đăng nhập để quản lý và xem các lượt đặt sân của bạn."}
            </OwnerText>
          </View>
          <View className="mt-2 w-full max-w-[320px] gap-3">
            <OwnerButton
              title="Khám phá sân"
              onPress={() => router.replace("/explore")}
            />
            {!isPlayer ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push("/login")}
                className="min-h-11 items-center justify-center"
              >
                <OwnerText tone="primary" className="font-familjen-semibold">
                  Đăng nhập để xem lịch đặt
                </OwnerText>
              </Pressable>
            ) : null}
          </View>
        </View>
      </ScrollView>
      <GuestTabBar active="bookings" />
    </SafeAreaView>
  );
}
