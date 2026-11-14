import { View } from 'react-native';
import { useRouter } from 'expo-router';

import { AuthField, InlineLink, RoleCards } from '@/components/auth/AuthControls';
import { AuthScaffold } from '@/components/auth/AuthScaffold';
import { OwnerButton, OwnerText } from '@/components/ui/owner-ui';

export default function RegisterPage() {
  const router = useRouter();
  return (
    <AuthScaffold footer={<OwnerButton title="Tiếp tục" onPress={() => router.push('/verify-otp?next=login')} />}>
      <View className="mb-9 mt-1 items-center">
        <OwnerText className="font-familjen-semibold text-title">Tạo tài khoản</OwnerText>
      </View>
      <OwnerText className="font-familjen-semibold text-title-sm">Bạn dùng ShuttleGo để</OwnerText>
      <View className="mt-5 gap-4">
        <RoleCards />
        <AuthField
          label="Họ và tên"
          icon={{ ios: 'person', android: 'person', web: 'person' }}
          floatingLabel={false}
        />
        <AuthField
          label="Số điện thoại"
          icon={{ ios: 'phone', android: 'phone', web: 'phone' }}
          floatingLabel={false}
          helper="Chúng tôi sẽ gửi mã xác thực tới số này."
        />
        <AuthField
          label="Mật khẩu"
          floatingLabel={false}
          helper="Tối thiểu 8 ký tự."
        />
        <OwnerText tone="muted" className="px-1 text-center text-caption">
          Bằng việc tiếp tục, bạn đồng ý với <InlineLink>Điều khoản sử dụng</InlineLink>{' '}và{' '}
          <InlineLink>Chính sách bảo mật</InlineLink> của ShuttleGo.
        </OwnerText>
      </View>
    </AuthScaffold>
  );
}
