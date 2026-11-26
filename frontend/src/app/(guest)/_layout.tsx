import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { useAuth } from '@/features/auth/AuthContext';
import { colors } from '@/shared/theme';

export default function GuestLayout() {
  const { user, isRestoring, restoreError } = useAuth();

  if (isRestoring) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  // Back/deep links must resolve through the role and venue approval gate.
  if (restoreError || user?.role === 'owner') {
    return <Redirect href="/" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
