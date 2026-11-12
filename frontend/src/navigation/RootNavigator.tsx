import { Stack, usePathname } from 'expo-router';
import { View } from 'react-native';

import { AppProviders } from '@/shared/providers';
import AppTabs from '@/navigation/AppTabs';
import { colors } from '@/shared/theme';

const mainPaths = ['/', '/schedule', '/revenue', '/account'];

export default function RootNavigator() {
  const pathname = usePathname();
  return <AppProviders>
    <View className="flex-1 bg-background">
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }} />
      {mainPaths.includes(pathname) && <AppTabs />}
    </View>
  </AppProviders>;
}
