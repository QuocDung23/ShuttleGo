import type { Request, Response } from 'express';
import { parseId } from '@/common/validation.js';
import { dayOfWeek, replaceWeekSchema, upsertDaySchema } from '@/modules/operating-hours/operating-hours.schema.js';
import * as service from '@/modules/operating-hours/operating-hours.service.js';
import { renderNoContent, renderOk } from '@/views/json.view.js';

type Params = { venueId: string; dayOfWeek?: string };

export async function index(req: Request, res: Response) {
  const { venueId } = req.params as Params;
  renderOk(res, await service.findByVenue(parseId(venueId, 'venueId')));
}

export async function replaceWeek(req: Request, res: Response) {
  const { venueId } = req.params as Params;
  renderOk(
    res,
    await service.replaceWeek(
      parseId(venueId, 'venueId'),
      replaceWeekSchema.parse(req.body),
      req.user!,
    ),
  );
}

export async function upsertDay(req: Request, res: Response) {
  const params = req.params as Params;
  renderOk(
    res,
    await service.upsertDay(
      parseId(params.venueId, 'venueId'),
      dayOfWeek.parse(params.dayOfWeek),
      upsertDaySchema.parse(req.body),
      req.user!,
    ),
  );
}

export async function removeDay(req: Request, res: Response) {
  const params = req.params as Params;
  await service.removeDay(
    parseId(params.venueId, 'venueId'),
    dayOfWeek.parse(params.dayOfWeek),
    req.user!,
  );
  renderNoContent(res);
}
