import type { Request, Response } from 'express';
import { selectBookingHoldSchema } from '@/modules/bookings/booking-holds.schema.js';
import * as service from '@/modules/bookings/booking-holds.service.js';
import { renderCreated, renderNoContent, renderOk } from '@/views/json.view.js';

export async function mine(req: Request, res: Response) {
  renderOk(res, await service.findMine(req.user!));
}

export async function select(req: Request, res: Response) {
  renderCreated(res, await service.select(selectBookingHoldSchema.parse(req.body), req.user!));
}

export async function release(req: Request, res: Response) {
  await service.releaseMine(req.user!);
  renderNoContent(res);
}
