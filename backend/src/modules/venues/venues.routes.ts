import { Router } from 'express';
import { parseId } from '../../common/validation.js';
import { operatingHoursRouter } from '../operating-hours/operating-hours.routes.js';
import {
  createVenueSchema,
  queryVenuesSchema,
  reviewVenueSchema,
  setAmenitiesSchema,
  updateVenueSchema,
} from './venues.schema.js';
import * as service from './venues.service.js';

export const venuesRouter = Router();

venuesRouter.get('/', async (req, res) => {
  res.json(await service.findAll(queryVenuesSchema.parse(req.query)));
});

venuesRouter.get('/:id', async (req, res) => {
  res.json(await service.findOne(parseId(req.params.id)));
});

venuesRouter.post('/', async (req, res) => {
  res.status(201).json(await service.create(createVenueSchema.parse(req.body)));
});

venuesRouter.patch('/:id', async (req, res) => {
  res.json(await service.update(parseId(req.params.id), updateVenueSchema.parse(req.body)));
});

/** Admin approves / rejects / suspends a venue */
venuesRouter.patch('/:id/review', async (req, res) => {
  res.json(await service.review(parseId(req.params.id), reviewVenueSchema.parse(req.body)));
});

venuesRouter.delete('/:id', async (req, res) => {
  await service.remove(parseId(req.params.id));
  res.status(204).end();
});

// venue_amenities
venuesRouter.get('/:id/amenities', async (req, res) => {
  res.json(await service.getAmenities(parseId(req.params.id)));
});

/** Replace the venue's amenity list */
venuesRouter.put('/:id/amenities', async (req, res) => {
  const { amenityIds } = setAmenitiesSchema.parse(req.body);
  res.json(await service.setAmenities(parseId(req.params.id), amenityIds));
});

// operating_hours: /venues/:venueId/operating-hours
venuesRouter.use('/:venueId/operating-hours', operatingHoursRouter);
