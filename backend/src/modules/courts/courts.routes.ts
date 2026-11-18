import { Router } from 'express';
import { authenticate, requireRole } from '@/common/auth.js';
import { UserRole } from '@/common/enums.js';
import { requireApprovedOwnerVenue } from '@/modules/venues/owner-approval.middleware.js';
import * as controller from '@/modules/courts/courts.controller.js';

export const courtsRouter = Router();

const ownerOrAdmin = [authenticate, requireRole(UserRole.OWNER, UserRole.ADMIN)];
const ownerManager = [...ownerOrAdmin, requireApprovedOwnerVenue];

courtsRouter.get('/', controller.index);
courtsRouter.get('/:id', controller.show);
courtsRouter.post('/', ...ownerManager, controller.create);
courtsRouter.patch('/:id', ...ownerManager, controller.update);
courtsRouter.delete('/:id', ...ownerManager, controller.remove);
