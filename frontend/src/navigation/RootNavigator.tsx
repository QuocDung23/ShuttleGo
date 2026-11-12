import { Stack, usePathname } from 'expo-router';
import { View } from 'react-native';

import { AppProviders } from '@/shared/providers';
import AppTabs from '@/navigation/AppTabs';
import { ownerColors } from '@/shared/components/owner-ui';

const mainPaths = ['/', '/schedule', '/revenue', '/account'];

export default function RootNavigator() {
  const pathname = usePathname();
  return <AppProviders>
    <View style={{ flex: 1, backgroundColor: ownerColors.page }}>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: ownerColors.page } }} />
      {mainPaths.includes(pathname) && <AppTabs />}
    </View>
  </AppProviders>;
}
