import { z } from 'zod';
import { idParam, pagination, queryId } from '../../common/validation.js';

export const createFavoriteSchema = z.object({
  userId: idParam,
  venueId: idParam,
});

export const queryFavoritesSchema = z.object({
  ...pagination,
  userId: queryId,
  venueId: queryId,
});

export type CreateFavoriteInput = z.infer<typeof createFavoriteSchema>;
export type QueryFavoritesInput = z.infer<typeof queryFavoritesSchema>;
