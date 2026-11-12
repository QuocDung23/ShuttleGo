import { q, q1 } from '../config/db';
import { notFound } from '../utils/http';

/** Lưu thông báo vào DB và đẩy push (Expo) nếu user có đăng ký thiết bị. */
export async function notify(userId: string, type: string, title: string, body: string, bookingId?: string) {
  await q('INSERT INTO notifications (user_id,type,title,body,booking_id) VALUES ($1,$2,$3,$4,$5)', [userId, type, title, body, bookingId ?? null]);
  if (process.env.DISABLE_PUSH === '1') return;
  try {
    const tokens = await q('SELECT token FROM device_tokens WHERE user_id=$1', [userId]);
    if (!tokens.length) return;
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tokens.map((t) => ({ to: t.token, title, body, data: { bookingId } }))),
    });
  } catch (e) { console.warn('push failed', e); }
}
export const list = (userId: string) => q('SELECT * FROM notifications WHERE user_id=$1 ORDER BY created_at DESC LIMIT 100', [userId]);
export async function markRead(id: string, userId: string) {
  const n = await q1('UPDATE notifications SET is_read=true WHERE id=$1 AND user_id=$2 RETURNING *', [id, userId]);
  if (!n) throw notFound('Thông báo');
  return n;
}
export const markAllRead = (userId: string) => q('UPDATE notifications SET is_read=true WHERE user_id=$1', [userId]);
export async function remove(id: string, userId: string) {
  const n = await q1('DELETE FROM notifications WHERE id=$1 AND user_id=$2 RETURNING id', [id, userId]);
  if (!n) throw notFound('Thông báo');
}
export const registerDevice = (userId: string, token: string) =>
  q(`INSERT INTO device_tokens (user_id,token) VALUES ($1,$2) ON CONFLICT (token) DO UPDATE SET user_id=EXCLUDED.user_id`, [userId, token]);
