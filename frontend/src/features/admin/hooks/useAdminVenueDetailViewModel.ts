import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';

import { useAuth } from '@/features/auth/AuthContext';
import { adminVenueCache } from '@/features/admin/adminVenueCache';
import { adminVenueRepository } from '@/features/admin/adminVenueRepository';
import type { AdminVenue, AdminVenueStatus } from '@/features/admin/adminVenue';
import { useRealtimeRefresh } from '@/features/realtime/RealtimeProvider';

export function useAdminVenueDetailViewModel(id: number) {
  const { user } = useAuth();
  const cached = adminVenueCache.get(id);
  const [venue, setVenue] = useState<AdminVenue | null>(cached);
  const [isLoading, setIsLoading] = useState(cached === null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasDataRef = useRef(cached !== null);

  const refresh = useCallback(async () => {
    if (!Number.isInteger(id) || id < 1) {
      setError('Không tìm thấy sân.');
      setIsLoading(false);
      return;
    }
    if (!hasDataRef.current) setIsLoading(true);
    setError(null);
    try {
      const next = await adminVenueRepository.get(id);
      adminVenueCache.set(next);
      hasDataRef.current = true;
      setVenue(next);
    } catch (err) {
      if (!hasDataRef.current) {
        setError(err instanceof Error ? err.message : 'Không tải được thông tin sân.');
      }
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
        const next = await adminVenueRepository.review(id, { status, reviewedBy: user.id, reviewNote });
        adminVenueCache.set(next);
        setVenue(next);
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
