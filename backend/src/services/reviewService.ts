import { z } from 'zod';
import { q, q1 } from '../config/db';
import { HttpError, notFound } from '../utils/http';

export const reviewSchema = z.object({ bookingId: z.string().uuid(), rating: z.number().int().min(1).max(5), comment: z.string().max(1000).optional() });
export const reviewUpdateSchema = z.object({ rating: z.number().int().min(1).max(5).optional(), comment: z.string().max(1000).optional() });

export const listByVenue = (venueId: string) => q(
  `SELECT r.*, u.full_name AS user_name, u.avatar_url FROM reviews r JOIN users u ON u.id=r.user_id
   WHERE r.venue_id=$1 ORDER BY r.created_at DESC`, [venueId]);

export async function create(userId: string, d: z.infer<typeof reviewSchema>) {
  const b = await q1('SELECT user_id, venue_id, status FROM bookings WHERE id=$1', [d.bookingId]);
  if (!b) throw notFound('Đơn đặt sân');
  if (b.userId !== userId) throw new HttpError(403, 'Không phải đơn của bạn');
  if (b.status !== 'COMPLETED') throw new HttpError(400, 'Chỉ đánh giá sau khi đã chơi xong');
  return q1('INSERT INTO reviews (user_id,venue_id,booking_id,rating,comment) VALUES ($1,$2,$3,$4,$5) RETURNING *',
    [userId, b.venueId, d.bookingId, d.rating, d.comment ?? null]);
}
export async function update(id: string, userId: string, d: z.infer<typeof reviewUpdateSchema>) {
  const r = await q1('UPDATE reviews SET rating=COALESCE($3,rating), comment=COALESCE($4,comment) WHERE id=$1 AND user_id=$2 RETURNING *',
    [id, userId, d.rating ?? null, d.comment ?? null]);
  if (!r) throw notFound('Đánh giá');
  return r;
}
export async function remove(id: string, userId: string) {
  const r = await q1('DELETE FROM reviews WHERE id=$1 AND user_id=$2 RETURNING id', [id, userId]);
  if (!r) throw notFound('Đánh giá');
}
