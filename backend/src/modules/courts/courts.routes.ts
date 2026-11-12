import { Router } from 'express';
import { authenticate, requireRole } from '@/common/auth.js';
import { UserRole } from '@/common/enums.js';
import { parseId } from '@/common/validation.js';
import { createCourtSchema, queryCourtsSchema, updateCourtSchema } from '@/modules/courts/courts.schema.js';
import * as service from '@/modules/courts/courts.service.js';

export const courtsRouter = Router();

const ownerOrAdmin = [authenticate, requireRole(UserRole.OWNER, UserRole.ADMIN)];

courtsRouter.get('/', async (req, res) => {
  res.json(await service.findAll(queryCourtsSchema.parse(req.query)));
});

courtsRouter.get('/:id', async (req, res) => {
  res.json(await service.findOne(parseId(req.params.id)));
});

courtsRouter.post('/', ...ownerOrAdmin, async (req, res) => {
  res.status(201).json(await service.create(createCourtSchema.parse(req.body), req.user!));
});

courtsRouter.patch('/:id', ...ownerOrAdmin, async (req, res) => {
  res.json(await service.update(parseId(req.params.id), updateCourtSchema.parse(req.body), req.user!));
});

courtsRouter.delete('/:id', ...ownerOrAdmin, async (req, res) => {
  await service.remove(parseId(req.params.id), req.user!);
  res.status(204).end();
});
