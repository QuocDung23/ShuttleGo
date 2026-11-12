import { Router } from 'express';
import { parseId } from '../../common/validation.js';
import { createReportSchema, queryReportsSchema, updateReportSchema } from './reports.schema.js';
import * as service from './reports.service.js';

export const reportsRouter = Router();

reportsRouter.get('/', async (req, res) => {
  res.json(await service.findAll(queryReportsSchema.parse(req.query)));
});

reportsRouter.get('/:id', async (req, res) => {
  res.json(await service.findOne(parseId(req.params.id)));
});

reportsRouter.post('/', async (req, res) => {
  res.status(201).json(await service.create(createReportSchema.parse(req.body)));
});

reportsRouter.patch('/:id', async (req, res) => {
  res.json(await service.update(parseId(req.params.id), updateReportSchema.parse(req.body)));
});

reportsRouter.delete('/:id', async (req, res) => {
  await service.remove(parseId(req.params.id));
  res.status(204).end();
});
