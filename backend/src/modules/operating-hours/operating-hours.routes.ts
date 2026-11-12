import { Router } from 'express';
import { parseId } from '../../common/validation.js';
import { dayOfWeek, replaceWeekSchema, upsertDaySchema } from './operating-hours.schema.js';
import * as service from './operating-hours.service.js';

/** Mounted at /venues/:venueId/operating-hours */
export const operatingHoursRouter = Router({ mergeParams: true });

type Params = { venueId: string; dayOfWeek?: string };

operatingHoursRouter.get('/', async (req, res) => {
  const { venueId } = req.params as Params;
  res.json(await service.findByVenue(parseId(venueId, 'venueId')));
});

/** Replace all days of the week */
operatingHoursRouter.put('/', async (req, res) => {
  const { venueId } = req.params as Params;
  res.json(await service.replaceWeek(parseId(venueId, 'venueId'), replaceWeekSchema.parse(req.body)));
});

/** Create or update a single day */
operatingHoursRouter.put('/:dayOfWeek', async (req, res) => {
  const params = req.params as Params;
  res.json(
    await service.upsertDay(
      parseId(params.venueId, 'venueId'),
      dayOfWeek.parse(params.dayOfWeek),
      upsertDaySchema.parse(req.body),
    ),
  );
});

operatingHoursRouter.delete('/:dayOfWeek', async (req, res) => {
  const params = req.params as Params;
  await service.removeDay(parseId(params.venueId, 'venueId'), dayOfWeek.parse(params.dayOfWeek));
  res.status(204).end();
});
