import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';

import type { AdminVenue } from '@/features/admin/adminVenue';
import { adminVenueRepository } from '@/features/admin/adminVenueRepository';

export function useAdminVenuesViewModel() {
  const [venues, setVenues] = useState<AdminVenue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setVenues(await adminVenueRepository.listAll());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tải được danh sách sân.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  return { venues, isLoading, error, refresh };
}
