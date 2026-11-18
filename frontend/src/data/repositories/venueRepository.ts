import { apiRequest } from '@/data/api/client';
import type {
  CreateVenueInput,
  OwnerVenuesResponse,
  Paginated,
  UpdateVenueInput,
  Venue,
} from '@/models/venue';

type ListVenuesParams = {
  page?: number;
  limit?: number;
  status?: Venue['status'];
  search?: string;
};

const venueCache = new Map<number, Venue>();

export const venueRepository = {
  getCached(id: number) {
    return venueCache.get(id) ?? null;
  },

  async get(id: number) {
    const venue = await apiRequest<Venue>(`/venues/${id}`);
    venueCache.set(venue.id, venue);
    return venue;
  },

  async create(input: CreateVenueInput) {
    const venue = await apiRequest<Venue>('/venues', {
      method: 'POST',
      body: input,
    });
    venueCache.set(venue.id, venue);
    return venue;
  },

  async update(id: number, input: UpdateVenueInput) {
    const venue = await apiRequest<Venue>(`/venues/${id}`, {
      method: 'PATCH',
      body: input,
    });
    venueCache.set(venue.id, venue);
    return venue;
  },

  list(params: ListVenuesParams = {}) {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.status) query.set('status', params.status);
    if (params.search) query.set('search', params.search);
    const qs = query.toString();
    return apiRequest<Paginated<Venue>>(`/venues${qs ? `?${qs}` : ''}`);
  },

  listMine() {
    return apiRequest<OwnerVenuesResponse>('/venues/mine');
  },

  async resubmit(id: number) {
    const venue = await apiRequest<Venue>(`/venues/${id}/resubmit`, {
      method: 'POST',
    });
    venueCache.set(venue.id, venue);
    return venue;
  },
};
