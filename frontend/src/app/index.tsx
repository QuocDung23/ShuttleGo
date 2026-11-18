import { Redirect } from 'expo-router';
import { ActivityIndicator, Pressable, View } from 'react-native';

import { OnboardingScreen } from '@/components/auth/OnboardingScreen';
import { OwnerText } from '@/components/ui/owner-ui';
import { useAuth } from '@/features/auth/AuthContext';
import { colors } from '@/shared/theme';

export default function IndexPage() {
  const { user, isRestoring, restoreError, retryRestore } = useAuth();

  if (restoreError) {
    return (
      <View className="flex-1 items-center justify-center gap-4 bg-background px-6">
        <OwnerText className="text-center text-body-lg text-on-surface">
          {restoreError}
        </OwnerText>
        <Pressable
          accessibilityRole="button"
          onPress={() => void retryRestore()}
          className="min-h-12 items-center justify-center rounded-xl bg-primary px-5"
        >
          <OwnerText className="font-familjen-semibold text-body-lg text-on-primary">
            Thử lại
          </OwnerText>
        </Pressable>
      </View>
    );
  }

  if (isRestoring) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (user?.role === 'player') {
    return <Redirect href="/(guest)/explore" />;
  }

  if (user?.role === 'owner') {
    return <Redirect href="/(owner)/dashboard" />;
  }

  if (user?.role === 'admin') {
    return <Redirect href="/admin/courts" />;
  }

  return <OnboardingScreen />;
}
