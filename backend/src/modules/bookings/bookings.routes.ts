import { Router } from 'express';
import { authenticate } from '@/common/auth.js';
import * as controller from '@/modules/bookings/bookings.controller.js';

export const bookingsRouter = Router();

bookingsRouter.use(authenticate);

bookingsRouter.get('/', controller.index);
bookingsRouter.get('/:id', controller.show);
bookingsRouter.post('/', controller.create);

/** Also used to confirm / cancel / mark paid: { status }, { paymentStatus }, ... */
bookingsRouter.patch('/:id', controller.update);
bookingsRouter.delete('/:id', controller.remove);
