import { apiRequest } from '@/data/api/client';
import type { AdminVenue, AdminVenueStatus } from '@/features/admin/adminVenue';

type PaginatedVenues = {
  data: AdminVenue[];
  meta: { total: number; totalPages: number };
};

type ReviewVenueInput = {
  status: AdminVenueStatus;
  reviewedBy: number;
  reviewNote: string | null;
};

async function listPage(page: number) {
  return apiRequest<PaginatedVenues>(`/venues?page=${page}&limit=100`);
}

export const adminVenueRepository = {
  async listAll() {
    const first = await listPage(1);
    if (first.meta.totalPages <= 1) return first.data;
    const remaining = await Promise.all(
      Array.from({ length: first.meta.totalPages - 1 }, (_, index) => listPage(index + 2)),
    );
    return first.data.concat(...remaining.map((page) => page.data));
  },

  async countPending() {
    const result = await apiRequest<PaginatedVenues>('/venues?status=pending&page=1&limit=1');
    return result.meta.total;
  },

  get(id: number) {
    return apiRequest<AdminVenue>(`/venues/${id}`);
  },

  review(id: number, input: ReviewVenueInput) {
    return apiRequest<AdminVenue>(`/venues/${id}/review`, {
      method: 'PATCH',
      body: input,
    });
  },
};
