export enum UserRole {
  PLAYER = 'player',
  OWNER = 'owner',
  ADMIN = 'admin',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BANNED = 'banned',
}

export enum VenueStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SUSPENDED = 'suspended',
}

/** Where the booking came from: player booked in the app, or owner entered it manually. */
export enum BookingSource {
  APP = 'app',
  OWNER = 'owner',
}

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum PaymentMethod {
  CASH = 'cash',
  BANK_TRANSFER = 'bank_transfer',
}

export enum PaymentStatus {
  UNPAID = 'unpaid',
  /** Player uploaded a transfer proof, waiting for the owner to verify. */
  PENDING_VERIFICATION = 'pending_verification',
  PAID = 'paid',
  REFUNDED = 'refunded',
}

export enum NotificationType {
  BOOKING_CREATED = 'booking_created',
  BOOKING_CONFIRMED = 'booking_confirmed',
  BOOKING_CANCELLED = 'booking_cancelled',
  BOOKING_REMINDER = 'booking_reminder',
  PAYMENT_RECEIVED = 'payment_received',
  VENUE_APPROVED = 'venue_approved',
  VENUE_REJECTED = 'venue_rejected',
  REPORT_UPDATED = 'report_updated',
  SYSTEM = 'system',
}

export enum ReportStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  REJECTED = 'rejected',
}
