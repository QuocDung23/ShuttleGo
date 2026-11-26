import { Router } from 'express';
import { authenticate, requireRole } from '@/common/auth.js';
import { UserRole } from '@/common/enums.js';
import * as controller from '@/modules/bookings/booking-holds.controller.js';

export const bookingHoldsRouter = Router();
bookingHoldsRouter.use(authenticate, requireRole(UserRole.PLAYER));
bookingHoldsRouter.get('/mine', controller.mine);
bookingHoldsRouter.post('/', controller.select);
bookingHoldsRouter.delete('/mine', controller.release);
