import { Router } from 'express';
import { authenticate, requireRole } from '@/common/auth.js';
import { UserRole } from '@/common/enums.js';
import { parseId } from '@/common/validation.js';
import { createUserSchema, queryUsersSchema, updateUserSchema } from '@/modules/users/users.schema.js';
import * as service from '@/modules/users/users.service.js';

export const usersRouter = Router();

// User management is admin-only; users manage their own profile via /auth/me.
usersRouter.use(authenticate, requireRole(UserRole.ADMIN));

usersRouter.get('/', async (req, res) => {
  res.json(await service.findAll(queryUsersSchema.parse(req.query)));
});

usersRouter.get('/:id', async (req, res) => {
  res.json(await service.findOne(parseId(req.params.id)));
});

usersRouter.post('/', async (req, res) => {
  res.status(201).json(await service.create(createUserSchema.parse(req.body)));
});

usersRouter.patch('/:id', async (req, res) => {
  res.json(await service.update(parseId(req.params.id), updateUserSchema.parse(req.body)));
});

usersRouter.delete('/:id', async (req, res) => {
  await service.remove(parseId(req.params.id));
  res.status(204).end();
});
