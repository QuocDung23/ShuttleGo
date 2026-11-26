import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { useAuth } from '@/features/auth/AuthContext';
import { colors } from '@/shared/theme';

export default function AdminLayout() {
  const { user, isRestoring } = useAuth();
  if (isRestoring) {
    return <View className="flex-1 items-center justify-center bg-background"><ActivityIndicator color={colors.primary} /></View>;
  }
  if (!user) return <Redirect href="/login" />;
  if (user.role !== 'admin') return <Redirect href="/" />;
  return <Stack screenOptions={{ headerShown: false }} />;
}
