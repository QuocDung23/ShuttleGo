import { Router } from 'express';
import { authenticate, requireRole } from '@/common/auth.js';
import { UserRole } from '@/common/enums.js';
import * as controller from '@/modules/amenities/amenities.controller.js';

export const amenitiesRouter = Router();

const adminOnly = [authenticate, requireRole(UserRole.ADMIN)];

amenitiesRouter.get('/', controller.index);
amenitiesRouter.get('/:id', controller.show);
amenitiesRouter.post('/', ...adminOnly, controller.create);
amenitiesRouter.patch('/:id', ...adminOnly, controller.update);
amenitiesRouter.delete('/:id', ...adminOnly, controller.remove);
