import { Router } from 'express';
import { parseId } from '../../common/validation.js';
import { createBookingSchema, queryBookingsSchema, updateBookingSchema } from './bookings.schema.js';
import * as service from './bookings.service.js';

export const bookingsRouter = Router();

bookingsRouter.get('/', async (req, res) => {
  res.json(await service.findAll(queryBookingsSchema.parse(req.query)));
});

bookingsRouter.get('/:id', async (req, res) => {
  res.json(await service.findOne(parseId(req.params.id)));
});

bookingsRouter.post('/', async (req, res) => {
  res.status(201).json(await service.create(createBookingSchema.parse(req.body)));
});

/** Also used to confirm / cancel / mark paid: { status }, { paymentStatus }, ... */
bookingsRouter.patch('/:id', async (req, res) => {
  res.json(await service.update(parseId(req.params.id), updateBookingSchema.parse(req.body)));
});

bookingsRouter.delete('/:id', async (req, res) => {
  await service.remove(parseId(req.params.id));
  res.status(204).end();
});
