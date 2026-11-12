import { Router } from 'express';
import { requireAuth, requireOwner } from '../middleware/auth';
import * as venue from '../services/venueService';
import * as booking from '../services/bookingService';
import * as review from '../services/reviewService';
import { parse, wrap } from '../utils/http';

const r = Router();
const num = (v: any) => (v === undefined || v === '' ? undefined : Number(v));

// Công khai
r.get('/', wrap(async (req, res) => res.json(await venue.list({
  q: req.query.q as string, district: req.query.district as string,
  minPrice: num(req.query.minPrice), maxPrice: num(req.query.maxPrice),
  amenities: req.query.amenities ? String(req.query.amenities).split(',') : undefined,
}))));
r.get('/mine', requireAuth, requireOwner, wrap(async (req, res) => res.json(await venue.listMine(req.user.id))));
r.get('/:id', wrap(async (req, res) => res.json(await venue.detail(String(req.params.id)))));
r.get('/:id/availability', wrap(async (req, res) => res.json(await booking.availability(String(req.params.id), String(req.query.date)))));
r.get('/:id/reviews', wrap(async (req, res) => res.json(await review.listByVenue(String(req.params.id)))));

// Chủ sân: thêm / sửa / xóa cơ sở
r.post('/', requireAuth, requireOwner, wrap(async (req, res) => res.status(201).json(await venue.create(req.user.id, parse(venue.venueSchema, req.body)))));
r.put('/:id', requireAuth, requireOwner, wrap(async (req, res) => res.json(await venue.update(String(req.params.id), req.user.id, parse(venue.venueUpdateSchema, req.body)))));
r.delete('/:id', requireAuth, requireOwner, wrap(async (req, res) => { await venue.remove(String(req.params.id), req.user.id); res.status(204).end(); }));

// Chủ sân: thêm sân con, bảng giá cho cơ sở
r.post('/:id/courts', requireAuth, requireOwner, wrap(async (req, res) => res.status(201).json(await venue.addCourt(String(req.params.id), req.user.id, parse(venue.courtSchema, req.body)))));
r.post('/:id/price-rules', requireAuth, requireOwner, wrap(async (req, res) => res.status(201).json(await venue.addPrice(String(req.params.id), req.user.id, parse(venue.priceSchema, req.body)))));
export default r;
