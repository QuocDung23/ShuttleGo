import { Router } from 'express';
import { authenticate } from '@/common/auth.js';
import * as controller from '@/modules/auth/auth.controller.js';

export const authRouter = Router();

/** Self-service registration (players and owners). */
authRouter.post('/register', controller.register);
authRouter.post('/login', controller.login);

/** Current authenticated user. */
authRouter.get('/me', authenticate, controller.me);
