import { Booking, BookingStatus, CreateBookingInput } from '../models';
import { api } from './apiClient';

export const bookingService = {
  create: (d: CreateBookingInput) => api.post<Booking>('/bookings', d).then((r) => r.data),
  mine: (status?: BookingStatus[]) => api.get<Booking[]>('/bookings/mine', { params: { status: status?.join(',') } }).then((r) => r.data),
  forOwner: (f: { venueId?: string; date?: string; status?: string } = {}) => api.get<Booking[]>('/bookings/owner', { params: f }).then((r) => r.data),
  detail: (id: string) => api.get<Booking>(`/bookings/${id}`).then((r) => r.data),
  pay: (id: string) => api.post<Booking>(`/bookings/${id}/pay`).then((r) => r.data),
  cancel: (id: string) => api.patch<Booking>(`/bookings/${id}/cancel`).then((r) => r.data),
  approve: (id: string) => api.patch<Booking>(`/bookings/${id}/approve`).then((r) => r.data),
  reject: (id: string, reason: string) => api.patch<Booking>(`/bookings/${id}/reject`, { reason }).then((r) => r.data),
  remove: (id: string) => api.delete(`/bookings/${id}`),
  review: (bookingId: string, rating: number, comment?: string) => api.post('/reviews', { bookingId, rating, comment }).then((r) => r.data),
};
