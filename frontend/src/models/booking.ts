export type PendingBooking = {
  id: string;
  customerName: string;
  time: string;
  details: string;
};

export type BookingHistoryItem = PendingBooking & {
  status: "Chờ duyệt" | "Đã xác nhận" | "Hoàn tất" | "Đã hủy" | "Hết hạn giữ chỗ";
};

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
export type BookingPaymentStatus = 'unpaid' | 'pending_verification' | 'paid' | 'refunded';
export type BookingPaymentMethod = 'cash' | 'bank_transfer';

/** Only the venue fields a player needs on the confirm/success screens. */
export type BookingVenue = {
  id: number;
  name: string;
  address: string | null;
  district: string | null;
  city: string | null;
  bankName: string | null;
  bankAccountNo: string | null;
  bankAccountHolder: string | null;
  bankQrImageUrl: string | null;
};

export type OccupiedRange = {
  startTime: string;
  endTime: string;
};

export type BookingHold = {
  id: number;
  courtId: number;
  bookingDate: string;
  startTime: string;
  endTime: string;
  expiresAt: string;
};

export type CourtAvailability = {
  id: number;
  name: string;
  occupiedRanges: OccupiedRange[];
  heldRanges: OccupiedRange[];
  checkoutRanges: OccupiedRange[];
};

/** Public GET /venues/:venueId/availability response — never contains customer PII. */
export type VenueAvailability = {
  venueId: number;
  date: string;
  isOpen: boolean;
  openTime: string | null;
  closeTime: string | null;
  courts: CourtAvailability[];
};

export type CreateBookingInput = {
  courtId: number;
  contactName: string;
  contactPhone: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  totalAmount: number;
  paymentMethod: BookingPaymentMethod;
};

/** Raw booking shape returned by GET /bookings (with court + player relations). */
export type ApiBooking = {
  id: number;
  code: string;
  courtId: number;
  playerId: number | null;
  createdBy: number | null;
  source: string;
  contactName: string;
  contactPhone: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  totalAmount: number;
  status: BookingStatus;
  paymentMethod: BookingPaymentMethod | null;
  paymentStatus: BookingPaymentStatus;
  proofImageUrl: string | null;
  holdExpiresAt?: string | null;
  paidAt: string | null;
  confirmedAt: string | null;
  cancelledAt: string | null;
  cancelReason: string | null;
  createdAt: string;
  updatedAt: string;
  court?: {
    id: number;
    name: string;
    venueId: number;
    venue?: BookingVenue;
  };
  player?: { id: number; fullName: string; phone: string } | null;
};
