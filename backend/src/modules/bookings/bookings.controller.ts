import type { Request, Response } from 'express';
import { UserRole } from '@/common/enums.js';
import { parseId } from '@/common/validation.js';
import {
  claimPaymentSchema,
  createBookingSchema,
  queryBookingsSchema,
  updateBookingSchema,
} from '@/modules/bookings/bookings.schema.js';
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
  const user = req.user!;
  const id = parseId(req.params.id);
  if (user.role === UserRole.PLAYER) {
    // Players may only report a transfer; strict schema blocks field tampering.
    claimPaymentSchema.parse(req.body);
    renderOk(res, await service.claimPayment(id, user));
    return;
  }
  renderOk(res, await service.update(id, updateBookingSchema.parse(req.body), user));
}

export async function cancelPendingCheckout(req: Request, res: Response) {
  renderOk(
    res,
    await service.cancelPendingCheckout(parseId(req.params.id), req.user!),
  );
}

export async function remove(req: Request, res: Response) {
  await service.remove(parseId(req.params.id), req.user!);
  renderNoContent(res);
}
