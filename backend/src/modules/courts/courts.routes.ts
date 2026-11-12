import { Router } from 'express';
import { authenticate, requireRole } from '@/common/auth.js';
import { UserRole } from '@/common/enums.js';
import * as controller from '@/modules/courts/courts.controller.js';

export const courtsRouter = Router();

const ownerOrAdmin = [authenticate, requireRole(UserRole.OWNER, UserRole.ADMIN)];

courtsRouter.get('/', controller.index);
courtsRouter.get('/:id', controller.show);
courtsRouter.post('/', ...ownerOrAdmin, controller.create);
courtsRouter.patch('/:id', ...ownerOrAdmin, controller.update);
courtsRouter.delete('/:id', ...ownerOrAdmin, controller.remove);
