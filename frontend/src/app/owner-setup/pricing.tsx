import { useRouter } from "expo-router";
import { PricingForm } from "@/components/venue/PricingForm";
import { SettingsPage } from "@/components/venue/SettingsPage";
import { usePricingViewModel } from "@/features/venue/hooks/usePricingViewModel";

export default function OwnerSetupPricingPage() {
  const router = useRouter();
  const { rows, prices, changePrice, bankInfo, updateBankInfo } =
    usePricingViewModel();

  return (
    <SettingsPage
      title="Giá & Mã QR thanh toán"
      saveTitle="Xác nhận đăng ký →"
      onBack={() => router.back()}
      onSave={() => router.push("/owner-setup/pending")}
    >
      <PricingForm
        rows={rows}
        prices={prices}
        onChangePrice={changePrice}
        bankInfo={bankInfo}
        onUpdateBankInfo={updateBankInfo}
      />
    </SettingsPage>
  );
}
