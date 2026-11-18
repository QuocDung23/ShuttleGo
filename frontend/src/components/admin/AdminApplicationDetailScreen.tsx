import { useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useRouter } from 'expo-router';

import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminCoverImage, AdminKeyValueList, AdminNotice, AdminStatusBadge } from '@/components/admin/AdminPrimitives';
import { AdminReviewDialog } from '@/components/admin/AdminReviewDialog';
import { OwnerButton, OwnerCard, OwnerPage, OwnerText } from '@/components/ui/owner-ui';
import { useAdminVenueDetailViewModel } from '@/features/admin/hooks/useAdminVenueDetailViewModel';
import { colors } from '@/shared/theme';

export function AdminApplicationDetailScreen({ id }: { id: number }) {
  const router = useRouter();
  const { venue, isLoading, isSubmitting, error, refresh, review } = useAdminVenueDetailViewModel(id);
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  if (isLoading) {
    return <OwnerPage><AdminHeader title="Chi tiết hồ sơ" back fallback="/admin/approvals" /><View className="items-center py-12"><ActivityIndicator color={colors.primary} /></View></OwnerPage>;
  }
  if (!venue) {
    return (
      <OwnerPage>
        <AdminHeader title="Chi tiết hồ sơ" back fallback="/admin/approvals" />
        <AdminNotice error>{error ?? 'Không tìm thấy hồ sơ.'}</AdminNotice>
        <OwnerButton title="Thử lại" outline onPress={() => void refresh()} />
      </OwnerPage>
    );
  }

  const price = venue.priceRules?.length
    ? Math.min(...venue.priceRules.map((rule) => rule.pricePerHour)).toLocaleString('vi-VN') + 'đ / giờ'
    : 'Chưa có bảng giá';
  const ownerName = venue.owner?.fullName ?? `Chủ sân #${venue.ownerId}`;
  const ownerPhone = venue.owner?.phone ?? venue.phone ?? 'Chưa có';

  const finishReview = async (status: 'approved' | 'rejected', note: string | null) => {
    const saved = await review(status, note);
    if (saved) router.replace('/admin/approvals');
  };

  return (
    <OwnerPage>
      <AdminHeader title="Chi tiết hồ sơ" back fallback="/admin/approvals" />
      <AdminCoverImage url={venue.coverImageUrl} label={`Ảnh ${venue.name}`} />
      <View className="gap-2">
        <AdminStatusBadge status={venue.status} />
        <OwnerText className="font-familjen-bold text-headline">{venue.name}</OwnerText>
        <OwnerText tone="muted" className="text-body-lg">{venue.address}</OwnerText>
      </View>
      {venue.status === 'rejected' && venue.reviewNote ? (
        <AdminNotice error>Đã từ chối. Lý do: {venue.reviewNote}</AdminNotice>
      ) : null}
      {error ? <AdminNotice error>{error}</AdminNotice> : null}
      <View className="gap-3">
        <OwnerText className="font-familjen-semibold text-title-sm">Thông tin đăng ký</OwnerText>
        <AdminKeyValueList rows={[
          { label: 'Chủ sân', value: ownerName },
          { label: 'Số điện thoại', value: ownerPhone },
          { label: 'Khu vực', value: `${venue.district}, ${venue.city}` },
          { label: 'Số sân', value: `${venue.courts?.length ?? 0} sân` },
          { label: 'Giá từ', value: price },
          { label: 'Gửi hồ sơ', value: new Date(venue.createdAt).toLocaleDateString('vi-VN') },
        ]} />
      </View>
      {venue.description ? (
        <OwnerCard>
          <OwnerText className="font-familjen-semibold text-title-sm">Mô tả sân</OwnerText>
          <OwnerText tone="muted">{venue.description}</OwnerText>
        </OwnerCard>
      ) : null}
      {venue.amenities?.length ? (
        <OwnerCard>
          <OwnerText className="font-familjen-semibold text-title-sm">Tiện ích</OwnerText>
          <OwnerText tone="muted">{venue.amenities.map((amenity) => amenity.name).join(' · ')}</OwnerText>
        </OwnerCard>
      ) : null}
      {venue.status === 'pending' ? (
        <View className="flex-row gap-3">
          <OwnerButton
            title="Từ chối"
            outline
            disabled={isSubmitting}
            onPress={() => setShowRejectDialog(true)}
            className="flex-1"
          />
          <OwnerButton
            title={isSubmitting ? 'Đang lưu...' : 'Duyệt sân'}
            disabled={isSubmitting}
            onPress={() => void finishReview('approved', null)}
            className="flex-1"
          />
        </View>
      ) : null}
      <AdminReviewDialog
        visible={showRejectDialog}
        title="Từ chối hồ sơ sân?"
        description="Ghi chú sẽ được lưu cùng kết quả để chủ sân biết lý do."
        confirmLabel="Từ chối hồ sơ"
        isSubmitting={isSubmitting}
        onCancel={() => setShowRejectDialog(false)}
        onConfirm={(note) => void finishReview('rejected', note)}
      />
    </OwnerPage>
  );
}
