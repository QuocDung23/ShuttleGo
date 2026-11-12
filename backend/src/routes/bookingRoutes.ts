import { Router } from 'express';
import { requireAuth, requireOwner } from '../middleware/auth';
import * as booking from '../services/bookingService';
import { parse, wrap } from '../utils/http';

const r = Router();
r.use(requireAuth);
r.post('/', wrap(async (req, res) => res.status(201).json(await booking.create(req.user.id, parse(booking.bookingSchema, req.body)))));
r.get('/mine', wrap(async (req, res) => res.json(await booking.listMine(req.user.id, req.query.status as string))));
r.get('/owner', requireOwner, wrap(async (req, res) => res.json(await booking.listForOwner(req.user.id, {
  venueId: req.query.venueId as string, date: req.query.date as string, status: req.query.status as string }))));
r.get('/:id', wrap(async (req, res) => res.json(await booking.detail(String(req.params.id), req.user))));
r.patch('/:id/cancel', wrap(async (req, res) => res.json(await booking.cancel(String(req.params.id), req.user.id))));
r.post('/:id/pay', wrap(async (req, res) => res.json(await booking.pay(String(req.params.id), req.user.id))));
r.patch('/:id/approve', requireOwner, wrap(async (req, res) => res.json(await booking.approve(String(req.params.id), req.user.id))));
r.patch('/:id/reject', requireOwner, wrap(async (req, res) => res.json(await booking.reject(String(req.params.id), req.user.id, parse(booking.rejectSchema, req.body).reason))));
r.delete('/:id', wrap(async (req, res) => { await booking.remove(String(req.params.id), req.user.id); res.status(204).end(); }));
export default r;
