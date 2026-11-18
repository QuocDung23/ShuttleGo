import { useLocalSearchParams, useRouter } from "expo-router";
import { Image } from "expo-image";
import { ScrollView, View } from "react-native";

import { OwnerButton, OwnerText } from "@/components/ui/owner-ui";

function formatPrice(n: number): string {
  return n.toLocaleString("vi-VN").replace(/\./g, ".") + "đ";
}

export default function BookingConfirmPage() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    venue: string;
    day: string;
    time: string;
    court: string;
    hours: string;
    total: string;
  }>();

  const venue = params.venue ?? "Sân cầu lông Kỳ Hòa";
  const day = params.day ?? "CN, 01/11";
  const time = params.time ?? "17:00 – 19:00";
  const court = params.court ?? "Sân 1";
  const hours = params.hours ?? "2";
  const total = params.total ? Number(params.total) : 260000;

  const rows: [string, string][] = [
    ["Sân", venue],
    ["Ngày", day],
    ["Giờ", time],
    ["Số sân", `${court} · ${hours} giờ`],
  ];

  return (
    <ScrollView
      className="flex-1 bg-guest-background"
      contentContainerClassName="gap-5 px-5 pb-8 pt-5"
      showsVerticalScrollIndicator={false}
    >
      {/* ── Title ── */}
      <OwnerText className="font-familjen-bold text-title text-guest-on-surface">
        Xác nhận đặt sân
      </OwnerText>

      {/* ── QR thanh toán ── */}
      <View className="items-center gap-3 rounded-2xl border border-guest-outline bg-guest-surface px-5 py-6">
        <View className="h-56 w-56 items-center justify-center overflow-hidden rounded-2xl bg-white p-2 border border-divider">
          <Image
            source={{
              uri: `https://img.vietqr.io/image/MB-0912345678-compact2.png?amount=${total}&addInfo=DAT%20SAN&accountName=SAN%20CAU%20LONG%20KY%20HOA`,
            }}
            contentFit="contain"
            style={{ width: "100%", height: "100%" }}
          />
        </View>
        <View className="items-center gap-0.5">
          <OwnerText className="font-familjen-semibold text-caption text-guest-on-surface">
            MB Bank · 0912 345 678
          </OwnerText>
          <OwnerText tone="muted" className="text-caption text-guest-on-surface-variant">
            Chủ TK: SÂN CẦU LÔNG KỲ HÒA
          </OwnerText>
          <OwnerText className="mt-1 text-center text-caption text-guest-on-surface-variant">
            Mở app ngân hàng bất kỳ để quét mã thanh toán.
          </OwnerText>
        </View>
      </View>

      {/* ── Booking details ── */}
      <View className="gap-3">
        {rows.map(([label, value]) => (
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

      {/* ── Total ── */}
      <View className="flex-row items-center justify-between border-t border-guest-outline pt-4">
        <OwnerText className="font-familjen-bold text-label text-guest-on-surface">
          Tổng cộng
        </OwnerText>
        <OwnerText className="font-familjen-bold text-title text-guest-on-surface">
          {formatPrice(total)}
        </OwnerText>
      </View>

      {/* ── CTA ── */}
      <OwnerButton
        title="Tôi đã chuyển khoản"
        onPress={() => router.replace("/(guest)/booking/success")}
      />
    </ScrollView>
  );
}
