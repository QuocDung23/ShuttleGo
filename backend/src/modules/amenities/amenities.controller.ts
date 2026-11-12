import type { Request, Response } from 'express';
import { parseId } from '@/common/validation.js';
import { createAmenitySchema, updateAmenitySchema } from '@/modules/amenities/amenities.schema.js';
import * as service from '@/modules/amenities/amenities.service.js';
import { renderCreated, renderNoContent, renderOk } from '@/views/json.view.js';

export async function index(_req: Request, res: Response) {
  renderOk(res, await service.findAll());
}

export async function show(req: Request, res: Response) {
  renderOk(res, await service.findOne(parseId(req.params.id)));
}

export async function create(req: Request, res: Response) {
  renderCreated(res, await service.create(createAmenitySchema.parse(req.body)));
}

export async function update(req: Request, res: Response) {
  renderOk(res, await service.update(parseId(req.params.id), updateAmenitySchema.parse(req.body)));
}

export async function remove(req: Request, res: Response) {
  await service.remove(parseId(req.params.id));
  renderNoContent(res);
}
