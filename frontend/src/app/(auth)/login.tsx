import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';

import { AuthField, InlineLink, RoleToggle, type AccountRole } from '@/components/auth/AuthControls';
import { AuthScaffold, AuthTitle } from '@/components/auth/AuthScaffold';
import { OwnerButton, OwnerText } from '@/components/ui/owner-ui';

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<AccountRole>('player');
  return (
    <AuthScaffold
      footer={<>
        <OwnerButton title="Đăng nhập" onPress={() => router.replace(role === 'owner' ? '/dashboard' : '/explore')} />
        <Pressable accessibilityRole="button" onPress={() => router.push('/register')} className="min-h-12 flex-row items-center justify-center gap-1">
          <OwnerText tone="muted">Chưa có tài khoản?</OwnerText>
          <InlineLink>Đăng ký</InlineLink>
        </Pressable>
      </>}>
      <View className="mb-10 mt-16">
        <OwnerText tone="primary" className="font-familjen-bold text-title">ShuttleGo</OwnerText>
      </View>
      <AuthTitle
        title="Đăng nhập"
        description="Chào bạn quay lại. Đăng nhập để đặt sân và xem lịch của bạn."
      />
      <View className="mt-8 gap-5">
        <RoleToggle selected={role} onSelect={setRole} />
        <AuthField
          label="Số điện thoại"
          icon={{ ios: 'phone', android: 'phone', web: 'phone' }}
          defaultValue="0909 123 456"
        />
        <AuthField
          label="Mật khẩu"
          icon={{ ios: 'lock', android: 'lock', web: 'lock' }}
          trailingIcon={{ ios: 'eye.slash', android: 'visibility_off', web: 'visibility_off' }}
          defaultValue="password"
          secureTextEntry
        />
        <Pressable accessibilityRole="button" onPress={() => router.push('/forgot-password')} className="self-end px-1 py-1">
          <InlineLink>Quên mật khẩu?</InlineLink>
        </Pressable>
      </View>
    </AuthScaffold>
  );
}
