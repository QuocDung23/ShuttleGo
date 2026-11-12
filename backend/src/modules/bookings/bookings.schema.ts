import { z } from 'zod';
import {
  BookingSource,
  BookingStatus,
  PaymentMethod,
  PaymentStatus,
} from '../../common/enums.js';
import { dateString, idParam, pagination, queryId, timeString } from '../../common/validation.js';
import { phoneString } from '../users/users.schema.js';

export const createBookingSchema = z.object({
  courtId: idParam,
  /** null for walk-in customers without an account */
  playerId: idParam.nullable().optional(),
  /** user who created the booking (player or owner) */
  createdBy: idParam,
  source: z.enum(BookingSource).optional(),
  contactName: z.string().trim().min(1).max(100),
  contactPhone: phoneString,
  /** YYYY-MM-DD */
  bookingDate: dateString,
  startTime: timeString,
  endTime: timeString,
  /** VND */
  totalAmount: z.number().int().min(0),
  status: z.enum(BookingStatus).optional(),
  paymentMethod: z.enum(PaymentMethod).optional(),
  paymentStatus: z.enum(PaymentStatus).optional(),
  proofImageUrl: z.string().nullable().optional(),
  /** ISO datetime; a pending booking holds the slot until then */
  holdExpiresAt: z.coerce.date().nullable().optional(),
});

export const updateBookingSchema = createBookingSchema
  .omit({ createdBy: true })
  .extend({
    cancelReason: z.string().max(255).nullable().optional(),
    cancelledBy: idParam.nullable().optional(),
  })
  .partial();

export const queryBookingsSchema = z.object({
  ...pagination,
  courtId: queryId,
  venueId: queryId,
  playerId: queryId,
  createdBy: queryId,
  status: z.enum(BookingStatus).optional(),
  paymentStatus: z.enum(PaymentStatus).optional(),
  code: z.string().trim().min(1).optional(),
  /** exact date */
  date: dateString.optional(),
  /** date range (inclusive) */
  from: dateString.optional(),
  to: dateString.optional(),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingInput = z.infer<typeof updateBookingSchema>;
export type QueryBookingsInput = z.infer<typeof queryBookingsSchema>;
