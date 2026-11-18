import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { venueRepository } from '@/data/repositories/venueRepository';
import { useAuth } from '@/features/auth/AuthContext';
import { useRealtimeRefresh } from '@/features/realtime/RealtimeProvider';
import {
  resolveOwnerVenueAccessState,
  type OwnerVenueAccessState,
  type OwnerVenueStatusItem,
} from '@/models/venue';

type Options = {
  enabled?: boolean;
  refreshOnForeground?: boolean;
};

const ownerVenueCache = new Map<number, OwnerVenueStatusItem[]>();

type AccessSnapshot = {
  ownerId: number | null;
  venues: OwnerVenueStatusItem[];
  fetched: boolean;
};

export function useOwnerVenueAccess(options: Options = {}) {
  const { enabled = true, refreshOnForeground = false } = options;
  const { user } = useAuth();
  const ownerId = user?.role === 'owner' ? user.id : null;
  const active = enabled && ownerId !== null;
  const cached = ownerId === null ? undefined : ownerVenueCache.get(ownerId);
  const [snapshot, setSnapshot] = useState<AccessSnapshot>(() => ({
    ownerId,
    venues: cached ?? [],
    fetched: cached !== undefined,
  }));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const hasDataRef = useRef(cached !== undefined);
  const currentSnapshot = useMemo<AccessSnapshot>(
    () => snapshot.ownerId === ownerId
      ? snapshot
      : { ownerId, venues: cached ?? [], fetched: cached !== undefined },
    [cached, ownerId, snapshot],
  );

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Restore cached access state when the authenticated owner changes.
  useEffect(() => {
    if (ownerId !== snapshot.ownerId) {
      queueMicrotask(() => {
        if (mountedRef.current) {
          const next = ownerId === null ? undefined : ownerVenueCache.get(ownerId);
          hasDataRef.current = next !== undefined;
          setSnapshot({ ownerId, venues: next ?? [], fetched: next !== undefined });
          setError(null);
        }
      });
    }
  }, [ownerId, snapshot.ownerId]);

  const refresh = useCallback(async () => {
    if (!active || ownerId === null) return;
    if (!hasDataRef.current) setLoading(true);
    setError(null);
    try {
      const res = await venueRepository.listMine();
      ownerVenueCache.set(ownerId, res.data);
      hasDataRef.current = true;
      if (mountedRef.current) setSnapshot({ ownerId, venues: res.data, fetched: true });
    } catch (e) {
      if (mountedRef.current && !hasDataRef.current) {
        setError(e instanceof Error ? e.message : 'Không thể tải trạng thái hồ sơ.');
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
        setSnapshot((current) => current.ownerId === ownerId ? { ...current, fetched: true } : current);
      }
    }
  }, [active, ownerId]);

  useEffect(() => {
    if (!active) return;
    const t = setTimeout(() => {
      void refresh();
    }, 0);
    return () => clearTimeout(t);
  }, [active, refresh]);

  useRealtimeRefresh(
    ['owner.venue_approved', 'owner.venue_reviewed'],
    () => void refresh(),
    active,
    refreshOnForeground,
  );

  const resolvedState: OwnerVenueAccessState = useMemo(
    () => resolveOwnerVenueAccessState(currentSnapshot.venues),
    [currentSnapshot.venues],
  );

  const state: OwnerVenueAccessState = active ? resolvedState : 'none';

  const primaryVenue = useMemo(() => {
    if (!active || currentSnapshot.venues.length === 0) return null;
    const byStatus = (s: OwnerVenueStatusItem['status']) => currentSnapshot.venues.find((v) => v.status === s) ?? null;
    if (resolvedState === 'pending') return byStatus('pending') ?? currentSnapshot.venues[0];
    if (resolvedState === 'approved') return byStatus('approved') ?? currentSnapshot.venues[0];
    if (resolvedState === 'rejected') return byStatus('rejected') ?? currentSnapshot.venues[0];
    if (resolvedState === 'suspended') return byStatus('suspended') ?? currentSnapshot.venues[0];
    return currentSnapshot.venues[0];
  }, [active, currentSnapshot.venues, resolvedState]);

  return {
    state,
    venues: active ? currentSnapshot.venues : [],
    primaryVenue,
    loading: active ? !currentSnapshot.fetched || loading : false,
    error: active ? error : null,
    refresh,
  };
}
