import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { venueRepository } from '@/data/repositories/venueRepository';
import {
  resolveOwnerVenueAccessState,
  type OwnerVenueAccessState,
  type OwnerVenueStatusItem,
} from '@/models/venue';

type Options = {
  enabled?: boolean;
  refreshOnForeground?: boolean;
};

export function useOwnerVenueAccess(options: Options = {}) {
  const { enabled = true, refreshOnForeground = false } = options;
  const [venues, setVenues] = useState<OwnerVenueStatusItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const prevEnabledRef = useRef(enabled);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Reset fetch state when (re-)enabled so first resolved state is trusted.
  useEffect(() => {
    if (enabled && !prevEnabledRef.current) {
      queueMicrotask(() => {
        if (mountedRef.current) {
          setFetched(false);
          setVenues([]);
          setError(null);
        }
      });
    }
    prevEnabledRef.current = enabled;
  }, [enabled]);

  const refresh = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const res = await venueRepository.listMine();
      if (mountedRef.current) setVenues(res.data);
    } catch (e) {
      if (mountedRef.current) {
        setError(e instanceof Error ? e.message : 'Không thể tải trạng thái hồ sơ.');
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
        setFetched(true);
      }
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    const t = setTimeout(() => {
      void refresh();
    }, 0);
    return () => clearTimeout(t);
  }, [enabled, refresh]);

  useEffect(() => {
    if (!enabled || !refreshOnForeground) return;
    const sub = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') void refresh();
    });
    return () => sub.remove();
  }, [enabled, refresh, refreshOnForeground]);

  const resolvedState: OwnerVenueAccessState = useMemo(
    () => resolveOwnerVenueAccessState(venues),
    [venues],
  );

  const state: OwnerVenueAccessState = enabled ? resolvedState : 'none';

  const primaryVenue = useMemo(() => {
    if (!enabled || venues.length === 0) return null;
    const byStatus = (s: OwnerVenueStatusItem['status']) => venues.find((v) => v.status === s) ?? null;
    if (resolvedState === 'pending') return byStatus('pending') ?? venues[0];
    if (resolvedState === 'approved') return byStatus('approved') ?? venues[0];
    if (resolvedState === 'rejected') return byStatus('rejected') ?? venues[0];
    if (resolvedState === 'suspended') return byStatus('suspended') ?? venues[0];
    return venues[0];
  }, [enabled, resolvedState, venues]);

  return {
    state,
    venues: enabled ? venues : [],
    primaryVenue,
    loading: enabled ? !fetched || loading : false,
    error: enabled ? error : null,
    refresh,
  };
}
