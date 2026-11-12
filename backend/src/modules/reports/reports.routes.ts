import { Router } from 'express';
import { authenticate, requireRole } from '@/common/auth.js';
import { UserRole } from '@/common/enums.js';
import * as controller from '@/modules/reports/reports.controller.js';

export const reportsRouter = Router();

reportsRouter.use(authenticate);

reportsRouter.get('/', controller.index);
reportsRouter.get('/:id', controller.show);

/** Any authenticated user can report; the reporter is always the current user. */
reportsRouter.post('/', controller.create);

/** Only admins handle reports. */
reportsRouter.patch('/:id', requireRole(UserRole.ADMIN), controller.update);
reportsRouter.delete('/:id', requireRole(UserRole.ADMIN), controller.remove);
