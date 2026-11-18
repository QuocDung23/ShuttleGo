import { SymbolView } from 'expo-symbols';
import { Image, Pressable, ScrollView, TextInput, View } from 'react-native';
import type { ReactNode } from 'react';

import { OwnerText, ownerColors } from '@/components/ui/owner-ui';
import type { AdminVenue, AdminVenueStatus } from '@/features/admin/adminVenue';

const statusStyle: Record<AdminVenueStatus, { label: string; background: string; foreground: string }> = {
  pending: { label: 'Chờ duyệt', background: 'bg-slot-pending-background', foreground: 'text-slot-pending-foreground' },
  approved: { label: 'Đang hoạt động', background: 'bg-slot-available-background', foreground: 'text-slot-available-foreground' },
  rejected: { label: 'Đã từ chối', background: 'bg-error-container', foreground: 'text-error' },
  suspended: { label: 'Tạm ngưng', background: 'bg-primary-container', foreground: 'text-on-primary-container' },
};

export function AdminStatusBadge({ status }: { status: AdminVenueStatus }) {
  const style = statusStyle[status];
  return (
    <View className={`rounded-full px-3 py-1 ${style.background}`}>
      <OwnerText className={`font-familjen-semibold text-caption ${style.foreground}`}>
        {style.label}
      </OwnerText>
    </View>
  );
}

export function AdminFilterBar<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string; count?: number }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2">
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            className={`min-h-[38px] flex-row items-center justify-center rounded-xl px-4 ${selected ? 'bg-primary-container' : 'border border-divider bg-surface'}`}
          >
            <OwnerText
              className={`font-familjen-semibold text-caption ${selected ? 'text-on-primary-container' : 'text-on-surface-variant'}`}
            >
              {option.label}{option.count === undefined ? '' : ` (${option.count})`}
            </OwnerText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

export function AdminSearchField({
  value,
  onChangeText,
  placeholder,
}: {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
}) {
  return (
    <View className="min-h-12 flex-row items-center gap-3 rounded-2xl bg-surface-container-high px-4">
      <SymbolView
        name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
        size={19}
        tintColor={ownerColors.muted}
      />
      <TextInput
        accessibilityLabel={placeholder}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={ownerColors.muted}
        className="min-h-12 flex-1 font-familjen text-body text-on-surface"
      />
    </View>
  );
}

export function AdminVenueCard({
  venue,
  caption,
  onPress,
}: {
  venue: AdminVenue;
  caption?: string;
  onPress: () => void;
}) {
  const price = venue.priceRules?.length
    ? Math.min(...venue.priceRules.map((rule) => rule.pricePerHour))
    : null;
  const courtsCount = venue.courts?.length ?? 0;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="gap-2 rounded-3xl border border-divider bg-surface p-4 active:bg-surface-container-low"
    >
      <View className="flex-row items-start justify-between gap-2">
        <OwnerText className="flex-1 font-familjen-semibold text-title-sm">{venue.name}</OwnerText>
        <AdminStatusBadge status={venue.status} />
      </View>
      <OwnerText tone="muted">{venue.district} · {venue.city}</OwnerText>
      <OwnerText tone="muted">
        {courtsCount} sân · Chủ sân #{venue.ownerId}{price === null ? '' : ` · Từ ${price.toLocaleString('vi-VN')}đ/giờ`}
      </OwnerText>
      {caption ? <OwnerText tone="muted" className="text-body-sm">{caption}</OwnerText> : null}
    </Pressable>
  );
}

export function AdminEmptyState({ title, body }: { title: string; body: string }) {
  return (
    <View className="items-center gap-2 rounded-3xl bg-surface-container-low px-6 py-8">
      <SymbolView
        name={{ ios: 'building.2', android: 'stadium', web: 'stadium' }}
        size={28}
        tintColor={ownerColors.muted}
      />
      <OwnerText className="font-familjen-semibold text-title-sm">{title}</OwnerText>
      <OwnerText tone="muted" className="text-center">{body}</OwnerText>
    </View>
  );
}

export function AdminKeyValueList({ rows }: { rows: { label: string; value: string }[] }) {
  return (
    <View className="rounded-3xl border border-divider bg-surface px-4">
      {rows.map((row, index) => (
        <View
          key={row.label}
          className={`min-h-12 flex-row items-center justify-between gap-4 py-3 ${index < rows.length - 1 ? 'border-b border-divider' : ''}`}
        >
          <OwnerText tone="muted" className="flex-1">{row.label}</OwnerText>
          <OwnerText className="flex-1 text-right font-familjen-semibold">{row.value}</OwnerText>
        </View>
      ))}
    </View>
  );
}

export function AdminCoverImage({ url, label }: { url: string | null; label: string }) {
  return (
    <View className="overflow-hidden rounded-3xl bg-primary-container" style={{ aspectRatio: 16 / 7 }}>
      {url ? (
        <Image source={{ uri: url }} accessibilityLabel={label} resizeMode="cover" className="h-full w-full" />
      ) : (
        <View className="flex-1 items-center justify-center gap-2">
          <SymbolView
            name={{ ios: 'photo', android: 'image', web: 'image' }}
            size={26}
            tintColor={ownerColors.accentInk}
          />
          <OwnerText tone="onPrimaryContainer" className="text-body-sm">Chưa có ảnh sân</OwnerText>
        </View>
      )}
    </View>
  );
}

export function AdminNotice({ children, error = false }: { children: ReactNode; error?: boolean }) {
  return (
    <View className={`rounded-2xl px-4 py-3 ${error ? 'bg-error-container' : 'bg-surface-container-low'}`}>
      <OwnerText tone={error ? 'primary' : 'muted'} style={error ? { color: ownerColors.error } : undefined}>{children}</OwnerText>
    </View>
  );
}
