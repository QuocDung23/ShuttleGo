import { useRouter } from 'expo-router';

import { PricingForm } from '@/components/venue/PricingForm';
import { SettingsPage } from '@/components/venue/SettingsPage';
import { usePricingViewModel } from '@/features/venue/hooks/usePricingViewModel';

export default function PricingPage() {
  const router = useRouter();
  const { pricing, setPricing, save } = usePricingViewModel();

  return (
    <SettingsPage
      title="Giá theo khung giờ"
      saveTitle="Lưu giá"
      onBack={() => {
        if (router.canGoBack()) router.back();
        else router.replace('/(owner)/dashboard');
      }}
      onSave={save}
    >
      <PricingForm value={pricing} onChange={setPricing} />
    </SettingsPage>
  );
}
