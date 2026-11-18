import { Router } from 'express';
import { authenticate } from '@/common/auth.js';
import { requireApprovedOwnerVenue } from '@/modules/venues/owner-approval.middleware.js';
import * as controller from '@/modules/bookings/bookings.controller.js';

export const bookingsRouter = Router();

bookingsRouter.use(authenticate);
// Owners must have an approved venue to manage bookings; players/admins unaffected.
bookingsRouter.use(requireApprovedOwnerVenue);

bookingsRouter.get('/', controller.index);
bookingsRouter.get('/:id', controller.show);
bookingsRouter.post('/', controller.create);

/** Also used to confirm / cancel / mark paid: { status }, { paymentStatus }, ... */
bookingsRouter.patch('/:id', controller.update);
bookingsRouter.delete('/:id', controller.remove);
