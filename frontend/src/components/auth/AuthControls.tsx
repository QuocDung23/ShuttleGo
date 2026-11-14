import { SymbolView, type SymbolViewProps } from "expo-symbols";
import type { ReactNode } from "react";
import { useState } from "react";
import { Pressable, TextInput, View, type TextInputProps } from "react-native";

import { OwnerText, ownerColors } from "@/components/ui/owner-ui";

type SymbolName = SymbolViewProps["name"];

export function AuthField({
  label,
  icon,
  trailingIcon,
  helper,
  floatingLabel = true,
  className = "",
  ...props
}: TextInputProps & {
  label: string;
  icon?: SymbolName;
  trailingIcon?: SymbolName;
  helper?: string;
  floatingLabel?: boolean;
  className?: string;
}) {
  return (
    <View className={`gap-2 ${className}`}>
      <View className="relative mt-2 min-h-[54px] flex-row items-center rounded-[10px] border border-outline bg-surface px-3">
        {floatingLabel ? (
          <OwnerText
            tone="muted"
            className={`absolute -top-2 z-10 bg-background px-1 text-caption ${icon ? "left-[46px]" : "left-4"}`}
          >
            {label}
          </OwnerText>
        ) : null}
        {icon ? (
          <SymbolView name={icon} size={21} tintColor={ownerColors.ink} />
        ) : null}
        <View
          className={`${icon ? "ml-3" : "ml-0 pl-8"} flex-1 justify-center`}
        >
          <TextInput
            className="m-0 min-h-7 p-0 font-familjen text-[16px] leading-6 text-on-surface outline-none"
            placeholderTextColor={ownerColors.muted}
            placeholder={floatingLabel ? undefined : label}
            {...props}
          />
        </View>
        {trailingIcon ? (
          <SymbolView
            name={trailingIcon}
            size={21}
            tintColor={ownerColors.ink}
          />
        ) : null}
      </View>
      {helper ? (
        <OwnerText tone="muted" className="px-1 text-caption">
          {helper}
        </OwnerText>
      ) : null}
    </View>
  );
}

export type AccountRole = "player" | "owner";

export function RoleToggle({
  selected,
  onSelect,
}: {
  selected: AccountRole;
  onSelect: (role: AccountRole) => void;
}) {
  return (
    <View className="gap-3">
      <OwnerText className="font-familjen-semibold text-label">
        Bạn là
      </OwnerText>
      <View className="flex-row gap-3">
        <RoleToggleItem
          active={selected === "player"}
          onPress={() => onSelect("player")}
          title="Người chơi"
          icon={{ ios: "person.fill", android: "person", web: "person" }}
        />
        <RoleToggleItem
          title="Chủ sân"
          active={selected === "owner"}
          onPress={() => onSelect("owner")}
          icon={{ ios: "building.2", android: "stadium", web: "stadium" }}
        />
      </View>
    </View>
  );
}

function RoleToggleItem({
  title,
  icon,
  active = false,
  onPress,
}: {
  title: string;
  icon: SymbolName;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className={`min-h-11 flex-row items-center gap-2 rounded-full border px-4 ${active ? "border-primary bg-primary-container" : "border-outline bg-surface"}`}
    >
      <SymbolView
        name={icon}
        size={18}
        tintColor={active ? ownerColors.accent : ownerColors.muted}
      />
      <OwnerText
        tone={active ? "primary" : "muted"}
        className="font-familjen-semibold text-label"
      >
        {title}
      </OwnerText>
    </Pressable>
  );
}

export function RoleCards() {
  const [selected, setSelected] = useState<"player" | "owner">("player");
  return (
    <View className="flex-row gap-2">
      <RoleCard
        active={selected === "player"}
        onPress={() => setSelected("player")}
        icon={{
          ios: "figure.badminton",
          android: "sports_tennis",
          web: "sports_tennis",
        }}
        title="Đặt sân"
        description="Tìm sân trống và đặt sân cho bạn hoặc nhóm."
      />
      <RoleCard
        active={selected === "owner"}
        onPress={() => setSelected("owner")}
        icon={{ ios: "building.2", android: "stadium", web: "stadium" }}
        title="Quản lý sân"
        description="Nhận đơn, duyệt đơn và quản lý lịch sân."
      />
    </View>
  );
}

function RoleCard({
  active = false,
  icon,
  title,
  description,
  onPress,
}: {
  active?: boolean;
  icon: SymbolName;
  title: string;
  description: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className={`min-h-[116px] flex-1 gap-2.5 rounded-2xl border p-3.5 ${active ? "border-2 border-primary bg-primary-container" : "border-divider bg-surface"}`}
    >
      <View className="flex-row items-start justify-between">
        <SymbolView name={icon} size={23} tintColor={ownerColors.ink} />
        {active ? (
          <SymbolView
            name={{
              ios: "checkmark.circle",
              android: "check_circle",
              web: "check_circle",
            }}
            size={21}
            tintColor={ownerColors.ink}
          />
        ) : null}
      </View>
      <View className="gap-1">
        <OwnerText className="font-familjen-semibold text-title-sm">
          {title}
        </OwnerText>
        <OwnerText tone="muted" className="text-body">
          {description}
        </OwnerText>
      </View>
    </Pressable>
  );
}

export function OtpBoxes({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <View className="relative flex-row justify-between gap-2">
      {Array.from({ length: 6 }).map((_, index) => (
        <View
          key={index}
          className={`h-11 w-11 items-center justify-center rounded-[9px] border bg-surface ${index === Math.min(value.length, 5) ? "border-2 border-primary" : "border-outline"}`}
        >
          <OwnerText className="font-familjen-semibold text-title">
            {value[index] ?? ""}
          </OwnerText>
        </View>
      ))}
      <TextInput
        accessibilityLabel="Mã xác thực gồm 6 chữ số"
        keyboardType="number-pad"
        maxLength={6}
        value={value}
        onChangeText={onChange}
        className="absolute inset-0 opacity-0"
      />
    </View>
  );
}

export function InlineLink({ children }: { children: ReactNode }) {
  return (
    <OwnerText tone="primary" className="font-familjen-semibold">
      {children}
    </OwnerText>
  );
}
