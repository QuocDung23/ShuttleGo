import type { PropsWithChildren, ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type TextProps,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '@/shared/theme';

export const ownerColors = {
  page: colors.background,
  card: colors.surface,
  ink: colors.onSurface,
  muted: colors.onSurfaceVariant,
  border: colors.divider,
  stroke: colors.outline,
  accent: colors.primary,
  accentSoft: colors.primaryContainer,
  accentInk: colors.onPrimaryContainer,
  onAccent: colors.onPrimary,
  shuttle: colors.shuttle,
  blue: colors.slotPendingBackground,
  blueInk: colors.slotPendingForeground,
  green: colors.slotAvailableBackground,
  greenInk: colors.slotAvailableForeground,
  greenOutline: colors.slotAvailableOutline,
  gray: colors.slotBookedBackground,
  container: colors.surfaceContainer,
  containerLow: colors.surfaceContainerLow,
  containerHigh: colors.surfaceContainerHigh,
  error: colors.error,
  scrim: colors.scrim,
};

const textToneClass = {
  default: 'text-on-surface',
  muted: 'text-on-surface-variant',
  primary: 'text-primary',
  onPrimary: 'text-on-primary',
  onPrimaryContainer: 'text-on-primary-container',
  pending: 'text-slot-pending-foreground',
  available: 'text-slot-available-foreground',
} as const;

type OwnerTextTone = keyof typeof textToneClass;

export function OwnerPage({ children, scroll = true }: PropsWithChildren<{ scroll?: boolean }>) {
  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      {scroll ? (
        <ScrollView
          contentContainerClassName="w-full max-w-screen-sm self-center gap-3.5 px-4 pb-[22px] pt-2"
          showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      ) : children}
    </SafeAreaView>
  );
}

export function OwnerText({ className = '', tone = 'default', style, ...props }: TextProps & { className?: string; tone?: OwnerTextTone }) {
  return (
    <Text
      className={`font-familjen ${textToneClass[tone]} ${className}`}
      style={[{ includeFontPadding: false }, style]}
      {...props}
    />
  );
}

export function OwnerHeader({ title, back, right, onBack }: { title: string; back?: boolean; right?: ReactNode; onBack?: () => void }) {
  return (
    <View className="min-h-16 flex-row items-center bg-background px-4">
      {back ? (
        <Pressable accessibilityRole="button" onPress={onBack} className="h-12 w-12 items-center justify-center">
          <OwnerText tone="muted" className="text-[26px]">‹</OwnerText>
        </Pressable>
      ) : <View className="w-12" />}
      <OwnerText className="flex-1 font-familjen-semibold text-title">{title}</OwnerText>
      <View className="h-12 w-12 items-center justify-center">{right}</View>
    </View>
  );
}

export function OwnerCard({ children, className = '' }: PropsWithChildren<{ className?: string }>) {
  return <View className={`gap-3 rounded-3xl border border-divider bg-surface p-4 ${className}`}>{children}</View>;
}

export function OwnerButton({ title, onPress, outline = false, disabled = false, className = '' }: { title: string; onPress?: () => void; outline?: boolean; disabled?: boolean; className?: string }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      className={`min-h-12 items-center justify-center rounded-full px-5 ${disabled ? 'bg-slot-booked-background' : outline ? 'border-2 border-outline bg-surface' : 'bg-primary'} ${className}`}>
      <OwnerText tone={disabled ? 'muted' : outline ? 'primary' : 'onPrimary'} className="font-familjen-semibold">{title}</OwnerText>
    </Pressable>
  );
}

export function OwnerChip({ title, selected = false, onPress }: { title: string; selected?: boolean; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} className="min-h-[34px] items-center justify-center rounded-xl bg-primary-container px-4">
      <OwnerText tone={selected ? 'onPrimaryContainer' : 'default'} className="font-familjen-semibold text-caption">{title}</OwnerText>
    </Pressable>
  );
}

export function OwnerInput({ label, ...props }: TextInputProps & { label: string }) {
  return (
    <View className="min-h-14 justify-center rounded-[10px] border border-outline bg-surface px-3 pt-[7px]">
      <OwnerText tone="muted" className="absolute -top-2 left-3 bg-background px-1 text-caption">{label}</OwnerText>
      <TextInput
        className="py-1 font-familjen text-[15px] text-on-surface"
        placeholderTextColor={ownerColors.muted}
        {...props}
      />
    </View>
  );
}
