import { Pressable, ScrollView } from "react-native";

import { OwnerText } from "@/components/ui/owner-ui";
import type { ScheduleDate } from "@/models/schedule";

export function DateSelector({
  dates,
  selectedIndex,
  onSelect,
}: {
  dates: ScheduleDate[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="gap-2 px-4 pb-4"
    >
      {dates.map((date, index) => {
        const selected = index === selectedIndex;
        return (
          <Pressable
            key={date.label}
            onPress={() => onSelect(index)}
            className={`h-14 items-center justify-center gap-0.5 rounded-2xl border ${selected ? "w-[66px] border-primary bg-primary" : "w-16 border-outline bg-surface"}`}
          >
            <OwnerText
              tone={selected ? "onPrimary" : "default"}
              className="font-familjen-medium text-caption"
            >
              {date.day}
            </OwnerText>
            <OwnerText
              tone={selected ? "onPrimary" : "default"}
              className="font-familjen-semibold text-title-sm"
            >
              {date.label}
            </OwnerText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
