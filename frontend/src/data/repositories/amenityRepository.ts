import { apiRequest } from '@/data/api/client';
import type { Amenity } from '@/models/venue';

export const amenityRepository = {
  list() {
    return apiRequest<Amenity[]>('/amenities', { auth: false });
  },
};
