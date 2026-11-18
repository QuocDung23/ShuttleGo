import { useState } from "react";
import { Alert } from "react-native";

export type BankAccountInfo = {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  qrImageUrl: string;
};

export const defaultBankInfo: BankAccountInfo = {
  bankName: "MB Bank (Ngân hàng Quân đội)",
  accountNumber: "0912 345 678",
  accountHolder: "SÂN CẦU LÔNG KỲ HÒA",
  qrImageUrl:
    "https://img.vietqr.io/image/MB-0912345678-compact2.png?amount=0&addInfo=DAT%20SAN%20CAU%20LONG&accountName=SAN%20CAU%20LONG%20KY%20HOA",
};

const rows = [
  ["Giờ thường", "06:00 – 17:00"],
  ["Giờ cao điểm", "17:00 – 22:00"],
  ["Bắt đầu cao điểm", "Áp dụng giá cao điểm từ giờ này"],
  ["Phụ thu cuối tuần", "Cộng thêm mỗi giờ vào T7, CN"],
] as const;

export function usePricingViewModel() {
  const [prices, setPrices] = useState([80000, 120000, 170000, 10000]);
  const [bankInfo, setBankInfo] = useState<BankAccountInfo>(defaultBankInfo);

  const changePrice = (index: number, delta: number) =>
    setPrices((current) =>
      current.map((value, itemIndex) =>
        itemIndex === index ? Math.max(0, value + delta) : value,
      ),
    );

  const updateBankInfo = (partial: Partial<BankAccountInfo>) => {
    setBankInfo((prev) => ({ ...prev, ...partial }));
  };

  return {
    rows,
    prices,
    changePrice,
    bankInfo,
    updateBankInfo,
    save: () => Alert.alert("Đã lưu", "Thay đổi giá và mã QR ngân hàng đã được lưu."),
  };
}
