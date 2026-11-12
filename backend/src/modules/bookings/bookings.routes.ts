import { Router } from 'express';
import { authenticate } from '@/common/auth.js';
import { parseId } from '@/common/validation.js';
import { createBookingSchema, queryBookingsSchema, updateBookingSchema } from '@/modules/bookings/bookings.schema.js';
import * as service from '@/modules/bookings/bookings.service.js';

export const bookingsRouter = Router();

bookingsRouter.use(authenticate);

bookingsRouter.get('/', async (req, res) => {
  res.json(await service.findAll(queryBookingsSchema.parse(req.query), req.user!));
});

bookingsRouter.get('/:id', async (req, res) => {
  res.json(await service.findOne(parseId(req.params.id), req.user!));
});

bookingsRouter.post('/', async (req, res) => {
  res.status(201).json(await service.create(createBookingSchema.parse(req.body), req.user!));
});

/** Also used to confirm / cancel / mark paid: { status }, { paymentStatus }, ... */
bookingsRouter.patch('/:id', async (req, res) => {
  res.json(
    await service.update(parseId(req.params.id), updateBookingSchema.parse(req.body), req.user!),
  );
});

bookingsRouter.delete('/:id', async (req, res) => {
  await service.remove(parseId(req.params.id), req.user!);
  res.status(204).end();
});
