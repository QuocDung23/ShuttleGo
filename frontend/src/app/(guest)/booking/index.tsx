import { useRouter } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { OwnerButton, OwnerText } from "@/components/ui/owner-ui";

const days = ["31/10", "01/11", "02/11", "03/11", "04/11"];
const hours = ["06:00", "07:00", "08:00", "09:00", "17:00", "18:00"];

export default function BookingDetailsPage() {
  const router = useRouter();
  return (
    <SafeAreaView className="flex-1 bg-guest-background">
      <ScrollView contentContainerClassName="gap-6 px-5 pb-6 pt-5">
        <OwnerText className="font-familjen-bold text-title text-guest-on-surface">
          Chi tiết sân · chọn giờ
        </OwnerText>
        <View className="h-32 rounded-2xl bg-guest-selected" />
        <View className="gap-1">
          <OwnerText className="font-familjen-bold text-title text-guest-on-surface">
            Sân cầu lông Kỳ Hòa
          </OwnerText>
          <OwnerText className="text-guest-on-surface-variant">
            238 Bis Ba Tháng Hai, Phường 12, Quận 10
          </OwnerText>
          <OwnerText className="text-guest-on-surface-variant">
            Mở cửa 06:00 – 22:00 · 6 sân
          </OwnerText>
        </View>
        <View className="gap-3">
          <OwnerText className="font-familjen-semibold text-label text-guest-on-surface">
            Chọn ngày
          </OwnerText>
          <View className="flex-row gap-2">
            {days.map((day, i) => (
              <Pressable
                key={day}
                className={`rounded-xl border px-3 py-2 ${i === 1 ? "border-primary bg-primary" : "border-guest-outline bg-guest-surface"}`}
              >
                <OwnerText
                  className={i === 1 ? "text-white" : "text-guest-on-surface"}
                >
                  {day}
                </OwnerText>
              </Pressable>
            ))}
          </View>
        </View>
        <View className="gap-3">
          <OwnerText className="font-familjen-semibold text-label text-guest-on-surface">
            Chọn giờ
          </OwnerText>
          <View className="flex-row flex-wrap gap-2">
            {hours.map((hour, i) => (
              <Pressable
                key={hour}
                className={`w-[30%] items-center rounded-xl border p-3 ${i < 2 ? "border-green-700 bg-green-100" : i < 4 ? "border-guest-outline bg-gray-200" : "border-primary bg-primary-container"}`}
              >
                <OwnerText className="font-familjen-semibold text-guest-on-surface">
                  {hour}
                </OwnerText>
                <OwnerText className="text-caption text-guest-on-surface-variant">
                  {i < 2 ? "90k" : i < 4 ? "Đã đặt" : "130k"}
                </OwnerText>
              </Pressable>
            ))}
          </View>
        </View>
        <View className="flex-row items-center justify-between">
          <OwnerText className="text-guest-on-surface-variant">
            01/11 · Sân 1 · 2 giờ
          </OwnerText>
          <OwnerText className="font-familjen-bold text-title text-guest-on-surface">
            260.000đ
          </OwnerText>
        </View>
        <OwnerButton
          title="Đặt ngay"
          onPress={() => router.push("./confirm")}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
