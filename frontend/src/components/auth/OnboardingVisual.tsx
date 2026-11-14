import { Image } from "expo-image";
import { SymbolView } from "expo-symbols";
import { StyleSheet, View } from "react-native";

import { OwnerText, ownerColors } from "@/components/ui/owner-ui";

const courtImage =
  "https://images.unsplash.com/photo-1775993167393-f2add1f8eec2?auto=format&fit=crop&w=1200&q=80";

export function OnboardingVisual({ final = false }: { final?: boolean }) {
  return (
    <View className="relative h-[360px] overflow-hidden rounded-[32px] bg-inverse-surface">
      <Image
        source={courtImage}
        contentFit="cover"
        transition={200}
        blurRadius={24}
        style={StyleSheet.absoluteFill}
      />
      <View className="absolute inset-0 bg-onboarding-background/55" />
      {final ? <FinalBookingPreview /> : <VenuePreview />}
    </View>
  );
}

function VenuePreview() {
  return (
    <View className="absolute inset-x-6 top-1/2 -translate-y-1/2 overflow-hidden rounded-[28px] border border-surface/40 bg-surface/20 p-3">
      <View className="h-[230px] overflow-hidden rounded-[22px]">
        <Image
          source={courtImage}
          contentFit="cover"
          transition={200}
          style={StyleSheet.absoluteFill}
        />
        <View className="absolute inset-x-0 bottom-0 bg-surface/90 px-4 pb-3 pt-4">
          <OwnerText className="font-familjen-bold text-title">
            Sân cầu lông Kỳ Hòa
          </OwnerText>
          <OwnerText tone="muted" className="mt-1 text-body">
            Quận 10 · cách bạn 0,8 km
          </OwnerText>
          <View className="mt-3 flex-row items-center justify-between gap-2">
            <OwnerText className="font-familjen-semibold text-label">
              Từ 80.000đ / giờ
            </OwnerText>
            <View className="rounded-full bg-primary-container px-3 py-1.5">
              <OwnerText
                tone="onPrimaryContainer"
                className="font-familjen-semibold text-caption"
              >
                4 sân trống
              </OwnerText>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

function FinalBookingPreview() {
  return (
    <View className="absolute inset-x-6 top-1/2 -translate-y-1/2 gap-3">
      <View className="flex-row items-center gap-3 rounded-2xl bg-inverse-surface px-4 py-3">
        <SymbolView
          name={{
            ios: "bell.fill",
            android: "notifications",
            web: "notifications",
          }}
          size={20}
          tintColor={ownerColors.shuttle}
        />
        <OwnerText className="font-familjen-semibold text-on-onboarding">
          Chủ sân đã duyệt đơn của bạn
        </OwnerText>
      </View>
      <View className="gap-2 rounded-3xl border border-divider bg-surface p-4">
        <View className="flex-row items-center justify-between gap-2">
          <OwnerText className="flex-1 font-familjen-bold text-title-sm">
            Sân cầu lông Kỳ Hòa
          </OwnerText>
          <View className="rounded-full bg-primary-container px-3 py-1.5">
            <OwnerText
              tone="onPrimaryContainer"
              className="font-familjen-semibold text-caption"
            >
              Đã xác nhận
            </OwnerText>
          </View>
        </View>
        <OwnerText tone="muted" className="text-body">
          T7, 31/10 · 18:00 - 20:00
        </OwnerText>
        <OwnerText className="font-familjen-semibold text-label">
          Sân 2 · 240.000đ
        </OwnerText>
      </View>
    </View>
  );
}
