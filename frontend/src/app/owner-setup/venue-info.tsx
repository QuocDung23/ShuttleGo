import { useRouter } from "expo-router";

import { SettingsPage } from "@/components/venue/SettingsPage";
import { VenueInfoForm } from "@/components/venue/VenueInfoForm";
import { useAuth } from "@/features/auth/AuthContext";
import { useOwnerSetup } from "@/features/venue/ownerSetupContext";

export default function OwnerSetupVenueInfoPage() {
  const router = useRouter();
  const { logout } = useAuth();
  const { venueInfo, setVenueInfo } = useOwnerSetup();
  const backToLogin = () => {
    void logout().then(
      () => router.replace("/login"),
      () => router.replace("/login"),
    );
  };

  return (
    <SettingsPage
      title="Thông tin sân"
      saveTitle="Tiếp theo →"
      onBack={backToLogin}
      onSave={() => router.push("/owner-setup/pricing")}
    >
      <VenueInfoForm value={venueInfo} onChange={setVenueInfo} />
    </SettingsPage>
  );
}
