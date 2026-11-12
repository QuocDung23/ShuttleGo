import type { Request, Response } from 'express';
import { loginSchema, registerSchema } from '@/modules/auth/auth.schema.js';
import * as service from '@/modules/auth/auth.service.js';
import { findOne as findUser } from '@/modules/users/users.service.js';
import { renderCreated, renderOk } from '@/views/json.view.js';

export async function register(req: Request, res: Response) {
  renderCreated(res, await service.register(registerSchema.parse(req.body)));
}

export async function login(req: Request, res: Response) {
  renderOk(res, await service.login(loginSchema.parse(req.body)));
}

export async function me(req: Request, res: Response) {
  renderOk(res, await findUser(req.user!.id));
}
