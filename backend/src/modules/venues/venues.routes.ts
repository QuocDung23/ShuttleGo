import { Router } from 'express';
import { authenticate, requireRole } from '@/common/auth.js';
import { UserRole } from '@/common/enums.js';
import { parseId } from '@/common/validation.js';
import { operatingHoursRouter } from '@/modules/operating-hours/operating-hours.routes.js';
import {
  createVenueSchema,
  queryVenuesSchema,
  reviewVenueSchema,
  setAmenitiesSchema,
  updateVenueSchema,
} from '@/modules/venues/venues.schema.js';
import * as service from '@/modules/venues/venues.service.js';

export const venuesRouter = Router();

const ownerOrAdmin = [authenticate, requireRole(UserRole.OWNER, UserRole.ADMIN)];
const adminOnly = [authenticate, requireRole(UserRole.ADMIN)];

venuesRouter.get('/', async (req, res) => {
  res.json(await service.findAll(queryVenuesSchema.parse(req.query)));
});

venuesRouter.get('/:id', async (req, res) => {
  res.json(await service.findOne(parseId(req.params.id)));
});

venuesRouter.post('/', ...ownerOrAdmin, async (req, res) => {
  res.status(201).json(await service.create(createVenueSchema.parse(req.body), req.user!));
});

venuesRouter.patch('/:id', ...ownerOrAdmin, async (req, res) => {
  res.json(await service.update(parseId(req.params.id), updateVenueSchema.parse(req.body), req.user!));
});

/** Admin approves / rejects / suspends a venue */
venuesRouter.patch('/:id/review', ...adminOnly, async (req, res) => {
  res.json(await service.review(parseId(req.params.id), reviewVenueSchema.parse(req.body)));
});

venuesRouter.delete('/:id', ...ownerOrAdmin, async (req, res) => {
  await service.remove(parseId(req.params.id), req.user!);
  res.status(204).end();
});

// venue_amenities
venuesRouter.get('/:id/amenities', async (req, res) => {
  res.json(await service.getAmenities(parseId(req.params.id)));
});

/** Replace the venue's amenity list */
venuesRouter.put('/:id/amenities', ...ownerOrAdmin, async (req, res) => {
  const { amenityIds } = setAmenitiesSchema.parse(req.body);
  res.json(await service.setAmenities(parseId(req.params.id), amenityIds, req.user!));
});

// operating_hours: /venues/:venueId/operating-hours
venuesRouter.use('/:venueId/operating-hours', operatingHoursRouter);
