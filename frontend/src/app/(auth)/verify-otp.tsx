import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { OtpBoxes } from '@/components/auth/AuthControls';
import { AuthBackHeader, AuthScaffold, AuthTitle } from '@/components/auth/AuthScaffold';
import { OwnerButton, OwnerText } from '@/components/ui/owner-ui';
import { useOtpViewModel } from '@/features/auth/hooks/useOtpViewModel';

export default function VerifyOtpPage() {
  const router = useRouter();
  const { next } = useLocalSearchParams<{ next?: string }>();
  const { code, isComplete, updateCode } = useOtpViewModel();

  return (
    <AuthScaffold footer={<OwnerButton title="Xác nhận" disabled={!isComplete} onPress={() => router.replace(next === 'reset-password' ? '/reset-password' : '/login')} />}>
      <AuthBackHeader title="Xác thực số điện thoại" onBack={() => router.back()} />
      <AuthTitle
        title="Nhập mã xác thực"
        description={<>Mã gồm 6 số đã được gửi tới <OwnerText className="font-familjen-semibold">0909 123 456</OwnerText>.</>}
      />
      <View className="mt-9 gap-5">
        <OtpBoxes value={code} onChange={updateCode} />
        <OwnerText tone="muted" className="text-center text-label">Gửi lại mã sau 0:40</OwnerText>
      </View>
    </AuthScaffold>
  );
}
