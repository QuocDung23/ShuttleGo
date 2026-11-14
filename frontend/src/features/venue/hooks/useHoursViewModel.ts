import { Alert } from "react-native";

export function useHoursViewModel() {
  return {
    days: ["Thứ 2 – Thứ 6", "Thứ 7", "Chủ nhật"],
    save: () => Alert.alert("Đã lưu", "Thay đổi của bạn đã được lưu."),
  };
}
