import { useRouter } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { OnboardingVisual } from "@/components/auth/OnboardingVisual";
import { OwnerButton, OwnerText } from "@/components/ui/owner-ui";

export function OnboardingScreen({ final = false }: { final?: boolean }) {
  const router = useRouter();
  return (
    <SafeAreaView className="flex-1 bg-onboarding-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="w-full max-w-[480px] grow self-center px-5 pb-6 pt-2"
      >
        <View className="mb-5 h-12 flex-row items-center justify-between">
          <OwnerText className="font-familjen-bold text-title text-on-onboarding">
            ShuttleGo
          </OwnerText>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.replace("/explore")}
            className="px-2 py-3"
          >
            <OwnerText
              tone="primary"
              className="font-familjen-semibold text-label"
            >
              Bỏ qua
            </OwnerText>
          </Pressable>
        </View>

        <OnboardingVisual final={final} />

        <View className="mt-8 gap-4">
          <OwnerText
            tone="primary"
            className="font-familjen-bold text-headline-lg"
          >
            {final ? "Đặt sân trong vài chạm" : "Tìm sân gần bạn"}
          </OwnerText>
          <OwnerText className="text-body-lg text-on-onboarding/75">
            {final
              ? "Chọn giờ, xác nhận và chờ chủ sân duyệt. Bạn sẽ nhận thông báo ngay khi đơn được xác nhận."
              : "Xem sân quanh khu vực của bạn, giá theo giờ và số sân còn trống tối nay."}
          </OwnerText>
        </View>

        <View className="mt-auto pt-8">
          <View className="mb-7 flex-row justify-center gap-2">
            {[0, 1, 2].map((dot) => {
              const selected = final ? dot === 2 : dot === 0;
              return (
                <View
                  key={dot}
                  className={`h-2 rounded-full ${selected ? "w-7 bg-primary" : "w-2 bg-on-onboarding/30"}`}
                />
              );
            })}
          </View>
          <OwnerButton
            title={final ? "Tạo tài khoản" : "Tiếp tục"}
            onPress={() =>
              router.push(final ? "/register" : "/onboarding-ready")
            }
          />
          {final ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push("/login")}
              className="mt-3 min-h-11 items-center justify-center"
            >
              <OwnerText tone="primary" className="font-familjen-semibold">
                Tôi đã có tài khoản
              </OwnerText>
            </Pressable>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
