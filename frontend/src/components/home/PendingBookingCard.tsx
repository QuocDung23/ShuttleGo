import { View } from "react-native";

import { OwnerButton, OwnerCard, OwnerText } from "@/components/ui/owner-ui";
import type { PendingBooking } from "@/models/booking";

export function PendingBookingCard({
  booking,
  onApprove,
  onReject,
}: {
  booking: PendingBooking;
  onApprove: () => void;
  onReject: () => void;
}) {
  return (
    <OwnerCard>
      <View className="flex-row items-center justify-between">
        <OwnerText className="font-familjen-semibold">
          {booking.customerName}
        </OwnerText>
        <View className="rounded-[20px] bg-slot-pending-background px-3.5 py-[5px]">
          <OwnerText
            tone="pending"
            className="font-familjen-semibold text-caption"
          >
            Chờ duyệt
          </OwnerText>
        </View>
      </View>
      <View className="gap-2 pl-[22px]">
        <OwnerText tone="muted">{booking.time}</OwnerText>
        <OwnerText tone="muted">{booking.details}</OwnerText>
      </View>
      <View className="flex-row justify-end gap-2">
        <OwnerButton
          title="Từ chối"
          outline
          className="min-h-[46px] min-w-[120px]"
          onPress={onReject}
        />
        <OwnerButton
          title="Duyệt"
          className="min-h-[46px] min-w-[120px]"
          onPress={onApprove}
        />
      </View>
    </OwnerCard>
  );
}
