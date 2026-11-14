import { Pressable, ScrollView, View } from "react-native";

import { OwnerText } from "@/components/ui/owner-ui";
import type { ScheduleCourt } from "@/models/schedule";

export function CourtScheduleGrid({
  courts,
  onOpenBooking,
}: {
  courts: ScheduleCourt[];
  onOpenBooking: () => void;
}) {
  return (
    <ScrollView className="flex-1" contentContainerClassName="pb-3">
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          {courts.map((court) => (
            <View
              key={court.id}
              className="h-16 flex-row items-center gap-2 px-4"
            >
              <OwnerText className="w-14 font-familjen-semibold text-[13px]">
                {court.name}
              </OwnerText>
              {court.slots.map((slot) => (
                <Pressable
                  key={slot.hour}
                  onPress={onOpenBooking}
                  className={`h-14 w-[72px] items-center justify-center gap-[3px] rounded-[14px] ${slot.status === "Chờ duyệt" ? "bg-slot-pending-background" : "bg-slot-booked-background"}`}
                >
                  <OwnerText tone="muted" className="font-familjen-semibold">
                    {slot.hour}
                  </OwnerText>
                  <OwnerText
                    tone="muted"
                    className="font-familjen-semibold text-[11px]"
                  >
                    {slot.status}
                  </OwnerText>
                </Pressable>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </ScrollView>
  );
}
