import { Router } from 'express';
import { parseId } from '../../common/validation.js';
import {
  createPriceRuleSchema,
  queryPriceRulesSchema,
  updatePriceRuleSchema,
} from './price-rules.schema.js';
import * as service from './price-rules.service.js';

export const priceRulesRouter = Router();

priceRulesRouter.get('/', async (req, res) => {
  res.json(await service.findAll(queryPriceRulesSchema.parse(req.query)));
});

priceRulesRouter.get('/:id', async (req, res) => {
  res.json(await service.findOne(parseId(req.params.id)));
});

priceRulesRouter.post('/', async (req, res) => {
  res.status(201).json(await service.create(createPriceRuleSchema.parse(req.body)));
});

priceRulesRouter.patch('/:id', async (req, res) => {
  res.json(await service.update(parseId(req.params.id), updatePriceRuleSchema.parse(req.body)));
});

priceRulesRouter.delete('/:id', async (req, res) => {
  await service.remove(parseId(req.params.id));
  res.status(204).end();
});
