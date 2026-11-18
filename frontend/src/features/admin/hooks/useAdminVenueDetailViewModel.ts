import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';

import { useAuth } from '@/features/auth/AuthContext';
import { adminVenueRepository } from '@/features/admin/adminVenueRepository';
import type { AdminVenue, AdminVenueStatus } from '@/features/admin/adminVenue';
import { useRealtimeRefresh } from '@/features/realtime/RealtimeProvider';

export function useAdminVenueDetailViewModel(id: number) {
  const { user } = useAuth();
  const [venue, setVenue] = useState<AdminVenue | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!Number.isInteger(id) || id < 1) {
      setError('Không tìm thấy sân.');
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      setVenue(await adminVenueRepository.get(id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tải được thông tin sân.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  useRealtimeRefresh(['venue.review_changed'], () => void refresh());

  const review = useCallback(
    async (status: AdminVenueStatus, reviewNote: string | null) => {
      if (!user || user.role !== 'admin') {
        setError('Bạn không có quyền thực hiện thao tác này.');
        return false;
      }
      setIsSubmitting(true);
      setError(null);
      try {
        setVenue(await adminVenueRepository.review(id, { status, reviewedBy: user.id, reviewNote }));
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Không thể cập nhật trạng thái sân.');
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [id, user],
  );

  return { venue, isLoading, isSubmitting, error, refresh, review };
}
