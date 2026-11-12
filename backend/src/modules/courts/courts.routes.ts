import { Router } from 'express';
import { parseId } from '../../common/validation.js';
import { createCourtSchema, queryCourtsSchema, updateCourtSchema } from './courts.schema.js';
import * as service from './courts.service.js';

export const courtsRouter = Router();

courtsRouter.get('/', async (req, res) => {
  res.json(await service.findAll(queryCourtsSchema.parse(req.query)));
});

courtsRouter.get('/:id', async (req, res) => {
  res.json(await service.findOne(parseId(req.params.id)));
});

courtsRouter.post('/', async (req, res) => {
  res.status(201).json(await service.create(createCourtSchema.parse(req.body)));
});

courtsRouter.patch('/:id', async (req, res) => {
  res.json(await service.update(parseId(req.params.id), updateCourtSchema.parse(req.body)));
});

courtsRouter.delete('/:id', async (req, res) => {
  await service.remove(parseId(req.params.id));
  res.status(204).end();
});
