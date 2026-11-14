import { useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { GuestTabBar } from "@/components/guest/GuestTabBar";
import { OwnerButton, OwnerText } from "@/components/ui/owner-ui";
import { colors } from "@/shared/theme";

export function GuestProfileScreen() {
  const router = useRouter();

  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      className="flex-1 bg-guest-background"
    >
      <View className="w-full max-w-[560px] flex-1 self-center px-4 pb-6 pt-3">
        <OwnerText className="font-familjen-bold text-headline-lg text-guest-on-surface">
          Tài khoản
        </OwnerText>
        <View className="mt-8 items-center gap-4 rounded-3xl border border-guest-outline bg-guest-surface px-5 py-7">
          <View className="h-[76px] w-[76px] items-center justify-center rounded-full bg-guest-selected">
            <SymbolView
              name={{
                ios: "person.crop.circle",
                android: "account_circle",
                web: "account_circle",
              }}
              size={42}
              tintColor={colors.guestSelectedInk}
            />
          </View>
          <View className="items-center gap-1">
            <OwnerText className="font-familjen-semibold text-title text-guest-on-surface">
              Chào mừng bạn
            </OwnerText>
            <OwnerText className="text-center text-body text-guest-on-surface-variant">
              Đăng nhập hoặc tạo tài khoản để quản lý lịch đặt sân.
            </OwnerText>
          </View>
          <View className="mt-2 w-full gap-3">
            <OwnerButton
              title="Đăng nhập"
              onPress={() => router.push("/login")}
            />
            <OwnerButton
              title="Tạo tài khoản"
              outline
              onPress={() => router.push("/register")}
            />
          </View>
        </View>
      </View>
      <GuestTabBar active="profile" />
    </SafeAreaView>
  );
}
