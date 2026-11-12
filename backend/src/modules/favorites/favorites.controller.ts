import type { Request, Response } from 'express';
import { assertSelfOrAdmin } from '@/common/auth.js';
import { UserRole } from '@/common/enums.js';
import { parseId } from '@/common/validation.js';
import { createFavoriteSchema, queryFavoritesSchema } from '@/modules/favorites/favorites.schema.js';
import * as service from '@/modules/favorites/favorites.service.js';
import { renderCreated, renderNoContent, renderOk } from '@/views/json.view.js';

export async function index(req: Request, res: Response) {
  const query = queryFavoritesSchema.parse(req.query);
  if (req.user!.role !== UserRole.ADMIN) query.userId = req.user!.id;
  renderOk(res, await service.findAll(query));
}

export async function create(req: Request, res: Response) {
  const input = createFavoriteSchema.parse(req.body);
  if (req.user!.role !== UserRole.ADMIN) input.userId = req.user!.id;
  renderCreated(res, await service.create(input));
}

export async function remove(req: Request, res: Response) {
  const userId = parseId(req.params.userId, 'userId');
  const venueId = parseId(req.params.venueId, 'venueId');
  assertSelfOrAdmin(userId, req.user!);
  await service.remove(userId, venueId);
  renderNoContent(res);
}
