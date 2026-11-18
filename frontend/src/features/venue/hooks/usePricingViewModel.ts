import { useCallback, useState } from "react";
import { Alert } from "react-native";

import {
  createEmptyOwnerSetupPricing,
  type OwnerSetupPricing,
} from "@/features/venue/ownerSetupContext";

export function usePricingViewModel() {
  const [pricing, setPricingState] = useState<OwnerSetupPricing>(createEmptyOwnerSetupPricing);

  const setPricing = useCallback((patch: Partial<OwnerSetupPricing>) => {
    setPricingState((prev) => ({ ...prev, ...patch }));
  }, []);

  return {
    pricing,
    setPricing,
    save: () => Alert.alert("Đã lưu", "Thay đổi giá và mã QR ngân hàng đã được lưu."),
  };
}
