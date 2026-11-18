import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { OwnerButton, OwnerChip, OwnerInput, OwnerText } from '@/components/ui/owner-ui';
import { pickVenueImage } from '@/components/venue/pickVenueImage';
import { amenityRepository } from '@/data/repositories/amenityRepository';
import type { OwnerSetupVenueInfo } from '@/features/venue/ownerSetupContext';
import type { Amenity } from '@/models/venue';

export function VenueInfoForm({
  value,
  onChange,
}: {
  value: OwnerSetupVenueInfo;
  onChange: (patch: Partial<OwnerSetupVenueInfo>) => void;
}) {
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [amenitiesLoading, setAmenitiesLoading] = useState(true);
  const [amenitiesError, setAmenitiesError] = useState('');
  const [pickingCover, setPickingCover] = useState(false);

  useEffect(() => {
    let active = true;
    void amenityRepository
      .list()
      .then((items) => {
        if (active) setAmenities(items);
      })
      .catch(() => {
        if (active) setAmenitiesError('Không tải được danh sách tiện ích.');
      })
      .finally(() => {
        if (active) setAmenitiesLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const toggleAmenity = (id: number) => {
    const selected = value.amenityIds.includes(id);
    onChange({
      amenityIds: selected
        ? value.amenityIds.filter((amenityId) => amenityId !== id)
        : [...value.amenityIds, id],
    });
  };

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
      <View className="my-2.5 h-px bg-divider" />
      <OwnerText className="font-familjen-semibold">Tiện ích</OwnerText>
      <View className="flex-row flex-wrap gap-2">
        {amenities.map((amenity) => (
          <OwnerChip
            key={amenity.id}
            title={amenity.name}
            selected={value.amenityIds.includes(amenity.id)}
            onPress={() => toggleAmenity(amenity.id)}
          />
        ))}
        {amenitiesLoading ? <ActivityIndicator /> : null}
        {!amenitiesLoading && amenities.length === 0 ? (
          <OwnerText tone="muted" className="text-caption">
            {amenitiesError || 'Chưa có tiện ích để chọn.'}
          </OwnerText>
        ) : null}
      </View>
    </>
  );
}
