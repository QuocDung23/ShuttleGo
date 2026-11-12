import { Router } from 'express';
import { authenticate, requireRole } from '@/common/auth.js';
import { UserRole } from '@/common/enums.js';
import * as controller from '@/modules/notifications/notifications.controller.js';

export const notificationsRouter = Router();

notificationsRouter.use(authenticate);

notificationsRouter.get('/', controller.index);

/** Body: { userId } — marks all of the user's unread notifications as read. */
notificationsRouter.patch('/read-all', controller.markAllRead);
notificationsRouter.get('/:id', controller.show);

/** System-generated notifications are created by admins. */
notificationsRouter.post('/', requireRole(UserRole.ADMIN), controller.create);
notificationsRouter.patch('/:id', controller.update);
notificationsRouter.delete('/:id', controller.remove);
