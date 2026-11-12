import { Router } from 'express';
import { authenticate, requireRole } from '@/common/auth.js';
import { UserRole } from '@/common/enums.js';
import * as controller from '@/modules/users/users.controller.js';

export const usersRouter = Router();

// User management is admin-only; users manage their own profile via /auth/me.
usersRouter.use(authenticate, requireRole(UserRole.ADMIN));

usersRouter.get('/', controller.index);
usersRouter.get('/:id', controller.show);
usersRouter.post('/', controller.create);
usersRouter.patch('/:id', controller.update);
usersRouter.delete('/:id', controller.remove);
