import { View } from 'react-native';
import { useRouter } from 'expo-router';

import { AuthField } from '@/components/auth/AuthControls';
import { AuthBackHeader, AuthScaffold, AuthTitle } from '@/components/auth/AuthScaffold';
import { OwnerButton } from '@/components/ui/owner-ui';

export default function ForgotPasswordPage() {
  const router = useRouter();
  return (
    <AuthScaffold footer={<OwnerButton title="Gửi mã xác thực" onPress={() => router.push('/verify-otp?next=reset-password')} />}>
      <AuthBackHeader title="Quên mật khẩu" onBack={() => router.back()} />
      <AuthTitle
        title="Đặt lại mật khẩu"
        description="Nhập số điện thoại bạn đã đăng ký. Chúng tôi sẽ gửi mã xác thực để bạn tạo mật khẩu mới."
      />
      <View className="mt-9">
        <AuthField
          label="Số điện thoại"
          defaultValue="0909 123 456"
        />
      </View>
    </AuthScaffold>
  );
}
