import type { AdminVenue } from '@/features/admin/adminVenue';

let venues: AdminVenue[] | null = null;
const details = new Map<number, AdminVenue>();

export const adminVenueCache = {
  getList: () => venues,
  get: (id: number) => details.get(id) ?? venues?.find((venue) => venue.id === id) ?? null,
  setList(next: AdminVenue[]) {
    venues = next;
    next.forEach((venue) => details.set(venue.id, venue));
  },
  set(next: AdminVenue) {
    details.set(next.id, next);
    if (venues) venues = venues.map((venue) => (venue.id === next.id ? next : venue));
  },
};
