import { Router } from 'express';
import { assertSelfOrAdmin, authenticate } from '@/common/auth.js';
import { UserRole } from '@/common/enums.js';
import { parseId } from '@/common/validation.js';
import { createFavoriteSchema, queryFavoritesSchema } from '@/modules/favorites/favorites.schema.js';
import * as service from '@/modules/favorites/favorites.service.js';

export const favoritesRouter = Router();

favoritesRouter.use(authenticate);

favoritesRouter.get('/', async (req, res) => {
  const query = queryFavoritesSchema.parse(req.query);
  if (req.user!.role !== UserRole.ADMIN) query.userId = req.user!.id;
  res.json(await service.findAll(query));
});

favoritesRouter.post('/', async (req, res) => {
  const input = createFavoriteSchema.parse(req.body);
  if (req.user!.role !== UserRole.ADMIN) input.userId = req.user!.id;
  res.status(201).json(await service.create(input));
});

favoritesRouter.delete('/:userId/:venueId', async (req, res) => {
  const userId = parseId(req.params.userId, 'userId');
  const venueId = parseId(req.params.venueId, 'venueId');
  assertSelfOrAdmin(userId, req.user!);
  await service.remove(userId, venueId);
  res.status(204).end();
});
