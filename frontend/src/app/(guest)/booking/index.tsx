import { useRouter } from "expo-router";
import { useState, useMemo } from "react";
import { Pressable, ScrollView, View, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { OwnerButton, OwnerText } from "@/components/ui/owner-ui";

/* ── helpers ── */
function buildDays(count = 7): { label: string; sub: string; date: Date }[] {
  const result: { label: string; sub: string; date: Date }[] = [];
  const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  const today = new Date();

  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    result.push({
      label: i === 0 ? "Hôm nay" : dayNames[d.getDay()],
      sub: `${dd}/${mm}`,
      date: d,
    });
  }
  return result;
}

const COURTS = ["Sân 1", "Sân 2", "Sân 3", "Sân 4", "Sân 5", "Sân 6"];
const PEAK_FROM = 17;

type SlotStatus = "available" | "booked" | "peak";

interface TimeSlot {
  hour: string;
  price: number;
  status: SlotStatus;
}

function buildSlots(): TimeSlot[] {
  const slots: TimeSlot[] = [];
  for (let h = 6; h <= 21; h++) {
    const hour = `${String(h).padStart(2, "0")}:00`;
    // Mock: 08:00 & 09:00 are booked; >= 17:00 is peak
    const booked = h === 8 || h === 9;
    const peak = h >= PEAK_FROM;
    slots.push({
      hour,
      price: peak ? 130000 : 90000,
      status: booked ? "booked" : peak ? "peak" : "available",
    });
  }
  return slots;
}

function formatPrice(n: number): string {
  return n.toLocaleString("vi-VN").replace(/\./g, ".") + "đ";
}

/* ── main component ── */
export default function BookingDetailsPage() {
  const router = useRouter();
  const days = useMemo(() => buildDays(7), []);
  const slots = useMemo(() => buildSlots(), []);

  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedCourt, setSelectedCourt] = useState(0);
  const [selectedSlots, setSelectedSlots] = useState<number[]>([]);

  const toggleSlot = (index: number) => {
    if (slots[index].status === "booked") return;
    setSelectedSlots((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const sortedSelected = [...selectedSlots].sort((a, b) => a - b);

  const totalPrice = sortedSelected.reduce(
    (sum, i) => sum + slots[i].price,
    0
  );

  const timeRange =
    sortedSelected.length > 0
      ? `${slots[sortedSelected[0]].hour} – ${
          Number(slots[sortedSelected[sortedSelected.length - 1]].hour.split(":")[0]) + 1
        }:00`
      : "";

  const dayLabel = days[selectedDay];
  const summary = `${dayLabel.label === "Hôm nay" ? dayLabel.sub : `${dayLabel.label}, ${dayLabel.sub}`} · ${COURTS[selectedCourt]} · ${sortedSelected.length} giờ`;

  return (
    <SafeAreaView className="flex-1 bg-guest-background">
      {/* ── Back button ── */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Quay lại"
        onPress={() => router.back()}
        className="ml-2 mt-1 h-11 w-11 items-center justify-center rounded-full"
      >
        <OwnerText className="text-[26px] text-guest-on-surface-variant">
          ‹
        </OwnerText>
      </Pressable>

      <ScrollView
        contentContainerClassName="gap-6 px-5 pb-6 pt-2"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Venue card ── */}
        <View className="overflow-hidden rounded-2xl bg-guest-surface">
          <OwnerText className="px-4 pt-4 font-familjen-bold text-title text-guest-on-surface">
            Sân cầu lông Kỳ Hòa
          </OwnerText>
          <View className="mx-4 mt-3 mb-4 h-40 overflow-hidden rounded-2xl bg-guest-selected">
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1775993167393-f2add1f8eec2?auto=format&fit=crop&w=1200&q=80",
              }}
              className="h-full w-full"
              resizeMode="cover"
            />
          </View>
        </View>

        {/* ── Venue info ── */}
        <View className="gap-1">
          <OwnerText className="font-familjen-bold text-title text-guest-on-surface">
            Sân cầu lông Kỳ Hòa
          </OwnerText>
          <OwnerText className="text-body text-guest-on-surface-variant">
            238 Bis Ba Tháng Hai, Phường 12, Quận 10
          </OwnerText>
          <OwnerText className="text-body text-guest-on-surface-variant">
            Mở cửa 06:00 – 22:00 · 6 sân
          </OwnerText>
        </View>

        {/* ── Chọn ngày ── */}
        <View className="gap-3">
          <OwnerText className="font-familjen-semibold text-label text-guest-on-surface">
            Chọn ngày
          </OwnerText>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="gap-2"
          >
            {days.map((day, i) => {
              const active = i === selectedDay;
              return (
                <Pressable
                  key={day.sub}
                  onPress={() => {
                    setSelectedDay(i);
                    setSelectedSlots([]);
                  }}
                  className={`min-w-[72px] items-center rounded-xl border px-3 py-2 ${
                    active
                      ? "border-primary bg-primary"
                      : "border-guest-outline bg-guest-surface"
                  }`}
                >
                  <OwnerText
                    className={`text-caption font-familjen-medium ${
                      active ? "text-on-primary" : "text-guest-on-surface-variant"
                    }`}
                  >
                    {day.label}
                  </OwnerText>
                  <OwnerText
                    className={`font-familjen-semibold text-label ${
                      active ? "text-on-primary" : "text-guest-on-surface"
                    }`}
                  >
                    {day.sub}
                  </OwnerText>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* ── Chọn sân ── */}
        <View className="gap-3">
          <OwnerText className="font-familjen-semibold text-label text-guest-on-surface">
            Chọn sân
          </OwnerText>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="gap-2"
          >
            {COURTS.map((court, i) => {
              const active = i === selectedCourt;
              return (
                <Pressable
                  key={court}
                  onPress={() => {
                    setSelectedCourt(i);
                    setSelectedSlots([]);
                  }}
                  className={`min-w-[72px] items-center rounded-xl border px-4 py-2 ${
                    active
                      ? "border-shuttle bg-shuttle/15"
                      : "border-guest-outline bg-guest-surface"
                  }`}
                >
                  <OwnerText
                    className={`font-familjen-semibold text-label ${
                      active ? "text-shuttle" : "text-guest-on-surface"
                    }`}
                  >
                    {court}
                  </OwnerText>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* ── Chọn giờ ── */}
        <View className="gap-3">
          <View className="flex-row items-center justify-between">
            <OwnerText className="font-familjen-semibold text-label text-guest-on-surface">
              Chọn giờ
            </OwnerText>
            <OwnerText className="text-caption text-guest-on-surface-variant">
              Giờ cao điểm từ {PEAK_FROM}:00
            </OwnerText>
          </View>
          <View className="flex-row flex-wrap gap-2">
            {slots.map((slot, i) => {
              const isSelected = selectedSlots.includes(i);
              const isBooked = slot.status === "booked";

              let bgClass: string;
              let borderClass: string;
              let textClass: string;
              let subTextClass: string;

              if (isSelected) {
                bgClass = "bg-slot-selected-background";
                borderClass = "border-shuttle";
                textClass = "text-on-primary";
                subTextClass = "text-on-primary/80";
              } else if (isBooked) {
                bgClass = "bg-slot-booked-background";
                borderClass = "border-guest-outline";
                textClass = "text-guest-on-surface-variant";
                subTextClass = "text-guest-on-surface-variant";
              } else {
                bgClass = "bg-slot-available-background";
                borderClass = "border-slot-available-outline";
                textClass = "text-slot-available-foreground";
                subTextClass = "text-slot-available-foreground";
              }

              return (
                <Pressable
                  key={slot.hour}
                  onPress={() => toggleSlot(i)}
                  disabled={isBooked}
                  className={`w-[23%] items-center rounded-xl border p-2.5 ${bgClass} ${borderClass}`}
                >
                  <OwnerText className={`font-familjen-semibold text-label ${textClass}`}>
                    {slot.hour}
                  </OwnerText>
                  <OwnerText className={`text-caption ${subTextClass}`}>
                    {isBooked
                      ? "Đã đặt"
                      : `${(slot.price / 1000).toFixed(0)}k`}
                  </OwnerText>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* ── Bottom bar (sticky) ── */}
      <View className="border-t border-guest-outline bg-guest-surface px-5 pb-5 pt-3">
        <View className="mb-3 flex-row items-center justify-between">
          <View>
            <OwnerText className="text-body text-guest-on-surface-variant">
              {sortedSelected.length > 0 ? summary : "Chưa chọn giờ"}
            </OwnerText>
            {sortedSelected.length > 0 && (
              <OwnerText className="text-body text-guest-on-surface-variant">
                {timeRange}
              </OwnerText>
            )}
          </View>
          <OwnerText className="font-familjen-bold text-title text-guest-on-surface">
            {sortedSelected.length > 0 ? formatPrice(totalPrice) : "0đ"}
          </OwnerText>
        </View>
        <OwnerButton
          title="Đặt ngay"
          disabled={sortedSelected.length === 0}
          onPress={() =>
            router.push({
              pathname: "/(guest)/booking/confirm",
              params: {
                venue: "Sân cầu lông Kỳ Hòa",
                day:
                  dayLabel.label === "Hôm nay"
                    ? dayLabel.sub
                    : `${dayLabel.label}, ${dayLabel.sub}`,
                time: timeRange,
                court: COURTS[selectedCourt],
                hours: String(sortedSelected.length),
                total: String(totalPrice),
              },
            })
          }
        />
      </View>
    </SafeAreaView>
  );
}
