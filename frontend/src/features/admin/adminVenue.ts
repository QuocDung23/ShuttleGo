export type AdminVenueStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export type AdminVenue = {
  id: number;
  ownerId: number;
  name: string;
  address: string;
  district: string;
  city: string;
  phone: string | null;
  description: string | null;
  coverImageUrl: string | null;
  status: AdminVenueStatus;
  reviewNote: string | null;
  createdAt: string;
  priceRules?: { pricePerHour: number }[];
  courts?: { id: number }[];
  amenities?: { id: number; name: string }[];
  owner?: { id: number; fullName: string; phone: string };
};
