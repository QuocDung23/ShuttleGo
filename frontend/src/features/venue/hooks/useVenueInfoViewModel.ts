import { Alert } from "react-native";

export function useVenueInfoViewModel() {
  return {
    venue: {
      name: "Sân cầu lông Kỳ Hòa",
      address: "238 Bis Ba Tháng Hai, Phường 12, Quận 10",
      phone: "0912 345 678",
      description: "Sân thảm PVC, đèn LED chống chói, trần cao",
    },
    save: () => Alert.alert("Đã lưu", "Thay đổi của bạn đã được lưu."),
  };
}
