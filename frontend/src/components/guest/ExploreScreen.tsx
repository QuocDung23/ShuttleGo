import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { SymbolView, type SymbolViewProps } from "expo-symbols";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { GuestTabBar } from "@/components/guest/GuestTabBar";
import { UnreadNotificationBadge } from "@/components/notifications/UnreadNotificationBadge";
import { OwnerText } from "@/components/ui/owner-ui";
import { venueRepository } from "@/data/repositories/venueRepository";
import { useNotificationsFeed } from "@/features/notifications/hooks/useNotificationsFeed";
import type { Venue } from "@/models/venue";
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

const DEFAULT_VENUE_IMAGE =
  "https://images.unsplash.com/photo-1775993167393-f2add1f8eec2?auto=format&fit=crop&w=1200&q=80";

let exploreVenueCache: Venue[] | null = null;

function normalizeSearch(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .trim();
}

function formatVnd(value: number) {
  return `${value.toLocaleString("vi-VN")}đ`;
}

function getPriceFrom(venue: Venue) {
  const rules = venue.priceRules ?? [];
  if (rules.length === 0) return "Liên hệ";
  const min = Math.min(...rules.map((r) => r.pricePerHour));
  return formatVnd(min);
}

export function ExploreScreen() {
  const router = useRouter();
  const { unreadCount } = useNotificationsFeed();
  const [searchText, setSearchText] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("");
  const [venues, setVenues] = useState<Venue[]>(() => exploreVenueCache ?? []);
  const [loading, setLoading] = useState(exploreVenueCache === null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(exploreVenueCache === null);
        setError("");
        const res = await venueRepository.list({
          status: "approved",
          limit: 100,
        });
        exploreVenueCache = res.data;
        if (!cancelled) setVenues(res.data);
      } catch {
        if (!cancelled && exploreVenueCache === null) {
          setError("Không thể tải danh sách sân. Vui lòng thử lại.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredVenues = useMemo(() => {
    const query = normalizeSearch(searchText);
    if (!query) return venues;
    return venues.filter((venue) =>
      normalizeSearch([venue.name, venue.address, venue.district, venue.city].join(" ")).includes(query),
    );
  }, [searchText, venues]);

  const venueCountLabel = useMemo(() => {
    if (loading) return "Đang tải...";
    return searchText.trim() ? `${filteredVenues.length} kết quả` : `${venues.length} sân`;
  }, [filteredVenues.length, loading, searchText, venues.length]);

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-guest-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="w-full max-w-[560px] self-center gap-5 px-4 pb-5 pt-2"
      >
        <View className="flex-row items-center justify-between">
          <View className="gap-1">
            <OwnerText className="font-familjen-bold text-headline-lg text-guest-on-surface">
              ShuttleGo
            </OwnerText>
          </View>
          <View className="flex-row items-center gap-5">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={unreadCount ? `Thông báo, ${unreadCount} chưa đọc` : "Thông báo"}
              onPress={() => router.push("/notifications")}
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
              <UnreadNotificationBadge count={unreadCount} />
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
            value={searchText}
            onChangeText={setSearchText}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchText.length > 0 && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Xóa tìm kiếm"
              onPress={() => setSearchText("")}
              className="h-8 w-8 items-center justify-center"
            >
              <SymbolView
                name={{ ios: "xmark.circle.fill", android: "cancel", web: "cancel" }}
                size={19}
                tintColor={colors.guestOnSurfaceVariant}
              />
            </Pressable>
          )}
        </View>

        {/* <ScrollView
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
        </ScrollView> */}

        <View className="gap-3">
          <View className="flex-row items-center justify-between">
            <OwnerText className="font-familjen-bold text-title text-guest-on-surface">
              Sân gần bạn
            </OwnerText>
            <OwnerText className="text-caption text-guest-on-surface-variant">
              {venueCountLabel}
            </OwnerText>
          </View>

          {loading ? (
            <View className="items-center py-6">
              <ActivityIndicator color={colors.guestOnSurface} />
            </View>
          ) : error ? (
            <OwnerText className="text-body text-guest-on-surface-variant">
              {error}
            </OwnerText>
          ) : filteredVenues.length === 0 ? (
            <OwnerText className="text-body text-guest-on-surface-variant">
              {searchText.trim() ? "Không tìm thấy sân phù hợp." : "Chưa có sân nào được duyệt."}
            </OwnerText>
          ) : (
            filteredVenues.map((venue) => (
              <Pressable
                key={venue.id}
                accessibilityRole="button"
                accessibilityLabel={`Đặt sân ${venue.name}`}
                onPress={() =>
                  router.push({
                    pathname: "/(guest)/booking",
                    params: { venueId: String(venue.id) },
                  })
                }
              >
                <VenueCard venue={venue} />
              </Pressable>
            ))
          )}
        </View>
      </ScrollView>

      <GuestTabBar active="explore" />
    </SafeAreaView>
  );
}

function VenueCard({ venue }: { venue: Venue }) {
  const image = venue.coverImageUrl || DEFAULT_VENUE_IMAGE;
  const location =
    [venue.district, venue.city].filter(Boolean).join(", ") || venue.address;
  const courtsCount = venue.courts?.length ?? 0;

  return (
    <View className="overflow-hidden rounded-[24px] border border-guest-outline bg-guest-surface">
      <Image
        source={image}
        contentFit="cover"
        style={{ width: "100%", height: 126 }}
      />
      <View className="gap-2 px-3.5 pb-3.5 pt-3">
        <OwnerText className="font-familjen-bold text-title text-guest-on-surface">
          {venue.name}
        </OwnerText>
        <OwnerText className="text-body text-guest-on-surface-variant">
          {location}
        </OwnerText>
        <View className="mt-1 flex-row items-center justify-between gap-3">
          <OwnerText className="font-familjen-semibold text-label text-guest-on-surface">
            Từ {getPriceFrom(venue)} / giờ
          </OwnerText>
          <View className="rounded-full bg-guest-selected px-3 py-1.5">
            <OwnerText className="font-familjen-semibold text-caption text-guest-selected-ink">
              {courtsCount > 0 ? `${courtsCount} sân` : "Sân"}
            </OwnerText>
          </View>
        </View>
      </View>
    </View>
  );
}
