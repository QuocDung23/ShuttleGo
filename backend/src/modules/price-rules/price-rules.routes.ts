import { Router } from 'express';
import { authenticate, requireRole } from '@/common/auth.js';
import { UserRole } from '@/common/enums.js';
import { requireApprovedOwnerVenue } from '@/modules/venues/owner-approval.middleware.js';
import * as controller from '@/modules/price-rules/price-rules.controller.js';

export const priceRulesRouter = Router();

const ownerOrAdmin = [authenticate, requireRole(UserRole.OWNER, UserRole.ADMIN)];
const ownerManager = [...ownerOrAdmin, requireApprovedOwnerVenue];

priceRulesRouter.get('/', controller.index);
priceRulesRouter.get('/:id', controller.show);
priceRulesRouter.post('/', ...ownerManager, controller.create);
priceRulesRouter.patch('/:id', ...ownerManager, controller.update);
priceRulesRouter.delete('/:id', ...ownerManager, controller.remove);
