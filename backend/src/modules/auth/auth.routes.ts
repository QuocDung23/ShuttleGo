import { Router } from 'express';
import { authenticate } from '@/common/auth.js';
import { findOne } from '@/modules/users/users.service.js';
import { loginSchema, registerSchema } from '@/modules/auth/auth.schema.js';
import * as service from '@/modules/auth/auth.service.js';

export const authRouter = Router();

/** Self-service registration (players and owners). */
authRouter.post('/register', async (req, res) => {
  res.status(201).json(await service.register(registerSchema.parse(req.body)));
});

authRouter.post('/login', async (req, res) => {
  res.json(await service.login(loginSchema.parse(req.body)));
});

/** Current authenticated user. */
authRouter.get('/me', authenticate, async (req, res) => {
  res.json(await findOne(req.user!.id));
});
