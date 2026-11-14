import { View } from 'react-native';
import { useRouter } from 'expo-router';

import { AuthField } from '@/components/auth/AuthControls';
import { AuthBackHeader, AuthScaffold, AuthTitle } from '@/components/auth/AuthScaffold';
import { OwnerButton, OwnerText } from '@/components/ui/owner-ui';

export default function ResetPasswordPage() {
  const router = useRouter();
  return (
    <AuthScaffold footer={<OwnerButton title="Lưu mật khẩu mới" onPress={() => router.replace('/login')} />}>
      <AuthBackHeader title="Tạo mật khẩu mới" onBack={() => router.back()} />
      <AuthTitle
        title="Tạo mật khẩu mới"
        description={<>Số <OwnerText className="font-familjen-semibold">0909 123 456</OwnerText> đã được xác thực.</>}
      />
      <View className="mt-9 gap-4">
        <AuthField
          label="Mật khẩu mới"
          helper="Tối thiểu 8 ký tự."
          floatingLabel={false}
        />
        <AuthField
          label="Nhập lại mật khẩu"
          floatingLabel={false}
        />
      </View>
    </AuthScaffold>
  );
}
