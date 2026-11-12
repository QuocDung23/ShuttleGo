import type { Request, Response } from 'express';
import { parseId } from '@/common/validation.js';
import {
  createVenueSchema,
  queryVenuesSchema,
  reviewVenueSchema,
  setAmenitiesSchema,
  updateVenueSchema,
} from '@/modules/venues/venues.schema.js';
import * as service from '@/modules/venues/venues.service.js';
import { renderCreated, renderNoContent, renderOk } from '@/views/json.view.js';

export async function index(req: Request, res: Response) {
  renderOk(res, await service.findAll(queryVenuesSchema.parse(req.query)));
}

export async function show(req: Request, res: Response) {
  renderOk(res, await service.findOne(parseId(req.params.id)));
}

export async function create(req: Request, res: Response) {
  renderCreated(res, await service.create(createVenueSchema.parse(req.body), req.user!));
}

export async function update(req: Request, res: Response) {
  renderOk(
    res,
    await service.update(parseId(req.params.id), updateVenueSchema.parse(req.body), req.user!),
  );
}

export async function review(req: Request, res: Response) {
  renderOk(res, await service.review(parseId(req.params.id), reviewVenueSchema.parse(req.body)));
}

export async function remove(req: Request, res: Response) {
  await service.remove(parseId(req.params.id), req.user!);
  renderNoContent(res);
}

export async function amenities(req: Request, res: Response) {
  renderOk(res, await service.getAmenities(parseId(req.params.id)));
}

export async function setAmenities(req: Request, res: Response) {
  const { amenityIds } = setAmenitiesSchema.parse(req.body);
  renderOk(res, await service.setAmenities(parseId(req.params.id), amenityIds, req.user!));
}
