import { Router } from 'express';
import { requireAuth, requireOwner } from '../middleware/auth';
import * as venue from '../services/venueService';
import { parse, wrap } from '../utils/http';

// /courts/:id và /price-rules/:id - sửa / xóa
export const courtRoutes = Router();
courtRoutes.use(requireAuth, requireOwner);
courtRoutes.put('/:id', wrap(async (req, res) => res.json(await venue.updateCourt(String(req.params.id), req.user.id, parse(venue.courtUpdateSchema, req.body)))));
courtRoutes.delete('/:id', wrap(async (req, res) => { await venue.removeCourt(String(req.params.id), req.user.id); res.status(204).end(); }));

export const priceRoutes = Router();
priceRoutes.use(requireAuth, requireOwner);
priceRoutes.put('/:id', wrap(async (req, res) => res.json(await venue.updatePrice(String(req.params.id), req.user.id, parse(venue.priceUpdateSchema, req.body)))));
priceRoutes.delete('/:id', wrap(async (req, res) => { await venue.removePrice(String(req.params.id), req.user.id); res.status(204).end(); }));
