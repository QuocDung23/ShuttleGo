import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';
import * as review from '../services/reviewService';
import * as noti from '../services/notificationService';
import * as venue from '../services/venueService';
import { parse, wrap } from '../utils/http';

export const reviewRoutes = Router();
reviewRoutes.use(requireAuth);
reviewRoutes.post('/', wrap(async (req, res) => res.status(201).json(await review.create(req.user.id, parse(review.reviewSchema, req.body)))));
reviewRoutes.put('/:id', wrap(async (req, res) => res.json(await review.update(String(req.params.id), req.user.id, parse(review.reviewUpdateSchema, req.body)))));
reviewRoutes.delete('/:id', wrap(async (req, res) => { await review.remove(String(req.params.id), req.user.id); res.status(204).end(); }));

export const notificationRoutes = Router();
notificationRoutes.use(requireAuth);
notificationRoutes.get('/', wrap(async (req, res) => res.json(await noti.list(req.user.id))));
notificationRoutes.patch('/read-all', wrap(async (req, res) => { await noti.markAllRead(req.user.id); res.status(204).end(); }));
notificationRoutes.patch('/:id/read', wrap(async (req, res) => res.json(await noti.markRead(String(req.params.id), req.user.id))));
notificationRoutes.delete('/:id', wrap(async (req, res) => { await noti.remove(String(req.params.id), req.user.id); res.status(204).end(); }));
notificationRoutes.post('/devices', wrap(async (req, res) => {
  await noti.registerDevice(req.user.id, parse(z.object({ token: z.string().min(10) }), req.body).token); res.status(204).end();
}));

export const amenityRoutes = Router();
amenityRoutes.get('/', wrap(async (_req, res) => res.json(await venue.amenities())));
