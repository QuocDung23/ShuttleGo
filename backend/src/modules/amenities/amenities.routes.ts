import { Router } from 'express';
import { parseId } from '../../common/validation.js';
import { createAmenitySchema, updateAmenitySchema } from './amenities.schema.js';
import * as service from './amenities.service.js';

export const amenitiesRouter = Router();

amenitiesRouter.get('/', async (_req, res) => {
  res.json(await service.findAll());
});

amenitiesRouter.get('/:id', async (req, res) => {
  res.json(await service.findOne(parseId(req.params.id)));
});

amenitiesRouter.post('/', async (req, res) => {
  res.status(201).json(await service.create(createAmenitySchema.parse(req.body)));
});

amenitiesRouter.patch('/:id', async (req, res) => {
  res.json(await service.update(parseId(req.params.id), updateAmenitySchema.parse(req.body)));
});

amenitiesRouter.delete('/:id', async (req, res) => {
  await service.remove(parseId(req.params.id));
  res.status(204).end();
});
