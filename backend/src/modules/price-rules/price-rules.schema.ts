import { z } from 'zod';
import { idParam, queryId, timeString } from '../../common/validation.js';

export const createPriceRuleSchema = z.object({
  venueId: idParam,
  /** e.g. "Giờ thường", "Giờ vàng" */
  label: z.string().trim().min(1).max(100),
  startTime: timeString,
  endTime: timeString,
  /** VND per hour */
  pricePerHour: z.number().int().min(0),
});

export const updatePriceRuleSchema = createPriceRuleSchema.omit({ venueId: true }).partial();

export const queryPriceRulesSchema = z.object({ venueId: queryId });

export type CreatePriceRuleInput = z.infer<typeof createPriceRuleSchema>;
export type UpdatePriceRuleInput = z.infer<typeof updatePriceRuleSchema>;
export type QueryPriceRulesInput = z.infer<typeof queryPriceRulesSchema>;
