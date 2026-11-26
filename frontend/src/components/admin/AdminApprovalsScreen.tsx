import { useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useRouter } from 'expo-router';

import { AdminHeader } from '@/components/admin/AdminHeader';
import {
  AdminEmptyState,
  AdminFilterBar,
  AdminNotice,
  AdminSearchField,
  AdminVenueCard,
} from '@/components/admin/AdminPrimitives';
import { OwnerButton, OwnerPage, OwnerText } from '@/components/ui/owner-ui';
import { useAdminVenuesViewModel } from '@/features/admin/hooks/useAdminVenuesViewModel';
import { colors } from '@/shared/theme';

type Filter = 'pending' | 'approved' | 'rejected';
const filters: { value: Filter; label: string }[] = [
  { value: 'pending', label: 'Chờ duyệt' },
  { value: 'approved', label: 'Đã duyệt' },
  { value: 'rejected', label: 'Đã từ chối' },
];

export function AdminApprovalsScreen() {
  const router = useRouter();
  const { venues, isLoading, error, refresh } = useAdminVenuesViewModel();
  const [filter, setFilter] = useState<Filter>('pending');
  const [query, setQuery] = useState('');
  const counts: Record<Filter, number> = {
    pending: venues.filter((venue) => venue.status === 'pending').length,
    approved: venues.filter((venue) => venue.status === 'approved').length,
    rejected: venues.filter((venue) => venue.status === 'rejected').length,
  };
  const term = query.trim().toLocaleLowerCase();
  const list = venues.filter((venue) => {
    const matchesFilter = venue.status === filter;
    const matchesSearch = !term || `${venue.name} ${venue.address} ${venue.district} ${venue.city} ${venue.ownerId} ${venue.phone ?? ''}`.toLocaleLowerCase().includes(term);
    return matchesFilter && matchesSearch;
  });

  return (
    <OwnerPage>
      <AdminHeader title="Duyệt hồ sơ sân" />
      <OwnerText tone="muted">
        Hồ sơ sân mới từ chủ sân. Sân sẽ hiển thị cho người chơi sau khi được duyệt.
      </OwnerText>
      <AdminSearchField value={query} onChangeText={setQuery} placeholder="Tìm tên sân, khu vực, chủ sân" />
      <AdminFilterBar
        options={filters.map((item) => ({ ...item, count: counts[item.value] }))}
        value={filter}
        onChange={setFilter}
      />
      {isLoading ? (
        <View className="items-center py-10"><ActivityIndicator color={colors.primary} /></View>
      ) : error ? (
        <View className="gap-3">
          <AdminNotice error>{error}</AdminNotice>
          <OwnerButton title="Thử lại" outline onPress={() => void refresh()} />
        </View>
      ) : list.length ? (
        <View className="gap-3">
          {list.map((venue) => (
            <AdminVenueCard
              key={venue.id}
              venue={venue}
              caption={`Gửi ${new Date(venue.createdAt).toLocaleDateString('vi-VN')}`}
              onPress={() => router.push({ pathname: '/admin/application/[id]', params: { id: String(venue.id) } })}
            />
          ))}
        </View>
      ) : (
        <AdminEmptyState
          title={query ? 'Không tìm thấy hồ sơ' : 'Không có hồ sơ nào'}
          body={query ? 'Thử từ khóa hoặc trạng thái khác.' : 'Hồ sơ mới từ chủ sân sẽ xuất hiện ở đây.'}
        />
      )}
    </OwnerPage>
  );
}
