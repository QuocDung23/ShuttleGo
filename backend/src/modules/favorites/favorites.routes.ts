import { Router } from 'express';
import { parseId } from '../../common/validation.js';
import { createFavoriteSchema, queryFavoritesSchema } from './favorites.schema.js';
import * as service from './favorites.service.js';

export const favoritesRouter = Router();

favoritesRouter.get('/', async (req, res) => {
  res.json(await service.findAll(queryFavoritesSchema.parse(req.query)));
});

favoritesRouter.post('/', async (req, res) => {
  res.status(201).json(await service.create(createFavoriteSchema.parse(req.body)));
});

favoritesRouter.delete('/:userId/:venueId', async (req, res) => {
  await service.remove(parseId(req.params.userId, 'userId'), parseId(req.params.venueId, 'venueId'));
  res.status(204).end();
});
