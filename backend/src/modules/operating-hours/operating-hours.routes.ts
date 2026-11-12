import { Router } from 'express';
import { authenticate, requireRole } from '@/common/auth.js';
import { UserRole } from '@/common/enums.js';
import * as controller from '@/modules/operating-hours/operating-hours.controller.js';

/** Mounted at /venues/:venueId/operating-hours */
export const operatingHoursRouter = Router({ mergeParams: true });

const ownerOrAdmin = [authenticate, requireRole(UserRole.OWNER, UserRole.ADMIN)];

operatingHoursRouter.get('/', controller.index);

/** Replace all days of the week */
operatingHoursRouter.put('/', ...ownerOrAdmin, controller.replaceWeek);

/** Create or update a single day */
operatingHoursRouter.put('/:dayOfWeek', ...ownerOrAdmin, controller.upsertDay);
operatingHoursRouter.delete('/:dayOfWeek', ...ownerOrAdmin, controller.removeDay);
