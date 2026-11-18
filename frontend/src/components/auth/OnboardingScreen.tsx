import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { OnboardingVisual } from '@/components/auth/OnboardingVisual';
import { colors, fontFamilies } from '@/shared/theme';

const PAGES = [
  {
    title: 'Tìm sân gần bạn',
    body: 'Xem sân quanh khu vực của bạn, giá theo giờ và số sân còn trống tối nay.',
  },
  {
    title: 'Xem lịch trống theo giờ',
    body: 'Lịch từng sân luôn được cập nhật. Bạn không cần gọi điện hay nhắn tin để hỏi giờ trống.',
  },
  {
    title: 'Đặt sân trong vài chạm',
    body: 'Chọn giờ, xác nhận và chờ chủ sân duyệt. Bạn sẽ nhận thông báo ngay khi đơn được xác nhận.',
  },
];

export function OnboardingScreen({
  final = false,
  initialStep,
}: {
  final?: boolean;
  initialStep?: number;
}) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [idx, setIdx] = useState(final ? 2 : (initialStep ?? 0));
  const last = idx === 2;

  const go = (href: '/login' | '/register') => {
    if (href === '/register') {
      router.push('/register');
    } else {
      router.replace('/login');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{
        flex: 1,
        backgroundColor: colors.background,
        paddingTop: insets.top,
      }}
    >
      <View
        style={{
          flex: 1,
          width: '100%',
          maxWidth: 480,
          alignSelf: 'center',
        }}
      >
        {/* Top App Bar */}
        <View
          style={{
            height: 56,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingLeft: 16,
            paddingRight: 8,
          }}
        >
          <Text
            style={{
              fontFamily: fontFamilies.semibold,
              fontSize: 20,
              lineHeight: 26,
              color: colors.onSurface,
            }}
          >
            ShuttleGo
          </Text>
          {!last ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => go('/login')}
              style={{
                minHeight: 48,
                paddingHorizontal: 16,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontFamily: fontFamilies.semibold,
                  fontSize: 16,
                  lineHeight: 22,
                  color: colors.primary,
                }}
              >
                Bỏ qua
              </Text>
            </Pressable>
          ) : null}
        </View>

        {/* Central Illustration Container */}
        <View
          style={{
            flex: 1,
            marginHorizontal: 16,
            borderRadius: 24,
            backgroundColor: colors.primaryContainer,
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
            overflow: 'hidden',
            minHeight: 0,
          }}
        >
          <OnboardingVisual idx={idx} />
        </View>

        {/* Text Details */}
        <View
          style={{
            paddingTop: 24,
            paddingHorizontal: 16,
            gap: 8,
            minHeight: 128,
          }}
        >
          <Text
            style={{
              fontFamily: fontFamilies.bold,
              fontSize: 24,
              lineHeight: 30,
              letterSpacing: -0.3,
              color: colors.onSurface,
            }}
          >
            {PAGES[idx].title}
          </Text>
          <Text
            style={{
              fontFamily: fontFamilies.regular,
              fontSize: 16,
              lineHeight: 24,
              color: colors.onSurfaceVariant,
            }}
          >
            {PAGES[idx].body}
          </Text>
        </View>

        {/* Bottom Pagination & Actions */}
        <View
          style={{
            paddingTop: 16,
            paddingHorizontal: 16,
            paddingBottom: Math.max(28, insets.bottom + 12),
            gap: 16,
          }}
        >
          {/* Indicator Dots */}
          <View
            style={{
              flexDirection: 'row',
              gap: 8,
              justifyContent: 'center',
            }}
          >
            {[0, 1, 2].map((i) => (
              <Pressable
                key={i}
                onPress={() => setIdx(i)}
                style={{
                  width: i === idx ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: i === idx ? colors.primary : colors.divider,
                }}
              />
            ))}
          </View>

          {/* Action Buttons */}
          {!last ? (
            <>
              <Pressable
                accessibilityRole="button"
                onPress={() => setIdx(Math.min(2, idx + 1))}
                style={({ pressed }) => [
                  {
                    minHeight: 48,
                    borderRadius: 9999,
                    backgroundColor: colors.primary,
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingHorizontal: 24,
                    opacity: pressed ? 0.9 : 1,
                  },
                ]}
              >
                <Text
                  style={{
                    fontFamily: fontFamilies.semibold,
                    fontSize: 16,
                    lineHeight: 22,
                    color: colors.onPrimary,
                  }}
                >
                  Tiếp tục
                </Text>
              </Pressable>
              <View style={{ height: 48 }} />
            </>
          ) : (
            <>
              <Pressable
                accessibilityRole="button"
                onPress={() => go('/register')}
                style={({ pressed }) => [
                  {
                    minHeight: 48,
                    borderRadius: 9999,
                    backgroundColor: colors.primary,
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingHorizontal: 24,
                    opacity: pressed ? 0.9 : 1,
                  },
                ]}
              >
                <Text
                  style={{
                    fontFamily: fontFamilies.semibold,
                    fontSize: 16,
                    lineHeight: 22,
                    color: colors.onPrimary,
                  }}
                >
                  Tạo tài khoản
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => go('/login')}
                style={({ pressed }) => [
                  {
                    minHeight: 48,
                    borderRadius: 9999,
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingHorizontal: 16,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <Text
                  style={{
                    fontFamily: fontFamilies.semibold,
                    fontSize: 16,
                    lineHeight: 22,
                    color: colors.primary,
                  }}
                >
                  Tôi đã có tài khoản
                </Text>
              </Pressable>
            </>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
