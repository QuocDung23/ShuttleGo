export type VenueStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export type VenuePriceRuleInput = {
  label: 'Giờ thường' | 'Giờ cao điểm';
  startTime: string;
  endTime: string;
  pricePerHour: number;
};

export type CreateVenueInput = {
  name: string;
  address: string;
  district: string;
  city: string;
  phone?: string | null;
  description?: string | null;
  coverImageUrl?: string | null;
  weekendSurcharge?: number;
  bankName?: string | null;
  bankAccountNo?: string | null;
  bankAccountHolder?: string | null;
  bankQrImageUrl?: string | null;
  amenityIds?: number[];
  priceRules: [VenuePriceRuleInput, VenuePriceRuleInput];
};

export type Amenity = {
  id: number;
  name: string;
};

export type PriceRule = {
  id: number;
  venueId: number;
  label: string;
  startTime: string;
  endTime: string;
  pricePerHour: number;
};

export type Court = {
  id: number;
  venueId: number;
  name: string;
  isActive?: boolean;
};

export type Venue = {
  id: number;
  ownerId: number;
  name: string;
  address: string;
  district: string;
  city: string;
  phone: string | null;
  description: string | null;
  coverImageUrl: string | null;
  weekendSurcharge: number;
  bankName: string | null;
  bankAccountNo: string | null;
  bankAccountHolder: string | null;
  bankQrImageUrl: string | null;
  status: VenueStatus;
  reviewedBy: number | null;
  reviewedAt: string | null;
  reviewNote: string | null;
  createdAt: string;
  updatedAt: string;
  amenities?: Amenity[];
  priceRules?: PriceRule[];
  courts?: Court[];
};

export type Paginated<T> = {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type OwnerVenueStatusItem = {
  id: number;
  name: string;
  status: VenueStatus;
  reviewNote: string | null;
  reviewedAt: string | null;
  updatedAt: string;
};

export type OwnerVenuesResponse = {
  data: OwnerVenueStatusItem[];
};

export type OwnerVenueAccessState = 'none' | 'pending' | 'approved' | 'rejected' | 'suspended';

export function resolveOwnerVenueAccessState(items: OwnerVenueStatusItem[]): OwnerVenueAccessState {
  if (items.length === 0) return 'none';
  const statuses = items.map((i) => i.status);
  if (statuses.includes('approved')) return 'approved';
  if (statuses.includes('pending')) return 'pending';
  if (statuses.includes('rejected')) return 'rejected';
  if (statuses.includes('suspended')) return 'suspended';
  return 'none';
}
