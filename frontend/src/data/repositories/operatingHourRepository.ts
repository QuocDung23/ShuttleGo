import { apiRequest } from '@/data/api/client';
import type { OperatingHour, OperatingHourInput } from '@/models/venue';

const operatingHoursCache = new Map<number, OperatingHour[]>();

export const operatingHourRepository = {
  getCached(venueId: number) {
    return operatingHoursCache.get(venueId) ?? null;
  },

  async list(venueId: number) {
    const hours = await apiRequest<OperatingHour[]>(`/venues/${venueId}/operating-hours`, { auth: false });
    operatingHoursCache.set(venueId, hours);
    return hours;
  },

  async replace(venueId: number, hours: OperatingHourInput[]) {
    const updated = await apiRequest<OperatingHour[]>(`/venues/${venueId}/operating-hours`, {
      method: 'PUT',
      body: { hours },
    });
    operatingHoursCache.set(venueId, updated);
    return updated;
  },
};
