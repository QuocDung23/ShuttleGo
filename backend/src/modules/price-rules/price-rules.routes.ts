import { Router } from 'express';
import { authenticate, requireRole } from '@/common/auth.js';
import { UserRole } from '@/common/enums.js';
import { parseId } from '@/common/validation.js';
import {
  createPriceRuleSchema,
  queryPriceRulesSchema,
  updatePriceRuleSchema,
} from '@/modules/price-rules/price-rules.schema.js';
import * as service from '@/modules/price-rules/price-rules.service.js';

export const priceRulesRouter = Router();

const ownerOrAdmin = [authenticate, requireRole(UserRole.OWNER, UserRole.ADMIN)];

priceRulesRouter.get('/', async (req, res) => {
  res.json(await service.findAll(queryPriceRulesSchema.parse(req.query)));
});

priceRulesRouter.get('/:id', async (req, res) => {
  res.json(await service.findOne(parseId(req.params.id)));
});

priceRulesRouter.post('/', ...ownerOrAdmin, async (req, res) => {
  res.status(201).json(await service.create(createPriceRuleSchema.parse(req.body), req.user!));
});

priceRulesRouter.patch('/:id', ...ownerOrAdmin, async (req, res) => {
  res.json(await service.update(parseId(req.params.id), updatePriceRuleSchema.parse(req.body), req.user!));
});

priceRulesRouter.delete('/:id', ...ownerOrAdmin, async (req, res) => {
  await service.remove(parseId(req.params.id), req.user!);
  res.status(204).end();
});
