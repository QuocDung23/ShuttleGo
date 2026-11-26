import { View } from "react-native";

import { OwnerCard, OwnerText } from "@/components/ui/owner-ui";
import type { BookingHistoryItem } from "@/models/booking";

export function BookingHistoryCard({
  booking,
}: {
  booking: BookingHistoryItem;
}) {
  const confirmed = booking.status === "Đã xác nhận";
  const cancelled = booking.status === "Đã hủy";
  const cardClass = confirmed
    ? "border-slot-available-outline bg-slot-available-background"
    : cancelled
      ? "border-error/30 bg-error-container"
      : "";
  const badgeBackground = confirmed
    ? "bg-slot-available-background"
    : cancelled || booking.status === "Hết hạn giữ chỗ"
      ? "bg-error-container"
      : booking.status === "Chờ duyệt"
        ? "bg-slot-pending-background"
        : "bg-slot-booked-background";
  const badgeForeground = confirmed
    ? "text-slot-available-foreground"
    : cancelled || booking.status === "Hết hạn giữ chỗ"
      ? "text-error"
      : booking.status === "Chờ duyệt"
        ? "text-slot-pending-foreground"
        : "text-on-surface-variant";
  const statusMark = confirmed ? "✓ " : cancelled ? "× " : "";

  return (
    <OwnerCard className={cardClass}>
      <View className="flex-row items-center justify-between">
        <OwnerText className="font-familjen-semibold">
          {booking.customerName}
        </OwnerText>
        <View className={`rounded-[20px] px-3 py-1 ${badgeBackground}`}>
          <OwnerText
            className={`font-familjen-semibold text-caption ${badgeForeground}`}
          >
            {statusMark}
            {booking.status}
          </OwnerText>
        </View>
      </View>
      <OwnerText tone="muted">{booking.time}</OwnerText>
      <OwnerText tone="muted">{booking.details}</OwnerText>
    </OwnerCard>
  );
}
