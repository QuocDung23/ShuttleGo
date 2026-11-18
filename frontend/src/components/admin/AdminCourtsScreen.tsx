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

type Filter = 'all' | 'approved' | 'suspended';
const filters: { value: Filter; label: string }[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'approved', label: 'Đang hoạt động' },
  { value: 'suspended', label: 'Tạm ngưng' },
];

export function AdminCourtsScreen() {
  const router = useRouter();
  const { venues, isLoading, error, refresh } = useAdminVenuesViewModel();
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const managed = venues.filter((venue) => venue.status === 'approved' || venue.status === 'suspended');
  const counts: Record<Filter, number> = {
    all: managed.length,
    approved: managed.filter((venue) => venue.status === 'approved').length,
    suspended: managed.filter((venue) => venue.status === 'suspended').length,
  };
  const term = query.trim().toLocaleLowerCase();
  const list = managed.filter((venue) => {
    const matchesFilter = filter === 'all' || venue.status === filter;
    const matchesSearch = !term || `${venue.name} ${venue.address} ${venue.district} ${venue.city} ${venue.ownerId} ${venue.phone ?? ''}`.toLocaleLowerCase().includes(term);
    return matchesFilter && matchesSearch;
  });

  return (
    <OwnerPage>
      <AdminHeader title="Quản lý sân" />
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
              onPress={() => router.push({ pathname: '/admin/venue/[id]', params: { id: String(venue.id) } })}
            />
          ))}
        </View>
      ) : (
        <AdminEmptyState
          title={query ? 'Không tìm thấy sân' : 'Chưa có sân cần quản lý'}
          body={query ? 'Thử từ khóa hoặc bộ lọc khác.' : 'Sân đã duyệt sẽ xuất hiện ở đây.'}
        />
      )}
      <OwnerText tone="muted" className="text-center text-body-sm">
        Chọn một sân để xem thông tin và thay đổi trạng thái hoạt động.
      </OwnerText>
    </OwnerPage>
  );
}
