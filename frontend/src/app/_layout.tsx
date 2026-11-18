import "../shared/theme/global.css";

import { Stack, usePathname } from 'expo-router';
import { View } from 'react-native';

import AppTabs from '@/navigation/AppTabs';
import { AppProviders } from '@/shared/providers';
import { colors } from '@/shared/theme';

const mainPaths = ['/dashboard', '/schedule', '/revenue', '/account'];

export default function RootLayout() {
  const pathname = usePathname();

  return (
    <AppProviders>
      <View className="flex-1 bg-background">
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="onboarding-ready" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(guest)" />
          <Stack.Screen name="(owner)" />
        </Stack>
        {mainPaths.includes(pathname) && <AppTabs />}
      </View>
    </AppProviders>
  );
}
