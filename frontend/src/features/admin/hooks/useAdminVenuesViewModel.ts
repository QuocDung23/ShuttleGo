import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';

import type { AdminVenue } from '@/features/admin/adminVenue';
import { adminVenueCache } from '@/features/admin/adminVenueCache';
import { adminVenueRepository } from '@/features/admin/adminVenueRepository';
import { useRealtimeRefresh } from '@/features/realtime/RealtimeProvider';

export function useAdminVenuesViewModel() {
  const cached = adminVenueCache.getList();
  const [venues, setVenues] = useState<AdminVenue[]>(() => cached ?? []);
  const [isLoading, setIsLoading] = useState(cached === null);
  const [error, setError] = useState<string | null>(null);
  const hasDataRef = useRef(cached !== null);

  const refresh = useCallback(async () => {
    if (!hasDataRef.current) setIsLoading(true);
    setError(null);
    try {
      const next = await adminVenueRepository.listAll();
      adminVenueCache.setList(next);
      hasDataRef.current = true;
      setVenues(next);
    } catch (err) {
      if (!hasDataRef.current) {
        setError(err instanceof Error ? err.message : 'Không tải được danh sách sân.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  useRealtimeRefresh(
    ['venue.application_submitted', 'venue.review_changed'],
    () => void refresh(),
  );

  return { venues, isLoading, error, refresh };
}
