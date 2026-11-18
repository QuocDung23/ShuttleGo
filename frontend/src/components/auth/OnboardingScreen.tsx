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

const BRAND_ORANGE = '#FF6400';

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
          justifyContent: 'space-between',
        }}
      >
        {/* Top App Bar */}
        <View
          style={{
            height: 56,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingLeft: 20,
            paddingRight: 12,
          }}
        >
          <Text
            style={{
              fontFamily: fontFamilies.bold,
              fontSize: 22,
              lineHeight: 28,
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
                minHeight: 44,
                paddingHorizontal: 14,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontFamily: fontFamilies.semibold,
                  fontSize: 15,
                  lineHeight: 20,
                  color: BRAND_ORANGE,
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
            paddingTop: 20,
            paddingHorizontal: 20,
            gap: 8,
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
              fontSize: 15,
              lineHeight: 22,
              color: colors.onSurfaceVariant,
            }}
          >
            {PAGES[idx].body}
          </Text>
        </View>

        {/* Bottom Pagination & Actions */}
        <View
          style={{
            marginTop: 'auto',
            paddingTop: 16,
            paddingBottom: Math.max(24, insets.bottom + 12),
            gap: 16,
            width: '100%',
            alignItems: 'center',
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
                  backgroundColor: i === idx ? BRAND_ORANGE : colors.divider,
                }}
              />
            ))}
          </View>

          {/* Action Buttons */}
          {!last ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => setIdx(Math.min(2, idx + 1))}
              style={({ pressed }) => [
                {
                  width: '85%',
                  maxWidth: 380,
                  minHeight: 52,
                  borderRadius: 9999,
                  backgroundColor: BRAND_ORANGE,
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingHorizontal: 24,
                  opacity: pressed ? 0.9 : 1,
                  shadowColor: BRAND_ORANGE,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 4,
                },
              ]}
            >
              <Text
                style={{
                  fontFamily: fontFamilies.bold,
                  fontSize: 16,
                  lineHeight: 22,
                  color: '#FFFFFF',
                  letterSpacing: 0.2,
                }}
              >
                Tiếp tục
              </Text>
            </Pressable>
          ) : (
            <View style={{ width: '100%', alignItems: 'center', gap: 10 }}>
              <Pressable
                accessibilityRole="button"
                onPress={() => go('/register')}
                style={({ pressed }) => [
                  {
                    width: '85%',
                    maxWidth: 380,
                    minHeight: 52,
                    borderRadius: 9999,
                    backgroundColor: BRAND_ORANGE,
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingHorizontal: 24,
                    opacity: pressed ? 0.9 : 1,
                    shadowColor: BRAND_ORANGE,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 4,
                  },
                ]}
              >
                <Text
                  style={{
                    fontFamily: fontFamilies.bold,
                    fontSize: 16,
                    lineHeight: 22,
                    color: '#FFFFFF',
                    letterSpacing: 0.2,
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
                    width: '85%',
                    maxWidth: 380,
                    minHeight: 46,
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
                    fontSize: 15,
                    lineHeight: 22,
                    color: BRAND_ORANGE,
                  }}
                >
                  Tôi đã có tài khoản
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
