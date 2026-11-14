import { useRouter } from 'expo-router';

import { OpeningHoursForm } from '@/components/venue/OpeningHoursForm';
import { SettingsPage } from '@/components/venue/SettingsPage';
import { useHoursViewModel } from '@/features/venue/hooks/useHoursViewModel';

export default function HoursPage() {
  const router = useRouter();
  const { days, save } = useHoursViewModel();

  return <SettingsPage title="Giờ mở cửa" saveTitle="Lưu giờ mở cửa" onBack={() => router.back()} onSave={save}><OpeningHoursForm days={days} /></SettingsPage>;
}
