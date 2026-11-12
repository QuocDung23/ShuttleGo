import type { Request, Response } from 'express';
import { parseId } from '@/common/validation.js';
import { createUserSchema, queryUsersSchema, updateUserSchema } from '@/modules/users/users.schema.js';
import * as service from '@/modules/users/users.service.js';
import { renderCreated, renderNoContent, renderOk } from '@/views/json.view.js';

export async function index(req: Request, res: Response) {
  renderOk(res, await service.findAll(queryUsersSchema.parse(req.query)));
}

export async function show(req: Request, res: Response) {
  renderOk(res, await service.findOne(parseId(req.params.id)));
}

export async function create(req: Request, res: Response) {
  renderCreated(res, await service.create(createUserSchema.parse(req.body)));
}

export async function update(req: Request, res: Response) {
  renderOk(res, await service.update(parseId(req.params.id), updateUserSchema.parse(req.body)));
}

export async function remove(req: Request, res: Response) {
  await service.remove(parseId(req.params.id));
  renderNoContent(res);
}
