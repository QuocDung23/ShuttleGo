import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { SymbolView, type SymbolViewProps } from "expo-symbols";
import { useState } from "react";
import { Pressable, ScrollView, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { GuestTabBar } from "@/components/guest/GuestTabBar";
import { OwnerText } from "@/components/ui/owner-ui";
import { mockCourts } from "@/features/guest/mockCourts";
import { colors } from "@/shared/theme";

const filters: { label: string; icon: SymbolViewProps["name"] }[] = [
  {
    label: "Gần tôi",
    icon: { ios: "location", android: "location_on", web: "location_on" },
  },
  {
    label: "Còn trống tối nay",
    icon: { ios: "moon", android: "dark_mode", web: "dark_mode" },
  },
  {
    label: "Dưới 100k",
    icon: {
      ios: "dollarsign.circle",
      android: "monetization_on",
      web: "monetization_on",
    },
  },
];

export function ExploreScreen() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState("");

  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      className="flex-1 bg-guest-background"
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="w-full max-w-[560px] self-center gap-5 px-4 pb-5 pt-2"
      >
        <View className="flex-row items-center justify-between">
          <View className="gap-1">
            <View className="flex-row items-center gap-1.5">
              <SymbolView
                name={{
                  ios: "mappin.and.ellipse",
                  android: "location_on",
                  web: "location_on",
                }}
                size={15}
                tintColor={colors.guestOnSurfaceVariant}
              />
              <OwnerText className="font-familjen-medium text-caption text-guest-on-surface-variant">
                Quận 10, TP. Hồ Chí Minh
              </OwnerText>
            </View>
            <OwnerText className="font-familjen-bold text-headline-lg text-guest-on-surface">
              ShuttleGo
            </OwnerText>
          </View>
          <View className="flex-row items-center gap-5">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Xem bản đồ"
              className="h-11 w-8 items-center justify-center"
            >
              <SymbolView
                name={{ ios: "map", android: "map", web: "map" }}
                size={25}
                tintColor={colors.guestOnSurface}
              />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Thông báo"
              className="relative h-11 w-8 items-center justify-center"
            >
              <SymbolView
                name={{
                  ios: "bell",
                  android: "notifications",
                  web: "notifications",
                }}
                size={25}
                tintColor={colors.guestOnSurface}
              />
              <View className="absolute right-0 top-1 h-2.5 w-2.5 rounded-full bg-error" />
            </Pressable>
          </View>
        </View>

        <View className="h-11 flex-row items-center gap-3 rounded-full bg-guest-surface px-3.5">
          <SymbolView
            name={{ ios: "magnifyingglass", android: "search", web: "search" }}
            size={23}
            tintColor={colors.guestOnSurfaceVariant}
          />
          <TextInput
            accessibilityLabel="Tìm sân theo tên hoặc khu vực"
            placeholder="Tìm sân theo tên hoặc khu vực"
            placeholderTextColor={colors.guestOnSurfaceVariant}
            className="flex-1 font-familjen text-body-lg text-guest-on-surface"
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-2"
        >
          {filters.map(({ label, icon }) => {
            const selected = selectedFilter === label;
            return (
              <Pressable
                key={label}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => setSelectedFilter(selected ? "" : label)}
                className={`h-10 flex-row items-center gap-2 rounded-xl border px-3 ${selected ? "border-guest-selected bg-guest-selected" : "border-guest-outline bg-transparent"}`}
              >
                <SymbolView
                  name={icon}
                  size={18}
                  tintColor={
                    selected ? colors.guestSelectedInk : colors.guestOnSurface
                  }
                />
                <OwnerText
                  className={`font-familjen-semibold text-label ${selected ? "text-guest-selected-ink" : "text-guest-on-surface"}`}
                >
                  {label}
                </OwnerText>
              </Pressable>
            );
          })}
        </ScrollView>

        <View className="gap-3">
          <View className="flex-row items-center justify-between">
            <OwnerText className="font-familjen-bold text-title text-guest-on-surface">
              Sân gần bạn
            </OwnerText>
            <OwnerText className="text-caption text-guest-on-surface-variant">
              {mockCourts.length} sân
            </OwnerText>
          </View>
          {mockCourts.map((court) => (
            <Pressable
              key={court.id}
              accessibilityRole="button"
              accessibilityLabel={`Đặt sân ${court.name}`}
              onPress={() => router.push("./booking")}
            >
              <VenueCard court={court} />
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <GuestTabBar active="explore" />
    </SafeAreaView>
  );
}

function VenueCard({ court }: { court: (typeof mockCourts)[number] }) {
  return (
    <View className="overflow-hidden rounded-[24px] border border-guest-outline bg-guest-surface">
      <Image
        source={court.image}
        contentFit="cover"
        style={{ width: "100%", height: 126 }}
      />
      <View className="gap-2 px-3.5 pb-3.5 pt-3">
        <OwnerText className="font-familjen-bold text-title text-guest-on-surface">
          {court.name}
        </OwnerText>
        <OwnerText className="text-body text-guest-on-surface-variant">
          {court.distance}
        </OwnerText>
        <View className="mt-1 flex-row items-center justify-between gap-3">
          <OwnerText className="font-familjen-semibold text-label text-guest-on-surface">
            Từ {court.priceFrom} / giờ
          </OwnerText>
          <View className="rounded-full bg-guest-selected px-3 py-1.5">
            <OwnerText className="font-familjen-semibold text-caption text-guest-selected-ink">
              {court.availableCourts} sân trống
            </OwnerText>
          </View>
        </View>
      </View>
    </View>
  );
}
