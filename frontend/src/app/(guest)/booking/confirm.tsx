import { useRouter } from "expo-router";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { OwnerButton, OwnerText } from "@/components/ui/owner-ui";

export default function BookingConfirmPage() {
  const router = useRouter();
  return (
    <SafeAreaView className="flex-1 justify-end bg-black/30">
      <View className="gap-5 rounded-t-3xl bg-guest-background px-5 pb-8 pt-7">
        <OwnerText className="font-familjen-bold text-title text-guest-on-surface">
          Xác nhận đặt sân
        </OwnerText>
        <View className="gap-3">
          {[
            ["Sân", "Sân cầu lông Kỳ Hòa"],
            ["Ngày", "CN, 01/11"],
            ["Giờ", "17:00 – 19:00"],
            ["Số sân", "Sân 1 · 2 giờ"],
            ["Tổng cộng", "260.000đ"],
          ].map(([label, value]) => (
            <View key={label} className="flex-row justify-between">
              <OwnerText className="text-guest-on-surface-variant">
                {label}
              </OwnerText>
              <OwnerText className="font-familjen-semibold text-guest-on-surface">
                {value}
              </OwnerText>
            </View>
          ))}
        </View>
        <OwnerText className="font-familjen-semibold text-label text-guest-on-surface">
          Phương thức thanh toán
        </OwnerText>
        <View className="gap-2">
          {["Trả tại sân", "Ví MoMo", "Chuyển khoản QR"].map((method, i) => (
            <View
              key={method}
              className={`rounded-xl border p-3 ${i === 1 ? "border-primary bg-primary-container" : "border-guest-outline bg-guest-surface"}`}
            >
              <OwnerText className="font-familjen-semibold text-guest-on-surface">
                {method}
              </OwnerText>
              <OwnerText className="text-caption text-guest-on-surface-variant">
                {i === 0
                  ? "Thanh toán khi đến chơi"
                  : i === 1
                    ? "Thanh toán ngay qua ví điện tử"
                    : "Quét mã bằng ứng dụng ngân hàng"}
              </OwnerText>
            </View>
          ))}
        </View>
        <OwnerButton
          title="Tiếp tục thanh toán"
          onPress={() => router.push("./payment")}
        />
      </View>
    </SafeAreaView>
  );
}
