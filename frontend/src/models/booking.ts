export type PendingBooking = {
  id: string;
  customerName: string;
  time: string;
  details: string;
};

export type BookingHistoryItem = PendingBooking & {
  status: "Chờ duyệt" | "Đã xác nhận" | "Hoàn tất" | "Đã hủy";
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
  status: "pending" | "confirmed" | "completed" | "cancelled";
  paymentMethod: string | null;
  paymentStatus: string;
  proofImageUrl: string | null;
  holdExpiresAt?: string | null;
  paidAt: string | null;
  confirmedAt: string | null;
  cancelledAt: string | null;
  cancelReason: string | null;
  createdAt: string;
  updatedAt: string;
  court?: { id: number; name: string; venueId: number };
  player?: { id: number; fullName: string; phone: string } | null;
};
