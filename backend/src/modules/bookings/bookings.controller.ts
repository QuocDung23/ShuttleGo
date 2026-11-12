import type { Request, Response } from 'express';
import { parseId } from '@/common/validation.js';
import { createBookingSchema, queryBookingsSchema, updateBookingSchema } from '@/modules/bookings/bookings.schema.js';
import * as service from '@/modules/bookings/bookings.service.js';
import { renderCreated, renderNoContent, renderOk } from '@/views/json.view.js';

export async function index(req: Request, res: Response) {
  renderOk(res, await service.findAll(queryBookingsSchema.parse(req.query), req.user!));
}

export async function show(req: Request, res: Response) {
  renderOk(res, await service.findOne(parseId(req.params.id), req.user!));
}

export async function create(req: Request, res: Response) {
  renderCreated(res, await service.create(createBookingSchema.parse(req.body), req.user!));
}

export async function update(req: Request, res: Response) {
  renderOk(
    res,
    await service.update(parseId(req.params.id), updateBookingSchema.parse(req.body), req.user!),
  );
}

export async function remove(req: Request, res: Response) {
  await service.remove(parseId(req.params.id), req.user!);
  renderNoContent(res);
}
