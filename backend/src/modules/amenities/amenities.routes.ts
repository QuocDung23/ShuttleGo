import { Router } from 'express';
import { authenticate, requireRole } from '@/common/auth.js';
import { UserRole } from '@/common/enums.js';
import { parseId } from '@/common/validation.js';
import { createAmenitySchema, updateAmenitySchema } from '@/modules/amenities/amenities.schema.js';
import * as service from '@/modules/amenities/amenities.service.js';

export const amenitiesRouter = Router();

const adminOnly = [authenticate, requireRole(UserRole.ADMIN)];

amenitiesRouter.get('/', async (_req, res) => {
  res.json(await service.findAll());
});

amenitiesRouter.get('/:id', async (req, res) => {
  res.json(await service.findOne(parseId(req.params.id)));
});

amenitiesRouter.post('/', ...adminOnly, async (req, res) => {
  res.status(201).json(await service.create(createAmenitySchema.parse(req.body)));
});

amenitiesRouter.patch('/:id', ...adminOnly, async (req, res) => {
  res.json(await service.update(parseId(req.params.id), updateAmenitySchema.parse(req.body)));
});

amenitiesRouter.delete('/:id', ...adminOnly, async (req, res) => {
  await service.remove(parseId(req.params.id));
  res.status(204).end();
});
