import { z } from 'zod';
import { idParam, queryBoolean, queryId } from '@/common/validation.js';

export const createCourtSchema = z.object({
  venueId: idParam,
  name: z.string().trim().min(1).max(100),
  isActive: z.boolean().optional(),
});

/** A court can't move to another venue */
export const updateCourtSchema = createCourtSchema.omit({ venueId: true }).partial();

export const queryCourtsSchema = z.object({
  venueId: queryId,
  isActive: queryBoolean.optional(),
});

export type CreateCourtInput = z.infer<typeof createCourtSchema>;
export type UpdateCourtInput = z.infer<typeof updateCourtSchema>;
export type QueryCourtsInput = z.infer<typeof queryCourtsSchema>;
