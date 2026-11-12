import { useRouter } from 'expo-router';

import { SettingsPage } from '@/components/venue/SettingsPage';
import { VenueInfoForm } from '@/components/venue/VenueInfoForm';
import { useVenueInfoViewModel } from '@/features/venue/hooks/useVenueInfoViewModel';

export default function VenueInfoPage() {
  const router = useRouter();
  const { venue, save } = useVenueInfoViewModel();

  return <SettingsPage title="Thông tin sân" saveTitle="Lưu thay đổi" onBack={() => router.back()} onSave={save}><VenueInfoForm venue={venue} /></SettingsPage>;
}
