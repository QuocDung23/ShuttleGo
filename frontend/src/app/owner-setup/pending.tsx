import { useRouter } from "expo-router";
import { SymbolView, type SymbolViewProps } from "expo-symbols";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { OwnerButton, OwnerHeader, OwnerText, ownerColors } from "@/components/ui/owner-ui";
import { venueRepository } from "@/data/repositories/venueRepository";
import { useAuth } from "@/features/auth/AuthContext";
import { useOwnerSetup } from "@/features/venue/ownerSetupContext";
import { useOwnerVenueAccess } from "@/features/venue/useOwnerVenueAccess";
import type { OwnerVenueStatusItem } from "@/models/venue";
import { colors } from "@/shared/theme";

type SymbolName = SymbolViewProps["name"];

function statusMeta(status?: string) {
  switch (status) {
    case "pending":
      return {
        label: "Đang chờ duyệt",
        icon: {
          ios: "clock",
          android: "schedule",
          web: "schedule",
        } as SymbolName,
        description:
          "Hồ sơ sân của bạn đang được xét duyệt. Bạn sẽ vào được khu vực quản lý sau khi được duyệt.",
      };
    case "approved":
      return {
        label: "Đã được duyệt",
        icon: {
          ios: "checkmark.circle",
          android: "check_circle",
          web: "check_circle",
        } as SymbolName,
        description: "Hồ sơ đã được duyệt. Bạn có thể vào khu vực quản lý.",
      };
    case "rejected":
      return {
        label: "Bị từ chối",
        icon: {
          ios: "xmark.circle",
          android: "cancel",
          web: "cancel",
        } as SymbolName,
        description:
          "Hồ sơ chưa được duyệt. Vui lòng xem ghi chú và gửi lại hồ sơ để được xét duyệt.",
      };
    case "suspended":
      return {
        label: "Tạm ngưng",
        icon: {
          ios: "pause.circle",
          android: "pause_circle",
          web: "pause_circle",
        } as SymbolName,
        description:
          "Hồ sơ sân đang bị tạm ngưng. Bạn chưa thể sử dụng khu vực quản lý.",
      };
    default:
      return {
        label: "Chưa có hồ sơ",
        icon: {
          ios: "building.2",
          android: "store",
          web: "store",
        } as SymbolName,
        description: "Bạn cần gửi thông tin sân để bắt đầu sử dụng khu vực quản lý.",
      };
  }
}

export default function OwnerSetupPendingPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { createdVenue } = useOwnerSetup();
  const { state, venues, primaryVenue, loading, error, refresh } = useOwnerVenueAccess({
    enabled: user?.role === "owner",
    refreshOnForeground: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState("");

  const backToLogin = () => {
    void logout().then(
      () => router.replace("/login"),
      () => router.replace("/login"),
    );
  };

  const displayVenue: OwnerVenueStatusItem | null = useMemo(() => {
    if (primaryVenue) return primaryVenue;
    if (createdVenue) {
      return {
        id: createdVenue.id,
        name: createdVenue.name,
        status: createdVenue.status,
        reviewNote: createdVenue.reviewNote ?? null,
        reviewedAt: createdVenue.reviewedAt ?? null,
        updatedAt: createdVenue.updatedAt,
      };
    }
    return null;
  }, [createdVenue, primaryVenue]);

  const meta = statusMeta(displayVenue?.status ?? (state === "none" ? undefined : state));

  useEffect(() => {
    if (!user || loading || error) return;
    if (state === "none" && venues.length === 0) {
      router.replace("/owner-setup/venue-info");
      return;
    }
    if (state === "approved" || displayVenue?.status === "approved") {
      router.replace("/(owner)/dashboard");
    }
  }, [displayVenue?.status, error, loading, router, state, user, venues.length]);

  const onResubmit = async () => {
    if (!displayVenue) return;
    setSubmitting(true);
    setActionError("");
    try {
      await venueRepository.resubmit(displayVenue.id);
      await refresh();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Không thể gửi lại hồ sơ. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <OwnerHeader title="Hồ sơ sân" back onBack={backToLogin} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="grow justify-between self-center w-full max-w-[480px] px-6 py-6"
      >
        <View className="items-center gap-6 pt-8">
          <View className="h-20 w-20 items-center justify-center rounded-full bg-primary-container">
            <SymbolView name={meta.icon} size={40} tintColor={ownerColors.accent} />
          </View>

          <View className="items-center gap-2.5">
            <OwnerText className="text-center font-familjen-bold text-headline-lg">
              {displayVenue?.status === "rejected"
                ? "Hồ sơ cần được cập nhật"
                : displayVenue?.status === "suspended"
                  ? "Hồ sơ bị tạm ngưng"
                  : displayVenue?.status === "approved"
                    ? "Hồ sơ đã được duyệt"
                    : "Trạng thái hồ sơ sân"}
            </OwnerText>
            <OwnerText tone="muted" className="text-center text-body-lg leading-6">
              {displayVenue ? (
                <>
                  Sân{" "}
                  <OwnerText className="font-familjen-semibold">{displayVenue.name}</OwnerText>:{" "}
                  {meta.description}
                </>
              ) : loading ? (
                "Đang tải trạng thái hồ sơ..."
              ) : (
                meta.description
              )}
            </OwnerText>
          </View>

          {loading ? (
            <ActivityIndicator color={colors.primary} />
          ) : null}

          {error ? (
            <View className="w-full rounded-xl border border-error/30 bg-error/10 px-3 py-2">
              <OwnerText className="text-error text-body">{error}</OwnerText>
            </View>
          ) : null}

          <View className="w-full gap-3 rounded-3xl border border-divider bg-surface p-5">
            <InfoRow
              icon={{ ios: "person.crop.circle", android: "person", web: "person" }}
              title="Tài khoản chủ sân"
              desc={user?.phone ?? user?.fullName ?? "Đã đăng nhập"}
            />
            <InfoRow
              icon={{ ios: "building.2", android: "store", web: "store" }}
              title="Hồ sơ sân"
              desc={displayVenue ? displayVenue.name : "Chưa có hồ sơ"}
            />
            <InfoRow
              icon={meta.icon}
              title="Trạng thái"
              desc={meta.label}
            />
            {displayVenue?.reviewNote ? (
              <View className="gap-1 rounded-xl bg-surfaceContainerLow p-3">
                <OwnerText className="font-familjen-semibold text-caption">Ghi chú xét duyệt</OwnerText>
                <OwnerText tone="muted" className="text-body">
                  {displayVenue.reviewNote}
                </OwnerText>
              </View>
            ) : null}
          </View>

          {actionError ? (
            <View className="w-full rounded-xl border border-error/30 bg-error/10 px-3 py-2">
              <OwnerText className="text-error text-body">{actionError}</OwnerText>
            </View>
          ) : null}
        </View>

        <View className="mt-8 gap-3">
          {displayVenue?.status === "rejected" ? (
            <OwnerButton
              title={submitting ? "Đang gửi lại..." : "Gửi lại hồ sơ"}
              onPress={() => void onResubmit()}
              disabled={submitting}
            />
          ) : null}

          <OwnerButton
            title={loading ? "Đang kiểm tra..." : "Kiểm tra trạng thái"}
            outline
            onPress={() => void refresh()}
            disabled={loading || submitting}
          />

          <Pressable
            accessibilityRole="button"
            onPress={backToLogin}
            className="min-h-12 items-center justify-center"
          >
            <OwnerText tone="muted" className="font-familjen-semibold text-body-lg">
              Đăng xuất
            </OwnerText>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({
  icon,
  title,
  desc,
}: {
  icon: SymbolName;
  title: string;
  desc: string;
}) {
  return (
    <View className="flex-row items-center gap-3">
      <View className="h-8 w-8 items-center justify-center rounded-full bg-primary-container">
        <SymbolView name={icon} size={18} tintColor={ownerColors.accent} />
      </View>
      <View className="flex-1">
        <OwnerText className="font-familjen-semibold text-caption">{title}</OwnerText>
        <OwnerText tone="muted" className="text-caption">
          {desc}
        </OwnerText>
      </View>
    </View>
  );
}
