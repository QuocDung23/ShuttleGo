import { useCallback, useEffect, useState } from 'react';
import { Amenity, Venue } from '../models';
import { errorMessage } from '../services/apiClient';
import { VenueFilter, venueService } from '../services/venueService';

/** ViewModel danh sách sân: tìm kiếm + lọc theo khu vực, giá, tiện ích. */
export function useVenueListViewModel() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [filter, setFilter] = useState<VenueFilter>({ amenities: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try { setVenues(await venueService.list(filter)); } catch (e) { setError(errorMessage(e)); } finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t); }, [load]); // debounce khi gõ tìm kiếm
  useEffect(() => { venueService.amenities().then(setAmenities).catch(() => {}); }, []);

  const toggleAmenity = (code: string) => setFilter((f) => ({
    ...f, amenities: f.amenities?.includes(code) ? f.amenities.filter((c) => c !== code) : [...(f.amenities ?? []), code],
  }));
  return { venues, amenities, filter, setFilter, toggleAmenity, loading, error, reload: load };
}
