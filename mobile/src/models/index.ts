// ===== MODEL: kiểu dữ liệu khớp với API / bảng trong CSDL =====
export type Role = 'PLAYER' | 'OWNER';
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';
export type SlotStatus = 'FREE' | 'PENDING' | 'BOOKED' | 'PAST';
export type DayType = 'WEEKDAY' | 'WEEKEND' | 'ALL';

export interface User { id: string; fullName: string; email: string; phone: string | null; avatarUrl: string | null; role: Role }
export interface AuthResult { user: User; token: string }

export interface Court { id: string; name: string; isActive: boolean }
export interface PriceRule { id: string; dayType: DayType; startTime: string; endTime: string; pricePerSlot: number }
export interface Venue {
  id: string; ownerId: string; name: string; description: string | null; address: string; district: string | null; city: string;
  latitude: number | null; longitude: number | null; phone: string | null; openTime: string; closeTime: string; isActive: boolean;
  minPrice: number | null; avgRating: number | null; reviewCount: number; courtCount: number; amenities: string[]; coverImage: string | null;
}
export interface VenueDetail extends Venue { courts: Court[]; images: { id: string; url: string }[]; priceRules: PriceRule[] }
export type VenueInput = Partial<Pick<Venue, 'name' | 'description' | 'address' | 'district' | 'phone' | 'openTime' | 'closeTime' | 'latitude' | 'longitude' | 'isActive'>> & { amenities?: string[] };
export interface Amenity { code: string; name: string }

export interface GridSlot { startTime: string; endTime: string; price: number | null; status: SlotStatus }
export interface Availability { venueId: string; playDate: string; hours: string[]; courts: (Pick<Court, 'id' | 'name'> & { slots: GridSlot[] })[] }

export interface BookingSlot { id: string; courtId: string; courtName: string; startTime: string; endTime: string; price: number }
export interface Payment { status: 'UNPAID' | 'PAID' | 'REFUNDED'; amount: number; paidAt: string | null }
export interface Booking {
  id: string; code: string; userId: string; venueId: string; venueName: string; venueAddress: string; userName: string; userPhone: string | null;
  playDate: string; status: BookingStatus; totalAmount: number; note: string | null; rejectReason: string | null;
  slots: BookingSlot[]; payment: Payment; paymentQr?: string; reviewed: boolean; createdAt: string;
}
export interface CreateBookingInput { venueId: string; playDate: string; note?: string; slots: { courtId: string; startTime: string }[] }

export interface AppNotification { id: string; type: string; title: string; body: string; bookingId: string | null; isRead: boolean; createdAt: string }
