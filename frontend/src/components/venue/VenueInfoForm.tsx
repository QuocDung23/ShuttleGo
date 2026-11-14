import { View } from 'react-native';

import { OwnerButton, OwnerChip, OwnerInput, OwnerText } from '@/components/ui/owner-ui';

type VenueInfo = { name: string; address: string; phone: string; description: string };

export function VenueInfoForm({ venue }: { venue: VenueInfo }) {
  return <><View className="h-[156px] items-center justify-center rounded-2xl bg-primary-container"><OwnerText tone="onPrimaryContainer" className="font-familjen-semibold text-caption">Ảnh bìa sân · tỉ lệ 16:7</OwnerText></View><OwnerButton title="Thêm ảnh" outline /><OwnerInput label="Tên sân" defaultValue={venue.name} /><OwnerInput label="Địa chỉ" defaultValue={venue.address} /><OwnerInput label="Số điện thoại liên hệ" defaultValue={venue.phone} keyboardType="phone-pad" /><OwnerInput label="Mô tả ngắn" defaultValue={venue.description} /><View className="my-2.5 h-px bg-divider" /><OwnerText className="font-familjen-semibold">Tiện ích</OwnerText><View className="flex-row gap-2"><OwnerChip title="Gửi xe" selected /><OwnerChip title="Phòng thay đồ" selected /></View></>;
}
