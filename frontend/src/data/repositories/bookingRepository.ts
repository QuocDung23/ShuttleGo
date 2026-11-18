import { apiRequest } from '@/data/api/client';
import type {
  ApiBooking,
  BookingHold,
  CreateBookingInput,
  VenueAvailability,
} from '@/models/booking';
import type { Paginated } from '@/models/venue';

export type ListBookingsParams = {
  page?: number;
  limit?: number;
  venueId?: number;
  status?: ApiBooking['status'];
  date?: string;
  from?: string;
  to?: string;
};

function toQuery(params: ListBookingsParams) {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));
  if (params.venueId) query.set('venueId', String(params.venueId));
  if (params.status) query.set('status', params.status);
  if (params.date) query.set('date', params.date);
  if (params.from) query.set('from', params.from);
  if (params.to) query.set('to', params.to);
  return query.toString();
}

export const bookingRepository = {
  /** Public endpoint — no PII of other customers is returned. */
  getVenueAvailability(venueId: number, date: string) {
    const query = new URLSearchParams({ date });
    return apiRequest<VenueAvailability>(`/venues/${venueId}/availability?${query}`, {
      auth: false,
    });
  },

  getMyHold() {
    return apiRequest<BookingHold | null>('/booking-holds/mine');
  },

  selectHold(input: Pick<BookingHold, 'courtId' | 'bookingDate' | 'startTime' | 'endTime'>) {
    return apiRequest<BookingHold>('/booking-holds', { method: 'POST', body: input });
  },

  releaseMyHold() {
    return apiRequest<void>('/booking-holds/mine', { method: 'DELETE' });
  },

  create(input: CreateBookingInput) {
    return apiRequest<ApiBooking>('/bookings', { method: 'POST', body: input });
  },

  get(id: number) {
    return apiRequest<ApiBooking>(`/bookings/${id}`);
  },

  confirmPayment(id: number) {
    return apiRequest<ApiBooking>(`/bookings/${id}`, {
      method: 'PATCH',
      body: { paymentStatus: 'pending_verification' },
    });
  },

  cancelPendingCheckout(id: number) {
    return apiRequest<ApiBooking>(`/bookings/${id}/cancel`, { method: 'POST' });
  },

  list(params: ListBookingsParams = {}) {
    const qs = toQuery(params);
    return apiRequest<Paginated<ApiBooking>>(`/bookings${qs ? `?${qs}` : ''}`);
  },

  /** Fetch every page of a booking query (backend caps limit at 100). */
  async listAll(params: ListBookingsParams = {}) {
    const first = await this.list({ ...params, page: 1, limit: 100 });
    const rest = await Promise.all(
      Array.from({ length: Math.max(0, first.meta.totalPages - 1) }, (_, index) =>
        this.list({ ...params, page: index + 2, limit: 100 }),
      ),
    );
    return [first, ...rest].flatMap((page) => page.data);
  },

  updateStatus(id: number, status: ApiBooking['status']) {
    return apiRequest<ApiBooking>(`/bookings/${id}`, {
      method: 'PATCH',
      body: { status },
    });
  },
};
