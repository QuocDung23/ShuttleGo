import { Pressable, View } from "react-native";

import { OwnerCard, OwnerChip, OwnerInput, OwnerText } from "@/components/ui/owner-ui";
import type { OpeningHoursDay } from "@/models/venue";

export function OpeningHoursForm({
  days,
  onChange,
}: {
  days: OpeningHoursDay[];
  onChange: (dayOfWeek: number, patch: Partial<OpeningHoursDay>) => void;
}) {
  return (
    <>
      <OwnerText tone="muted">Thiết lập giờ hoạt động của sân</OwnerText>
      {days.map((day) => (
        <OwnerCard key={day.dayOfWeek} className="gap-3">
          <View className="flex-row items-center justify-between">
            <OwnerText className="font-familjen-semibold">{day.label}</OwnerText>
            <Pressable accessibilityRole="button" onPress={() => onChange(day.dayOfWeek, { isOpen: !day.isOpen })}>
              <OwnerChip title={day.isOpen ? "Mở cửa" : "Đóng cửa"} selected={day.isOpen} />
            </Pressable>
          </View>
          {day.isOpen ? (
            <View className="flex-row gap-3">
              <View className="flex-1">
                <OwnerInput
                  label="Mở cửa"
                  value={day.openTime}
                  onChangeText={(text) => onChange(day.dayOfWeek, { openTime: text })}
                  placeholder="06:00"
                  keyboardType="numbers-and-punctuation"
                  autoCorrect={false}
                />
              </View>
              <View className="flex-1">
                <OwnerInput
                  label="Đóng cửa"
                  value={day.closeTime}
                  onChangeText={(text) => onChange(day.dayOfWeek, { closeTime: text })}
                  placeholder="22:00"
                  keyboardType="numbers-and-punctuation"
                  autoCorrect={false}
                />
              </View>
            </View>
          ) : null}
        </OwnerCard>
      ))}
    </>
  );
}
