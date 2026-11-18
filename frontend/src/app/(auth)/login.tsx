import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { AuthField, InlineLink } from '@/components/auth/AuthControls';
import { AuthScaffold, AuthTitle } from '@/components/auth/AuthScaffold';
import { OwnerButton, OwnerText } from '@/components/ui/owner-ui';
import { ApiError } from '@/data/api/client';
import { useAuth } from '@/features/auth/AuthContext';
import { normalizePhone } from '@/models/auth';

/**
 * Only an internal booking route is allowed as a post-login return path.
 * Anything else (external URLs, other screens, injected query strings) is
 * ignored so a signed-in player always lands somewhere safe.
 */
function resolveBookingRedirect(value: string | string[] | undefined) {
  if (typeof value !== 'string') return null;
  const match = value.match(/^\/\(guest\)\/booking(?:\?venueId=(\d+))?$/);
  if (!match) return null;
  const venueId = match[1];
  return {
    pathname: '/(guest)/booking' as const,
    ...(venueId ? { params: { venueId } } : {}),
  };
}

export default function LoginPage() {
  const router = useRouter();
  const params = useLocalSearchParams<{ redirect?: string }>();
  const { login } = useAuth();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onLogin = async () => {
    const normalizedPhone = normalizePhone(phone);
    if (!normalizedPhone || !password) {
      setError('Vui lòng nhập số điện thoại và mật khẩu.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const user = await login({ phone: normalizedPhone, password });
      const bookingRedirect = resolveBookingRedirect(params.redirect);
      if (user.role === 'admin') {
        router.replace('/admin/courts');
      } else if (user.role === 'player') {
        router.replace(bookingRedirect ?? '/(guest)/explore');
      } else {
        // Owner: let root/index resolve venue approval gate.
        router.replace('/');
      }
    } catch (e) {
      if (e instanceof ApiError) {
        if (e.status === 401) setError('Số điện thoại/tài khoản hoặc mật khẩu không đúng.');
        else if (e.status === 403) setError(e.message || 'Tài khoản không hoạt động.');
        else if (e.status === 400) setError(e.message || 'Thông tin đăng nhập không hợp lệ.');
        else setError(e.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
      } else {
        setError('Đăng nhập thất bại. Vui lòng thử lại.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthScaffold
      footer={
        <>
          <OwnerButton
            title={submitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
            onPress={() => void onLogin()}
            disabled={submitting}
          />
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/register')}
            className="min-h-12 flex-row items-center justify-center gap-1"
          >
            <OwnerText tone="muted">Chưa có tài khoản?</OwnerText>
            <InlineLink>Đăng ký</InlineLink>
          </Pressable>
        </>
      }
    >
      <View className="mb-10 mt-16">
        <OwnerText tone="primary" className="font-familjen-bold text-title">
          ShuttleGo
        </OwnerText>
      </View>
      <AuthTitle
        title="Đăng nhập"
        description="Chào bạn quay lại. Đăng nhập để đặt sân và xem lịch của bạn."
      />
      <View className="mt-8 gap-5">
        <AuthField
          label="Số điện thoại"
          icon={{ ios: 'phone', android: 'phone', web: 'phone' }}
          value={phone}
          onChangeText={(value) => {
            setPhone(value);
            setError('');
          }}
          keyboardType="default"
          editable={!submitting}
        />
        <AuthField
          label="Mật khẩu"
          icon={{ ios: 'lock', android: 'lock', web: 'lock' }}
          trailingIcon={{ ios: 'eye.slash', android: 'visibility_off', web: 'visibility_off' }}
          value={password}
          onChangeText={(value) => {
            setPassword(value);
            setError('');
          }}
          secureTextEntry
          editable={!submitting}
        />
        {error ? <OwnerText className="text-error">{error}</OwnerText> : null}
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/forgot-password')}
          className="self-end px-1 py-1"
        >
          <InlineLink>Quên mật khẩu?</InlineLink>
        </Pressable>
      </View>
    </AuthScaffold>
  );
}
