import { apiRequest } from '@/data/api/client';
import type { OperatingHour, OperatingHourInput } from '@/models/venue';

export const operatingHourRepository = {
  list(venueId: number) {
    return apiRequest<OperatingHour[]>(`/venues/${venueId}/operating-hours`, { auth: false });
  },

  replace(venueId: number, hours: OperatingHourInput[]) {
    return apiRequest<OperatingHour[]>(`/venues/${venueId}/operating-hours`, {
      method: 'PUT',
      body: { hours },
    });
  },
};
