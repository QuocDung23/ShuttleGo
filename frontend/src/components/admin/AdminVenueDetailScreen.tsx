import { useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminCoverImage, AdminKeyValueList, AdminNotice, AdminStatusBadge } from '@/components/admin/AdminPrimitives';
import { AdminReviewDialog } from '@/components/admin/AdminReviewDialog';
import { OwnerButton, OwnerCard, OwnerPage, OwnerText } from '@/components/ui/owner-ui';
import { useAdminVenueDetailViewModel } from '@/features/admin/hooks/useAdminVenueDetailViewModel';
import type { AdminVenueStatus } from '@/features/admin/adminVenue';
import { colors } from '@/shared/theme';

export function AdminVenueDetailScreen({ id }: { id: number }) {
  const { venue, isLoading, isSubmitting, error, refresh, review } = useAdminVenueDetailViewModel(id);
  const [dialogStatus, setDialogStatus] = useState<AdminVenueStatus | null>(null);

  if (isLoading) {
    return <OwnerPage><AdminHeader title="Chi tiết sân" back /><View className="items-center py-12"><ActivityIndicator color={colors.primary} /></View></OwnerPage>;
  }
  if (!venue) {
    return (
      <OwnerPage>
        <AdminHeader title="Chi tiết sân" back />
        <AdminNotice error>{error ?? 'Không tìm thấy sân.'}</AdminNotice>
        <OwnerButton title="Thử lại" outline onPress={() => void refresh()} />
      </OwnerPage>
    );
  }

  const price = venue.priceRules?.length
    ? Math.min(...venue.priceRules.map((rule) => rule.pricePerHour)).toLocaleString('vi-VN') + 'đ / giờ'
    : 'Chưa có bảng giá';
  const ownerName = venue.owner?.fullName ?? `Chủ sân #${venue.ownerId}`;
  const ownerPhone = venue.owner?.phone ?? venue.phone ?? 'Chưa có';

  const submitStatus = async (status: AdminVenueStatus, note: string | null) => {
    const saved = await review(status, note);
    if (saved) setDialogStatus(null);
  };

  return (
    <OwnerPage>
      <AdminHeader title="Chi tiết sân" back />
      <AdminCoverImage url={venue.coverImageUrl} label={`Ảnh ${venue.name}`} />
      <View className="gap-2">
        <AdminStatusBadge status={venue.status} />
        <OwnerText className="font-familjen-bold text-headline">{venue.name}</OwnerText>
        <OwnerText tone="muted" className="text-body-lg">{venue.address}</OwnerText>
      </View>
      {venue.status === 'suspended' && venue.reviewNote ? (
        <AdminNotice>Sân đang tạm ngưng. Ghi chú: {venue.reviewNote}</AdminNotice>
      ) : null}
      {error ? <AdminNotice error>{error}</AdminNotice> : null}
      <View className="gap-3">
        <OwnerText className="font-familjen-semibold text-title-sm">Thông tin chủ sân</OwnerText>
        <AdminKeyValueList rows={[
          { label: 'Chủ sân', value: ownerName },
          { label: 'Số điện thoại', value: ownerPhone },
          { label: 'Số sân', value: `${venue.courts?.length ?? 0} sân` },
          { label: 'Giá từ', value: price },
          { label: 'Khu vực', value: `${venue.district}, ${venue.city}` },
        ]} />
      </View>
      {venue.description ? (
        <OwnerCard>
          <OwnerText className="font-familjen-semibold text-title-sm">Mô tả</OwnerText>
          <OwnerText tone="muted">{venue.description}</OwnerText>
        </OwnerCard>
      ) : null}
      {venue.amenities?.length ? (
        <OwnerCard>
          <OwnerText className="font-familjen-semibold text-title-sm">Tiện ích</OwnerText>
          <OwnerText tone="muted">{venue.amenities.map((amenity) => amenity.name).join(' · ')}</OwnerText>
        </OwnerCard>
      ) : null}
      <OwnerButton
        title={venue.status === 'suspended' ? 'Mở lại sân' : 'Tạm ngưng sân'}
        outline={venue.status === 'approved'}
        disabled={isSubmitting}
        onPress={() => setDialogStatus(venue.status === 'approved' ? 'suspended' : 'approved')}
      />
      <AdminReviewDialog
        key={dialogStatus ?? 'closed'}
        visible={dialogStatus !== null}
        title={dialogStatus === 'suspended' ? 'Tạm ngưng sân?' : 'Mở lại sân?'}
        description={dialogStatus === 'suspended'
          ? 'Sân sẽ tạm thời không hiển thị với người chơi. Bạn có thể ghi lại lý do.'
          : 'Sân sẽ hiển thị lại với người chơi.'}
        confirmLabel={dialogStatus === 'suspended' ? 'Tạm ngưng' : 'Mở lại'}
        isSubmitting={isSubmitting}
        onCancel={() => setDialogStatus(null)}
        onConfirm={(note) => {
          if (dialogStatus) void submitStatus(dialogStatus, note);
        }}
      />
    </OwnerPage>
  );
}
