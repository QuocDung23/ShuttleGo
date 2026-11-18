import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import React from 'react';
import { Text, View } from 'react-native';

import { colors, fontFamilies } from '@/shared/theme';

export type SlotStatus = 'available' | 'selected' | 'pending' | 'booked';
type IconName = 'bell' | 'check' | 'clock' | 'lock';

const ONBOARDING_COLORS = {
  ...colors,
  inverseOnSurface: '#fdeee5',
  slotAvailableBg: '#e6f4ea',
  slotAvailableInk: '#14532d',
  slotAvailableBorder: '#2e7d4f',
  slotSelectedBg: '#ff8a1f',
  slotSelectedInk: '#2b1200',
  slotPendingBg: '#dce9ff',
  slotPendingInk: '#17407a',
  slotBookedBg: '#e7e3df',
  slotBookedInk: '#5f5a55',
  radiusSm: 8,
  radiusMd: 12,
  radiusLg: 16,
  radiusXl: 24,
  radiusPill: 9999,
};

function OnboardingIcon({
  name,
  size = 20,
  color,
}: {
  name: IconName;
  size?: number;
  color?: string;
}) {
  const symbolMap: Record<IconName, SymbolViewProps['name']> = {
    bell: { ios: 'bell.fill', android: 'notifications', web: 'notifications' },
    check: { ios: 'checkmark', android: 'check', web: 'check' },
    clock: { ios: 'clock', android: 'schedule', web: 'schedule' },
    lock: { ios: 'lock.fill', android: 'lock', web: 'lock' },
  };

  return <SymbolView name={symbolMap[name]} size={size} tintColor={color} />;
}

/** Court card used in Onboarding (Slide 1) */
function CourtCardIllustration() {
  return (
    <View
      style={{
        width: '100%',
        maxWidth: 300,
        backgroundColor: colors.surface,
        borderRadius: ONBOARDING_COLORS.radiusXl,
        borderWidth: 1,
        borderColor: colors.divider,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          aspectRatio: 16 / 7,
          backgroundColor: colors.primaryContainer,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text
          style={{
            fontFamily: fontFamilies.medium,
            fontSize: 12,
            lineHeight: 16,
            color: colors.onPrimaryContainer,
          }}
        >
          Ảnh sân (nhà cung cấp)
        </Text>
      </View>
      <View style={{ padding: 16, gap: 8 }}>
        <Text
          style={{
            fontFamily: fontFamilies.semibold,
            fontSize: 20,
            lineHeight: 26,
            color: colors.onSurface,
          }}
          numberOfLines={2}
        >
          Sân cầu lông Kỳ Hòa
        </Text>
        <Text
          style={{
            fontFamily: fontFamilies.regular,
            fontSize: 14,
            lineHeight: 20,
            color: colors.onSurfaceVariant,
          }}
        >
          Quận 10 · cách bạn 0,8 km
        </Text>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 8,
            marginTop: 8,
          }}
        >
          <Text
            style={{
              fontFamily: fontFamilies.semibold,
              fontSize: 16,
              lineHeight: 22,
              color: colors.onSurface,
              flexShrink: 1,
            }}
          >
            Từ 80.000đ / giờ
          </Text>
          <View
            style={{
              backgroundColor: colors.primaryContainer,
              paddingVertical: 4,
              paddingHorizontal: 12,
              borderRadius: ONBOARDING_COLORS.radiusPill,
            }}
          >
            <Text
              style={{
                fontFamily: fontFamilies.semibold,
                fontSize: 14,
                lineHeight: 20,
                color: colors.onPrimaryContainer,
              }}
              numberOfLines={1}
            >
              4 sân trống
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const SLOT_STATES: Record<
  SlotStatus,
  { bg: string; fg: string; border: string; bw: number; icon?: IconName; sub?: string }
> = {
  available: {
    bg: ONBOARDING_COLORS.slotAvailableBg,
    fg: ONBOARDING_COLORS.slotAvailableInk,
    border: ONBOARDING_COLORS.slotAvailableBorder,
    bw: 1.5,
  },
  selected: {
    bg: ONBOARDING_COLORS.slotSelectedBg,
    fg: ONBOARDING_COLORS.slotSelectedInk,
    border: colors.primary,
    bw: 2,
    icon: 'check',
  },
  pending: {
    bg: ONBOARDING_COLORS.slotPendingBg,
    fg: ONBOARDING_COLORS.slotPendingInk,
    border: 'transparent',
    bw: 1.5,
    icon: 'clock',
    sub: 'Chờ duyệt',
  },
  booked: {
    bg: ONBOARDING_COLORS.slotBookedBg,
    fg: ONBOARDING_COLORS.slotBookedInk,
    border: 'transparent',
    bw: 1.5,
    icon: 'lock',
    sub: 'Đã đặt',
  },
};

function SlotCellItem({
  time,
  price,
  status = 'available',
}: {
  time: string;
  price?: string;
  status?: SlotStatus;
}) {
  const st = SLOT_STATES[status] ?? SLOT_STATES.available;
  return (
    <View
      style={{
        flex: 1,
        minWidth: 0,
        minHeight: 56,
        borderRadius: ONBOARDING_COLORS.radiusMd,
        paddingVertical: 8,
        paddingHorizontal: 4,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        backgroundColor: st.bg,
        borderWidth: st.bw,
        borderColor: st.border,
      }}
    >
      <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center' }}>
        {st.icon ? <OnboardingIcon name={st.icon} size={14} color={st.fg} /> : null}
        <Text
          style={{
            fontFamily: fontFamilies.semibold,
            fontSize: 14,
            lineHeight: 20,
            color: st.fg,
          }}
        >
          {time}
        </Text>
      </View>
      <Text
        style={{
          fontFamily: fontFamilies.medium,
          fontSize: 12,
          lineHeight: 16,
          color: st.fg,
        }}
        numberOfLines={1}
      >
        {st.sub || price || ' '}
      </Text>
    </View>
  );
}

const LEGEND_ITEMS = [
  { label: 'Còn trống', bg: ONBOARDING_COLORS.slotAvailableBg, border: ONBOARDING_COLORS.slotAvailableBorder, bw: 1.5 },
  { label: 'Đang chọn', bg: ONBOARDING_COLORS.slotSelectedBg, border: colors.primary, bw: 2 },
  { label: 'Chờ duyệt', bg: ONBOARDING_COLORS.slotPendingBg, border: 'transparent', bw: 0 },
  { label: 'Đã đặt', bg: ONBOARDING_COLORS.slotBookedBg, border: 'transparent', bw: 0 },
];

function SlotLegendIllustration() {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: 16, rowGap: 8 }}>
      {LEGEND_ITEMS.map((it) => (
        <View key={it.label} style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <View
            style={{
              width: 14,
              height: 14,
              borderRadius: 4,
              backgroundColor: it.bg,
              borderWidth: it.bw,
              borderColor: it.border,
            }}
          />
          <Text
            style={{
              fontFamily: fontFamilies.regular,
              fontSize: 12,
              lineHeight: 16,
              color: colors.onSurfaceVariant,
            }}
          >
            {it.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

/** Schedule preview illustration (Slide 2) */
function SchedulePreviewIllustration() {
  return (
    <View
      style={{
        width: '100%',
        maxWidth: 300,
        backgroundColor: colors.surface,
        borderRadius: ONBOARDING_COLORS.radiusXl,
        padding: 16,
        gap: 12,
      }}
    >
      <Text
        style={{
          fontFamily: fontFamilies.semibold,
          fontSize: 14,
          lineHeight: 20,
          color: colors.onSurface,
        }}
      >
        T7, 31/10 · Sân 2
      </Text>
      <View style={{ gap: 8 }}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <SlotCellItem time="17:00" price="120k" status="booked" />
          <SlotCellItem time="18:00" price="120k" status="selected" />
          <SlotCellItem time="19:00" price="120k" status="selected" />
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <SlotCellItem time="20:00" price="120k" status="pending" />
          <SlotCellItem time="21:00" price="120k" status="available" />
          <SlotCellItem time="22:00" price="120k" status="available" />
        </View>
      </View>
      <SlotLegendIllustration />
    </View>
  );
}

/** Booking confirmed illustration (Slide 3) */
function BookingConfirmedIllustration() {
  return (
    <View style={{ width: '100%', maxWidth: 300, gap: 12 }}>
      <View
        style={{
          backgroundColor: colors.inverseSurface,
          borderRadius: ONBOARDING_COLORS.radiusLg,
          paddingVertical: 14,
          paddingHorizontal: 16,
          flexDirection: 'row',
          gap: 12,
          alignItems: 'center',
        }}
      >
        <OnboardingIcon name="bell" size={24} color={ONBOARDING_COLORS.inverseOnSurface} />
        <Text
          style={{
            fontFamily: fontFamilies.regular,
            fontSize: 14,
            lineHeight: 20,
            color: ONBOARDING_COLORS.inverseOnSurface,
            flex: 1,
          }}
        >
          Chủ sân đã duyệt đơn của bạn
        </Text>
      </View>
      <View
        style={{
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.divider,
          borderRadius: ONBOARDING_COLORS.radiusXl,
          padding: 16,
          gap: 8,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Text
            style={{
              fontFamily: fontFamilies.semibold,
              fontSize: 16,
              lineHeight: 22,
              color: colors.onSurface,
              flex: 1,
            }}
          >
            Sân cầu lông Kỳ Hòa
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              alignSelf: 'flex-start',
              gap: 4,
              minHeight: 28,
              paddingHorizontal: 12,
              borderRadius: ONBOARDING_COLORS.radiusPill,
              backgroundColor: colors.primaryContainer,
              flexShrink: 0,
            }}
          >
            <OnboardingIcon name="check" size={16} color={colors.onPrimaryContainer} />
            <Text
              style={{
                fontFamily: fontFamilies.semibold,
                fontSize: 14,
                lineHeight: 20,
                color: colors.onPrimaryContainer,
              }}
              numberOfLines={1}
            >
              Đã xác nhận
            </Text>
          </View>
        </View>
        <Text
          style={{
            fontFamily: fontFamilies.regular,
            fontSize: 14,
            lineHeight: 20,
            color: colors.onSurfaceVariant,
          }}
        >
          T7, 31/10 · 18:00 – 20:00
        </Text>
        <Text
          style={{
            fontFamily: fontFamilies.regular,
            fontSize: 14,
            lineHeight: 20,
            color: colors.onSurfaceVariant,
          }}
        >
          Sân 2 · 240.000đ
        </Text>
      </View>
    </View>
  );
}

export function OnboardingVisual({ idx = 0, final }: { idx?: number; final?: boolean }) {
  const currentIdx = final ? 2 : idx;
  if (currentIdx === 0) return <CourtCardIllustration />;
  if (currentIdx === 1) return <SchedulePreviewIllustration />;
  return <BookingConfirmedIllustration />;
}
