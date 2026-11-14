import { useRouter } from 'expo-router';

import { PricingForm } from '@/components/venue/PricingForm';
import { SettingsPage } from '@/components/venue/SettingsPage';
import { usePricingViewModel } from '@/features/venue/hooks/usePricingViewModel';

export default function PricingPage() {
  const router = useRouter();
  const { rows, prices, changePrice, save } = usePricingViewModel();

  return <SettingsPage title="Giá theo khung giờ" saveTitle="Lưu giá" onBack={() => router.back()} onSave={save}><PricingForm rows={rows} prices={prices} onChangePrice={changePrice} /></SettingsPage>;
}
