import { useRouter } from "expo-router";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { OwnerButton, OwnerText } from "@/components/ui/owner-ui";

export default function BookingPaymentPage() {
  const router = useRouter();
  return (
    <SafeAreaView className="flex-1 bg-guest-background">
      <View className="flex-1 justify-between px-5 pb-5 pt-8">
        <View className="items-center gap-4">
          <OwnerText className="font-familjen-bold text-title text-guest-on-surface">
            Thanh toán
          </OwnerText>
          <OwnerText className="text-guest-on-surface-variant">
            Số tiền cần thanh toán
          </OwnerText>
          <OwnerText className="font-familjen-bold text-headline text-guest-on-surface">
            110.000đ
          </OwnerText>
          <OwnerText className="text-center text-guest-on-surface-variant">
            CLB cầu lông Tân Bình · T3, 03/11 · 19:00 – 20:00
          </OwnerText>
          <View className="my-4 h-48 w-48 items-center justify-center rounded-2xl bg-primary-container">
            <OwnerText className="font-familjen-semibold text-guest-on-surface">
              Mã VietQR
            </OwnerText>
          </View>
          <OwnerText className="text-center text-guest-on-surface-variant">
            Quét mã bằng ứng dụng ngân hàng bất kỳ.
          </OwnerText>
        </View>
        <OwnerButton
          title="Tôi đã chuyển khoản"
          onPress={() => router.replace("./success")}
        />
      </View>
    </SafeAreaView>
  );
}
