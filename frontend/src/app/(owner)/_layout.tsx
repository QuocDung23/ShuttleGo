import { Redirect, Stack, usePathname } from 'expo-router';
import { ActivityIndicator, Pressable, View } from 'react-native';

import { OwnerText } from '@/components/ui/owner-ui';
import { useAuth } from '@/features/auth/AuthContext';
import { useOwnerVenueAccess } from '@/features/venue/useOwnerVenueAccess';
import { colors } from '@/shared/theme';

export default function OwnerLayout() {
  const pathname = usePathname();
  const { user, isRestoring } = useAuth();
  const isOwner = user?.role === 'owner';
  const { state, loading, error, refresh } = useOwnerVenueAccess({ enabled: isOwner });

  if (isRestoring) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!user) return <Redirect href="/" />;
  if (user.role !== 'owner') return <Redirect href="/" />;

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center gap-4 bg-background px-6">
        <OwnerText className="text-center text-body-lg text-on-surface">{error}</OwnerText>
        <Pressable
          accessibilityRole="button"
          onPress={() => void refresh()}
          className="min-h-12 items-center justify-center rounded-xl bg-primary px-5"
        >
          <OwnerText className="font-familjen-semibold text-body-lg text-on-primary">
            Thử lại
          </OwnerText>
        </Pressable>
      </View>
    );
  }

  if (state === 'approved' || (state === 'rejected' && pathname === '/venue-info')) {
    return <Stack screenOptions={{ headerShown: false }} />;
  }

  if (state === 'none') {
    return <Redirect href="/owner-setup/venue-info" />;
  }

  return <Redirect href="/owner-setup/pending" />;
}
