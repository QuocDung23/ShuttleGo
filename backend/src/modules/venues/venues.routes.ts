import { Router } from 'express';
import { authenticate, requireRole } from '@/common/auth.js';
import { UserRole } from '@/common/enums.js';
import { operatingHoursRouter } from '@/modules/operating-hours/operating-hours.routes.js';
import * as controller from '@/modules/venues/venues.controller.js';

export const venuesRouter = Router();

const ownerOrAdmin = [authenticate, requireRole(UserRole.OWNER, UserRole.ADMIN)];
const adminOnly = [authenticate, requireRole(UserRole.ADMIN)];

venuesRouter.get('/', controller.index);
venuesRouter.get('/:id', controller.show);
venuesRouter.post('/', ...ownerOrAdmin, controller.create);
venuesRouter.patch('/:id', ...ownerOrAdmin, controller.update);

/** Admin approves / rejects / suspends a venue */
venuesRouter.patch('/:id/review', ...adminOnly, controller.review);
venuesRouter.delete('/:id', ...ownerOrAdmin, controller.remove);

// venue_amenities
venuesRouter.get('/:id/amenities', controller.amenities);

/** Replace the venue's amenity list */
venuesRouter.put('/:id/amenities', ...ownerOrAdmin, controller.setAmenities);

// operating_hours: /venues/:venueId/operating-hours
venuesRouter.use('/:venueId/operating-hours', operatingHoursRouter);
