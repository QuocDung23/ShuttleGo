import { useRouter } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { OpeningHoursForm } from '@/components/venue/OpeningHoursForm';
import { SettingsPage } from '@/components/venue/SettingsPage';
import { OwnerText } from '@/components/ui/owner-ui';
import { useHoursViewModel } from '@/features/venue/hooks/useHoursViewModel';

export default function HoursPage() {
  const router = useRouter();
  const { days, setDay, save, loading, saving, error, canSave } = useHoursViewModel();

  return (
    <SettingsPage
      title="Giờ mở cửa"
      saveTitle={loading ? 'Đang tải...' : saving ? 'Đang lưu...' : 'Lưu giờ mở cửa'}
      disabled={loading || saving || !canSave}
      onBack={() => {
        if (router.canGoBack()) router.back();
        else router.replace('/(owner)/dashboard');
      }}
      onSave={() => void save()}
    >
      {loading ? (
        <View className="items-center py-8"><ActivityIndicator /></View>
      ) : canSave ? (
        <OpeningHoursForm days={days} onChange={setDay} />
      ) : null}
      {error ? <OwnerText tone="muted" className="text-caption">{error}</OwnerText> : null}
    </SettingsPage>
  );
}
