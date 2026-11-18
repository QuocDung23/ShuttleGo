import { Image } from 'expo-image';
import { useState } from 'react';
import { View } from 'react-native';

import { OwnerButton, OwnerInput, OwnerText } from '@/components/ui/owner-ui';
import { pickVenueImage } from '@/components/venue/pickVenueImage';
import type { OwnerSetupVenueInfo } from '@/features/venue/ownerSetupContext';

export function VenueInfoForm({
  value,
  onChange,
}: {
  value: OwnerSetupVenueInfo;
  onChange: (patch: Partial<OwnerSetupVenueInfo>) => void;
}) {
  const [pickingCover, setPickingCover] = useState(false);

  const selectCoverImage = async () => {
    setPickingCover(true);
    const coverImageUrl = await pickVenueImage({ aspect: [16, 7], width: 1280 });
    if (coverImageUrl) onChange({ coverImageUrl });
    setPickingCover(false);
  };

  return (
    <>
      <View className="h-[156px] items-center justify-center rounded-2xl bg-primary-container">
        {value.coverImageUrl.trim() ? (
          <Image
            source={{ uri: value.coverImageUrl.trim() }}
            contentFit="cover"
            style={{ width: '100%', height: '100%', borderRadius: 16 }}
          />
        ) : (
          <OwnerText tone="onPrimaryContainer" className="font-familjen-semibold text-caption">
            Ảnh bìa sân · tỉ lệ 16:7
          </OwnerText>
        )}
      </View>
      <OwnerButton
        title={pickingCover ? 'Đang mở thư viện...' : value.coverImageUrl ? 'Đổi ảnh bìa' : 'Chọn ảnh bìa'}
        outline
        disabled={pickingCover}
        onPress={() => void selectCoverImage()}
      />
      <OwnerInput label="Tên sân" value={value.name} onChangeText={(name) => onChange({ name })} />
      <OwnerInput
        label="Địa chỉ"
        value={value.address}
        onChangeText={(address) => onChange({ address })}
      />
      <OwnerInput
        label="Quận / huyện"
        value={value.district}
        onChangeText={(district) => onChange({ district })}
      />
      <OwnerInput
        label="Thành phố"
        value={value.city}
        onChangeText={(city) => onChange({ city })}
      />
      <OwnerInput
        label="Số điện thoại liên hệ"
        value={value.phone}
        onChangeText={(phone) => onChange({ phone })}
        keyboardType="phone-pad"
      />
      <OwnerInput
        label="Mô tả ngắn"
        value={value.description}
        onChangeText={(description) => onChange({ description })}
      />
    </>
  );
}
