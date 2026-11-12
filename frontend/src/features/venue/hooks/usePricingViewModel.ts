import { useState } from 'react';
import { Alert } from 'react-native';

const rows = [
  ['Giờ thường', '06:00 – 17:00'],
  ['Giờ cao điểm', '17:00 – 22:00'],
  ['Bắt đầu cao điểm', 'Áp dụng giá cao điểm từ giờ này'],
  ['Phụ thu cuối tuần', 'Cộng thêm mỗi giờ vào T7, CN'],
] as const;

export function usePricingViewModel() {
  const [prices, setPrices] = useState([80000, 120000, 170000, 10000]);
  const changePrice = (index: number, delta: number) => setPrices((current) => current.map((value, itemIndex) => itemIndex === index ? Math.max(0, value + delta) : value));

  return {
    rows,
    prices,
    changePrice,
    save: () => Alert.alert('Đã lưu', 'Thay đổi của bạn đã được lưu.'),
  };
}
