import { View } from "react-native";

import { OwnerCard, OwnerText } from "@/components/ui/owner-ui";
import type { RevenueBar } from "@/models/revenue";
import { formatMoney } from "@/shared/format";

export function RevenueChart({
  bars,
  totalRevenue = 0,
  bookingCount = 0,
  hoursSold = 0,
}: {
  bars: RevenueBar[];
  totalRevenue?: number;
  bookingCount?: number;
  hoursSold?: number;
}) {
  return (
    <OwnerCard className="gap-0.5 p-4">
      <OwnerText tone="muted" className="text-caption">
        Doanh thu 7 ngày qua
      </OwnerText>
      <OwnerText className="font-familjen-bold text-[26px]">
        {formatMoney(totalRevenue)}
      </OwnerText>
      <OwnerText tone="muted" className="text-caption">
        {bookingCount} đơn · {hoursSold} giờ đã bán qua ShuttleGo
      </OwnerText>
      <View className="mt-5 h-[138px] flex-row items-end justify-between gap-1.5">
        {bars.map(([day, height, amount]) => (
          <View key={day} className="flex-1 items-center justify-end gap-[5px]">
            <OwnerText tone="muted" className="text-[11px]">
              {amount}
            </OwnerText>
            <View
              className={`w-full max-w-9 rounded-lg ${day === "H.nay" ? "bg-primary" : "bg-primary-container"}`}
              style={{ height }}
            />
            <OwnerText className="text-[11px]">{day}</OwnerText>
          </View>
        ))}
      </View>
    </OwnerCard>
  );
}
