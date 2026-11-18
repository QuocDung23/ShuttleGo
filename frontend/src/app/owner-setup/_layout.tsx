import { Stack } from 'expo-router';

import { OwnerSetupProvider } from '@/features/venue/ownerSetupContext';

export default function OwnerSetupLayout() {
  return (
    <OwnerSetupProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </OwnerSetupProvider>
  );
}
