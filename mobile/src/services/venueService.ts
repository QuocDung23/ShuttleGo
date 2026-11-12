import { Amenity, Availability, Court, PriceRule, Venue, VenueDetail, VenueInput } from '../models';
import { api } from './apiClient';

export interface VenueFilter { q?: string; district?: string; minPrice?: number; maxPrice?: number; amenities?: string[] }

export const venueService = {
  // Đọc
  list: (f: VenueFilter = {}) =>
    api.get<Venue[]>('/venues', { params: { ...f, amenities: f.amenities?.length ? f.amenities.join(',') : undefined } }).then((r) => r.data),
  mine: () => api.get<Venue[]>('/venues/mine').then((r) => r.data),
  detail: (id: string) => api.get<VenueDetail>(`/venues/${id}`).then((r) => r.data),
  availability: (id: string, date: string) => api.get<Availability>(`/venues/${id}/availability`, { params: { date } }).then((r) => r.data),
  amenities: () => api.get<Amenity[]>('/amenities').then((r) => r.data),
  // Thêm / sửa / xóa cơ sở
  create: (d: VenueInput) => api.post<VenueDetail>('/venues', d).then((r) => r.data),
  update: (id: string, d: VenueInput) => api.put<VenueDetail>(`/venues/${id}`, d).then((r) => r.data),
  remove: (id: string) => api.delete(`/venues/${id}`),
  // Sân con
  addCourt: (venueId: string, name: string) => api.post<Court>(`/venues/${venueId}/courts`, { name }).then((r) => r.data),
  updateCourt: (id: string, d: Partial<Pick<Court, 'name' | 'isActive'>>) => api.put<Court>(`/courts/${id}`, d).then((r) => r.data),
  removeCourt: (id: string) => api.delete(`/courts/${id}`),
  // Bảng giá
  addPrice: (venueId: string, d: Omit<PriceRule, 'id'>) => api.post<PriceRule>(`/venues/${venueId}/price-rules`, d).then((r) => r.data),
  updatePrice: (id: string, d: Partial<Omit<PriceRule, 'id'>>) => api.put<PriceRule>(`/price-rules/${id}`, d).then((r) => r.data),
  removePrice: (id: string) => api.delete(`/price-rules/${id}`),
};
