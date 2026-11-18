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

export const venueRepository = {
  get(id: number) {
    return apiRequest<Venue>(`/venues/${id}`);
  },

  create(input: CreateVenueInput) {
    return apiRequest<Venue>('/venues', {
      method: 'POST',
      body: input,
    });
  },

  update(id: number, input: UpdateVenueInput) {
    return apiRequest<Venue>(`/venues/${id}`, {
      method: 'PATCH',
      body: input,
    });
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

  resubmit(id: number) {
    return apiRequest<Venue>(`/venues/${id}/resubmit`, {
      method: 'POST',
    });
  },
};
