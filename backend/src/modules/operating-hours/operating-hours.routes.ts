import { Router } from 'express';
import { authenticate, requireRole } from '@/common/auth.js';
import { UserRole } from '@/common/enums.js';
import { parseId } from '@/common/validation.js';
import { dayOfWeek, replaceWeekSchema, upsertDaySchema } from '@/modules/operating-hours/operating-hours.schema.js';
import * as service from '@/modules/operating-hours/operating-hours.service.js';

/** Mounted at /venues/:venueId/operating-hours */
export const operatingHoursRouter = Router({ mergeParams: true });

type Params = { venueId: string; dayOfWeek?: string };

const ownerOrAdmin = [authenticate, requireRole(UserRole.OWNER, UserRole.ADMIN)];

operatingHoursRouter.get('/', async (req, res) => {
  const { venueId } = req.params as Params;
  res.json(await service.findByVenue(parseId(venueId, 'venueId')));
});

/** Replace all days of the week */
operatingHoursRouter.put('/', ...ownerOrAdmin, async (req, res) => {
  const { venueId } = req.params as Params;
  res.json(
    await service.replaceWeek(
      parseId(venueId, 'venueId'),
      replaceWeekSchema.parse(req.body),
      req.user!,
    ),
  );
});

/** Create or update a single day */
operatingHoursRouter.put('/:dayOfWeek', ...ownerOrAdmin, async (req, res) => {
  const params = req.params as Params;
  res.json(
    await service.upsertDay(
      parseId(params.venueId, 'venueId'),
      dayOfWeek.parse(params.dayOfWeek),
      upsertDaySchema.parse(req.body),
      req.user!,
    ),
  );
});

operatingHoursRouter.delete('/:dayOfWeek', ...ownerOrAdmin, async (req, res) => {
  const params = req.params as Params;
  await service.removeDay(
    parseId(params.venueId, 'venueId'),
    dayOfWeek.parse(params.dayOfWeek),
    req.user!,
  );
  res.status(204).end();
});
