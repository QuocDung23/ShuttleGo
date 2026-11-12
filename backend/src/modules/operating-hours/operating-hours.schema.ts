import { z } from 'zod';
import { timeString, timeToMinutes } from '@/common/validation.js';

/** 0 = Sunday, 1 = Monday, ... 6 = Saturday */
export const dayOfWeek = z.coerce.number().int().min(0).max(6);

const hourFields = z
  .object({
    isOpen: z.boolean().default(true),
    openTime: timeString.nullable().optional(),
    closeTime: timeString.nullable().optional(),
  })
  .superRefine((v, ctx) => {
    if (!v.isOpen) return;
    if (!v.openTime || !v.closeTime) {
      ctx.addIssue({ code: 'custom', message: 'openTime and closeTime are required when isOpen is true' });
    } else if (timeToMinutes(v.closeTime) <= timeToMinutes(v.openTime)) {
      ctx.addIssue({ code: 'custom', path: ['closeTime'], message: 'closeTime must be after openTime' });
    }
  });

/** PUT /venues/:venueId/operating-hours/:dayOfWeek */
export const upsertDaySchema = hourFields;

/** PUT /venues/:venueId/operating-hours — replaces the whole week */
export const replaceWeekSchema = z.object({
  hours: z
    .array(z.object({ dayOfWeek }).and(hourFields))
    .max(7)
    .refine(
      (hs) => new Set(hs.map((h) => h.dayOfWeek)).size === hs.length,
      'dayOfWeek must be unique',
    ),
});

export type UpsertDayInput = z.infer<typeof upsertDaySchema>;
export type ReplaceWeekInput = z.infer<typeof replaceWeekSchema>;
