import { StyleSheet, View } from 'react-native';

import { OwnerButton, OwnerChip, OwnerInput, OwnerText, ownerColors } from '@/components/ui/owner-ui';

type VenueInfo = { name: string; address: string; phone: string; description: string };

export function VenueInfoForm({ venue }: { venue: VenueInfo }) {
  return <><View style={styles.photo}><OwnerText size={12} weight="semibold" color="#4a1a05">Ảnh bìa sân · tỉ lệ 16:7</OwnerText></View><OwnerButton title="Thêm ảnh" outline /><OwnerInput label="Tên sân" defaultValue={venue.name} /><OwnerInput label="Địa chỉ" defaultValue={venue.address} /><OwnerInput label="Số điện thoại liên hệ" defaultValue={venue.phone} keyboardType="phone-pad" /><OwnerInput label="Mô tả ngắn" defaultValue={venue.description} /><View style={styles.separator} /><OwnerText weight="semibold">Tiện ích</OwnerText><View style={styles.chips}><OwnerChip title="Gửi xe" selected /><OwnerChip title="Phòng thay đồ" selected /></View></>;
}

const styles = StyleSheet.create({
  photo: { height: 156, borderRadius: 16, backgroundColor: ownerColors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  separator: { height: 1, backgroundColor: ownerColors.border, marginVertical: 10 },
  chips: { flexDirection: 'row', gap: 8 },
});
