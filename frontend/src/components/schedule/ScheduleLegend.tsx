import { View } from 'react-native';

import { OwnerText } from '@/components/ui/owner-ui';

const items = [
  ['bg-slot-available-background border-slot-available-outline', 'Còn trống'],
  ['bg-shuttle border-shuttle', 'Đang chọn'],
  ['bg-slot-pending-background border-slot-pending-background', 'Chờ duyệt'],
  ['bg-slot-booked-background border-slot-booked-background', 'Đã đặt'],
];

export function ScheduleLegend() {
  return <View className="flex-row flex-wrap gap-2.5 px-4 pb-3 pt-2">{items.map(([color, label]) => <View key={label} className="flex-row items-center gap-1.5"><View className={`h-3.5 w-3.5 rounded border ${color}`} /><OwnerText tone="muted" className="text-[11px]">{label}</OwnerText></View>)}</View>;
}
