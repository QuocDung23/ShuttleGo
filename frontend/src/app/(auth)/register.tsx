import { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';

import { AuthField, InlineLink, RoleToggle } from '@/components/auth/AuthControls';
import { AuthScaffold } from '@/components/auth/AuthScaffold';
import { OwnerButton, OwnerText } from '@/components/ui/owner-ui';
import { registerOwnerAccount } from '@/features/auth/mockSession';

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<'player' | 'owner'>('player');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const handleContinue = () => {
    if (role === 'owner') {
      registerOwnerAccount({
        name: name.trim() || 'Chủ sân mới',
        phone: phone.trim() || '0909 888 999',
        password: password || 'owner123',
      });
      router.push('/owner-setup/venue-info');
    } else {
      router.push('/verify-otp?next=login');
    }
  };

  return (
    <AuthScaffold footer={<OwnerButton title="Tiếp tục" onPress={handleContinue} />}>
      <View className="mb-9 mt-1 items-center">
        <OwnerText className="font-familjen-semibold text-title">Tạo tài khoản</OwnerText>
      </View>
      <OwnerText className="font-familjen-semibold text-title-sm">Bạn dùng ShuttleGo để</OwnerText>
      <View className="mt-5 gap-4">
        <RoleToggle selected={role} onSelect={setRole} />
        <AuthField
          label="Họ và tên"
          icon={{ ios: 'person', android: 'person', web: 'person' }}
          floatingLabel={false}
          value={name}
          onChangeText={setName}
        />
        <AuthField
          label="Số điện thoại"
          icon={{ ios: 'phone', android: 'phone', web: 'phone' }}
          floatingLabel={false}
          helper="Chúng tôi sẽ gửi mã xác thực tới số này."
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
        <AuthField
          label="Mật khẩu"
          floatingLabel={false}
          helper="Tối thiểu 8 ký tự."
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <OwnerText tone="muted" className="px-1 text-center text-caption">
          Bằng việc tiếp tục, bạn đồng ý với <InlineLink>Điều khoản sử dụng</InlineLink>{' '}và{' '}
          <InlineLink>Chính sách bảo mật</InlineLink> của ShuttleGo.
        </OwnerText>
      </View>
    </AuthScaffold>
  );
}
