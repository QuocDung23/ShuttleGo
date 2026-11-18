import { useRouter } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { PricingForm } from '@/components/venue/PricingForm';
import { SettingsPage } from '@/components/venue/SettingsPage';
import { OwnerText } from '@/components/ui/owner-ui';
import { usePricingViewModel } from '@/features/venue/hooks/usePricingViewModel';

export default function PricingPage() {
  const router = useRouter();
  const { pricing, setPricing, save, loading, saving, error, canSave, hasChanges } = usePricingViewModel();

  return (
    <SettingsPage
      title="Giá theo khung giờ"
      saveTitle={loading ? 'Đang tải...' : saving ? 'Đang lưu...' : 'Lưu giá'}
      disabled={loading || saving || !canSave}
      showSave={hasChanges || saving}
      onBack={() => {
        if (router.canGoBack()) router.back();
        else router.replace('/(owner)/dashboard');
      }}
      onSave={() => void save()}
    >
      {loading ? (
        <View className="items-center py-8">
          <ActivityIndicator />
        </View>
      ) : canSave ? (
        <PricingForm value={pricing} onChange={setPricing} />
      ) : null}
      {error ? <OwnerText tone="muted" className="text-caption">{error}</OwnerText> : null}
    </SettingsPage>
  );
}
