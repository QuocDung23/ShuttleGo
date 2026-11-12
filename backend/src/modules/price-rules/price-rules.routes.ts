import { Router } from 'express';
import { authenticate, requireRole } from '@/common/auth.js';
import { UserRole } from '@/common/enums.js';
import * as controller from '@/modules/price-rules/price-rules.controller.js';

export const priceRulesRouter = Router();

const ownerOrAdmin = [authenticate, requireRole(UserRole.OWNER, UserRole.ADMIN)];

priceRulesRouter.get('/', controller.index);
priceRulesRouter.get('/:id', controller.show);
priceRulesRouter.post('/', ...ownerOrAdmin, controller.create);
priceRulesRouter.patch('/:id', ...ownerOrAdmin, controller.update);
priceRulesRouter.delete('/:id', ...ownerOrAdmin, controller.remove);
