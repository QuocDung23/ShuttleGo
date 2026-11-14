import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";

import { OwnerButton, OwnerText } from "@/components/ui/owner-ui";

const PAYMENT_METHODS = [
  { key: "cash", label: "Trả tại sân", desc: "Thanh toán khi đến chơi" },
  { key: "momo", label: "Ví MoMo", desc: "Thanh toán ngay qua ví điện tử" },
  { key: "qr", label: "Chuyển khoản QR", desc: "Quét mã bằng ứng dụng ngân hàng" },
] as const;

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

  const [selectedPayment, setSelectedPayment] = useState<string>("momo");

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

        {/* ── Payment methods ── */}
        <OwnerText className="font-familjen-semibold text-label text-guest-on-surface">
          Phương thức thanh toán
        </OwnerText>
        <View className="gap-2">
          {PAYMENT_METHODS.map((method) => {
            const active = selectedPayment === method.key;
            return (
              <Pressable
                key={method.key}
                onPress={() => setSelectedPayment(method.key)}
                className={`rounded-xl border p-3 ${
                  active
                    ? "border-primary bg-primary-container"
                    : "border-guest-outline bg-guest-surface"
                }`}
              >
                <OwnerText className="font-familjen-semibold text-guest-on-surface">
                  {method.label}
                </OwnerText>
                <OwnerText className="text-caption text-guest-on-surface-variant">
                  {method.desc}
                </OwnerText>
              </Pressable>
            );
          })}
        </View>

        {/* ── Refund note ── */}
        <OwnerText className="text-caption text-guest-on-surface-variant">
          Nếu chủ sân từ chối đơn, tiền sẽ được hoàn trong 1–3 ngày làm việc.
        </OwnerText>

        {/* ── CTA ── */}
        <OwnerButton
          title="Tiếp tục thanh toán"
          onPress={() => router.push("/(guest)/booking/payment")}
        />
    </ScrollView>
  );
}
