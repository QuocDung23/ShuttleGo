import { useRouter } from "expo-router";
import { SettingsPage } from "@/components/venue/SettingsPage";
import { VenueInfoForm } from "@/components/venue/VenueInfoForm";

export default function OwnerSetupVenueInfoPage() {
  const router = useRouter();

  return (
    <SettingsPage
      title="Thông tin sân"
      saveTitle="Tiếp theo →"
      onBack={() => router.back()}
      onSave={() => router.push("/owner-setup/pricing")}
    >
      <VenueInfoForm
        venue={{
          name: "Sân cầu lông Kỳ Hòa",
          address: "238 Bis Ba Tháng Hai, Phường 12, Quận 10",
          phone: "0912 345 678",
          description: "Sân thảm PVC, đèn LED chống chói, trần cao",
        }}
      />
    </SettingsPage>
  );
}
