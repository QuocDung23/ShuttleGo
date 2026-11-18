import { View } from "react-native";

import { OwnerCard, OwnerText } from "@/components/ui/owner-ui";
import type { BookingHistoryItem } from "@/models/booking";

export function BookingHistoryCard({
  booking,
}: {
  booking: BookingHistoryItem;
}) {
  return (
    <OwnerCard>
      <View className="flex-row items-center justify-between">
        <OwnerText className="font-familjen-semibold">
          {booking.customerName}
        </OwnerText>
        <View className="rounded-[20px] bg-slot-pending-background px-3 py-1">
          <OwnerText
            tone="pending"
            className="font-familjen-semibold text-caption"
          >
            {booking.status}
          </OwnerText>
        </View>
      </View>
      <OwnerText tone="muted">{booking.time}</OwnerText>
      <OwnerText tone="muted">{booking.details}</OwnerText>
    </OwnerCard>
  );
}
