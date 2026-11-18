import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';

import { SettingsPage } from '@/components/venue/SettingsPage';
import { VenueInfoForm } from '@/components/venue/VenueInfoForm';
import {
  createEmptyOwnerSetupVenueInfo,
  type OwnerSetupVenueInfo,
} from '@/features/venue/ownerSetupContext';

export default function VenueInfoPage() {
  const router = useRouter();
  const [venue, setVenue] = useState<OwnerSetupVenueInfo>(createEmptyOwnerSetupVenueInfo);

  return (
    <SettingsPage
      title="Thông tin sân"
      saveTitle="Lưu thay đổi"
      onBack={() => {
        if (router.canGoBack()) router.back();
        else router.replace('/(owner)/dashboard');
      }}
      onSave={() => Alert.alert('Đã lưu', 'Thay đổi của bạn đã được lưu.')}
    >
      <VenueInfoForm value={venue} onChange={(patch) => setVenue((prev) => ({ ...prev, ...patch }))} />
    </SettingsPage>
  );
}
