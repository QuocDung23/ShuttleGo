import { Router } from 'express';
import { authenticate } from '@/common/auth.js';
import * as controller from '@/modules/favorites/favorites.controller.js';

export const favoritesRouter = Router();

favoritesRouter.use(authenticate);

favoritesRouter.get('/', controller.index);
favoritesRouter.post('/', controller.create);
favoritesRouter.delete('/:userId/:venueId', controller.remove);
