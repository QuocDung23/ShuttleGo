import { View } from "react-native";

import { OwnerCard, OwnerText } from "@/components/ui/owner-ui";
import type { RevenueBar } from "@/models/revenue";

export function RevenueChart({ bars }: { bars: RevenueBar[] }) {
  return (
    <OwnerCard className="gap-0.5 p-4">
      <OwnerText tone="muted" className="text-caption">
        Doanh thu 7 ngày qua
      </OwnerText>
      <OwnerText className="font-familjen-bold text-[26px]">
        3.300.000đ
      </OwnerText>
      <OwnerText tone="muted" className="text-caption">
        18 đơn · 27 giờ đã bán qua ShuttleGo
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
