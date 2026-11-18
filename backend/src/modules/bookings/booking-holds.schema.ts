import { z } from 'zod';
import { dateString, idParam, timeString } from '@/common/validation.js';

export const selectBookingHoldSchema = z.object({
  courtId: idParam,
  bookingDate: dateString,
  startTime: timeString,
  endTime: timeString,
});

export type SelectBookingHoldInput = z.infer<typeof selectBookingHoldSchema>;
