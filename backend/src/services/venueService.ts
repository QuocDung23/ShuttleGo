import { z } from 'zod';
import { PoolClient } from 'pg';
import { q, q1, tx } from '../config/db';
import { HttpError, notFound } from '../utils/http';

const time = z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Giờ dạng HH:MM');

export const venueSchema = z.object({
  name: z.string().min(2), description: z.string().nullable().optional(),
  address: z.string().min(3), district: z.string().nullable().optional(), city: z.string().optional(),
  latitude: z.number().nullable().optional(), longitude: z.number().nullable().optional(),
  phone: z.string().nullable().optional(), openTime: time.optional(), closeTime: time.optional(),
  isActive: z.boolean().optional(), amenities: z.array(z.string()).optional(), // mã tiện ích: PARKING, DRINKS...
});
export const venueUpdateSchema = venueSchema.partial();
export const courtSchema = z.object({ name: z.string().min(1), isActive: z.boolean().optional() });
export const courtUpdateSchema = courtSchema.partial();
export const priceSchema = z.object({
  dayType: z.enum(['WEEKDAY', 'WEEKEND', 'ALL']).default('ALL'),
  startTime: time, endTime: time, pricePerSlot: z.number().int().min(0),
});
export const priceUpdateSchema = priceSchema.partial();

export interface ListFilter { q?: string; district?: string; minPrice?: number; maxPrice?: number; amenities?: string[] }

const SELECT_VENUE = `
  SELECT v.*,
    (SELECT MIN(price_per_slot) FROM price_rules WHERE venue_id=v.id) AS min_price,
    (SELECT ROUND(AVG(rating),1) FROM reviews WHERE venue_id=v.id) AS avg_rating,
    (SELECT COUNT(*) FROM reviews WHERE venue_id=v.id) AS review_count,
    (SELECT COUNT(*) FROM courts WHERE venue_id=v.id AND is_active) AS court_count,
    COALESCE((SELECT json_agg(a.code) FROM venue_amenities va JOIN amenities a ON a.id=va.amenity_id WHERE va.venue_id=v.id), '[]') AS amenities,
    (SELECT url FROM venue_images WHERE venue_id=v.id ORDER BY sort_order LIMIT 1) AS cover_image
  FROM venues v`;

export async function list(f: ListFilter) {
  const where = ['v.is_active'], p: any[] = [];
  if (f.q) { p.push(`%${f.q}%`); where.push(`(v.name ILIKE $${p.length} OR v.address ILIKE $${p.length})`); }
  if (f.district) { p.push(f.district); where.push(`v.district = $${p.length}`); }
  if (f.minPrice != null) { p.push(f.minPrice); where.push(`EXISTS (SELECT 1 FROM price_rules r WHERE r.venue_id=v.id AND r.price_per_slot >= $${p.length})`); }
  if (f.maxPrice != null) { p.push(f.maxPrice); where.push(`EXISTS (SELECT 1 FROM price_rules r WHERE r.venue_id=v.id AND r.price_per_slot <= $${p.length})`); }
  if (f.amenities?.length) { // phải có ĐỦ các tiện ích được chọn
    p.push(f.amenities);
    where.push(`(SELECT COUNT(*) FROM venue_amenities va JOIN amenities a ON a.id=va.amenity_id WHERE va.venue_id=v.id AND a.code = ANY($${p.length})) = ${f.amenities.length}`);
  }
  return q(`${SELECT_VENUE} WHERE ${where.join(' AND ')} ORDER BY v.created_at DESC`, p);
}
export const listMine = (ownerId: string) => q(`${SELECT_VENUE} WHERE v.owner_id=$1 ORDER BY v.created_at DESC`, [ownerId]);

export async function detail(id: string) {
  const v = await q1(`${SELECT_VENUE} WHERE v.id=$1`, [id]);
  if (!v) throw notFound('Sân');
  v.courts = await q('SELECT id, name, is_active FROM courts WHERE venue_id=$1 ORDER BY name', [id]);
  v.images = await q('SELECT id, url, sort_order FROM venue_images WHERE venue_id=$1 ORDER BY sort_order', [id]);
  v.priceRules = await q('SELECT id, day_type, start_time, end_time, price_per_slot FROM price_rules WHERE venue_id=$1 ORDER BY day_type, start_time', [id]);
  return v;
}

export async function assertOwner(venueId: string, userId: string, db?: PoolClient) {
  const v = await q1('SELECT owner_id FROM venues WHERE id=$1', [venueId], db);
  if (!v) throw notFound('Sân');
  if (v.ownerId !== userId) throw new HttpError(403, 'Bạn không phải chủ sân này');
}

async function setAmenities(c: PoolClient, venueId: string, codes: string[]) {
  await c.query('DELETE FROM venue_amenities WHERE venue_id=$1', [venueId]);
  if (codes.length)
    await c.query(`INSERT INTO venue_amenities SELECT $1, id FROM amenities WHERE code = ANY($2)`, [venueId, codes]);
}

export async function create(ownerId: string, d: z.infer<typeof venueSchema>) {
  const id = await tx(async (c) => {
    const v = await q1(
      `INSERT INTO venues (owner_id,name,description,address,district,city,latitude,longitude,phone,open_time,close_time)
       VALUES ($1,$2,$3,$4,$5,COALESCE($6,'TP.HCM'),$7,$8,$9,COALESCE($10::time,'06:00'),COALESCE($11::time,'22:00')) RETURNING id`,
      [ownerId, d.name, d.description ?? null, d.address, d.district ?? null, d.city ?? null, d.latitude ?? null, d.longitude ?? null,
       d.phone ?? null, d.openTime ?? null, d.closeTime ?? null], c);
    await setAmenities(c, v.id, d.amenities ?? []);
    return v.id as string;
  });
  return detail(id);
}

export async function update(id: string, userId: string, d: z.infer<typeof venueUpdateSchema>) {
  await assertOwner(id, userId);
  const map: Record<string, string> = { name: 'name', description: 'description', address: 'address', district: 'district', city: 'city',
    latitude: 'latitude', longitude: 'longitude', phone: 'phone', openTime: 'open_time', closeTime: 'close_time', isActive: 'is_active' };
  const sets: string[] = [], p: any[] = [id];
  for (const [k, col] of Object.entries(map)) if ((d as any)[k] !== undefined) { p.push((d as any)[k]); sets.push(`${col}=$${p.length}`); }
  await tx(async (c) => {
    if (sets.length) await c.query(`UPDATE venues SET ${sets.join(',')}, updated_at=now() WHERE id=$1`, p);
    if (d.amenities) await setAmenities(c, id, d.amenities);
  });
  return detail(id);
}

export async function remove(id: string, userId: string) {
  await assertOwner(id, userId);
  const n = await q1('SELECT COUNT(*) AS n FROM bookings WHERE venue_id=$1', [id]);
  if (n.n > 0) throw new HttpError(409, 'Sân đã có đơn đặt, hãy chuyển sang "ngừng hoạt động" thay vì xóa');
  await q('DELETE FROM venues WHERE id=$1', [id]);
}

// ---- Sân con ----
export async function addCourt(venueId: string, userId: string, d: z.infer<typeof courtSchema>) {
  await assertOwner(venueId, userId);
  return q1('INSERT INTO courts (venue_id,name,is_active) VALUES ($1,$2,COALESCE($3,true)) RETURNING id,name,is_active', [venueId, d.name, d.isActive ?? null]);
}
async function courtVenue(courtId: string, userId: string) {
  const c = await q1('SELECT venue_id FROM courts WHERE id=$1', [courtId]);
  if (!c) throw notFound('Sân con');
  await assertOwner(c.venueId, userId);
}
export async function updateCourt(id: string, userId: string, d: z.infer<typeof courtUpdateSchema>) {
  await courtVenue(id, userId);
  return q1('UPDATE courts SET name=COALESCE($2,name), is_active=COALESCE($3,is_active) WHERE id=$1 RETURNING id,name,is_active', [id, d.name ?? null, d.isActive ?? null]);
}
export async function removeCourt(id: string, userId: string) {
  await courtVenue(id, userId);
  const n = await q1('SELECT COUNT(*) AS n FROM booking_slots WHERE court_id=$1', [id]);
  if (n.n > 0) throw new HttpError(409, 'Sân con đã có lịch đặt, hãy tắt hoạt động thay vì xóa');
  await q('DELETE FROM courts WHERE id=$1', [id]);
}

// ---- Bảng giá ----
export async function addPrice(venueId: string, userId: string, d: z.infer<typeof priceSchema>) {
  await assertOwner(venueId, userId);
  return q1('INSERT INTO price_rules (venue_id,day_type,start_time,end_time,price_per_slot) VALUES ($1,$2,$3,$4,$5) RETURNING *',
    [venueId, d.dayType, d.startTime, d.endTime, d.pricePerSlot]);
}
async function priceVenue(id: string, userId: string) {
  const r = await q1('SELECT venue_id FROM price_rules WHERE id=$1', [id]);
  if (!r) throw notFound('Bảng giá');
  await assertOwner(r.venueId, userId);
}
export async function updatePrice(id: string, userId: string, d: z.infer<typeof priceUpdateSchema>) {
  await priceVenue(id, userId);
  return q1(`UPDATE price_rules SET day_type=COALESCE($2::day_type,day_type), start_time=COALESCE($3::time,start_time),
             end_time=COALESCE($4::time,end_time), price_per_slot=COALESCE($5::int,price_per_slot) WHERE id=$1 RETURNING *`,
    [id, d.dayType ?? null, d.startTime ?? null, d.endTime ?? null, d.pricePerSlot ?? null]);
}
export async function removePrice(id: string, userId: string) {
  await priceVenue(id, userId);
  await q('DELETE FROM price_rules WHERE id=$1', [id]);
}
export const amenities = () => q('SELECT code, name FROM amenities ORDER BY id');
