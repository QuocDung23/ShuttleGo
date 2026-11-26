import { Router } from 'express';
import { authenticate, requireRole } from '@/common/auth.js';
import { UserRole } from '@/common/enums.js';
import { requireApprovedOwnerVenue } from '@/modules/venues/owner-approval.middleware.js';
import * as controller from '@/modules/operating-hours/operating-hours.controller.js';

/** Mounted at /venues/:venueId/operating-hours */
export const operatingHoursRouter = Router({ mergeParams: true });

const ownerOrAdmin = [authenticate, requireRole(UserRole.OWNER, UserRole.ADMIN)];
const ownerManager = [...ownerOrAdmin, requireApprovedOwnerVenue];

operatingHoursRouter.get('/', controller.index);

/** Replace all days of the week */
operatingHoursRouter.put('/', ...ownerManager, controller.replaceWeek);

/** Create or update a single day */
operatingHoursRouter.put('/:dayOfWeek', ...ownerManager, controller.upsertDay);
operatingHoursRouter.delete('/:dayOfWeek', ...ownerManager, controller.removeDay);
