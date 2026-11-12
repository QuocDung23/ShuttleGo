import { z } from 'zod';
import { q, q1, tx } from '../config/db';
import { HttpError, notFound } from '../utils/http';
import { CANCEL_BEFORE_HOURS, PriceRule, SLOT_MINUTES, fromMin, hhmm, priceFor, toMin, vnDate } from '../utils/time';
import { notify } from './notificationService';

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày dạng YYYY-MM-DD');
export const bookingSchema = z.object({
  venueId: z.string().uuid(), playDate: date, note: z.string().max(500).optional(),
  slots: z.array(z.object({ courtId: z.string().uuid(), startTime: z.string().regex(/^\d{2}:00$/, 'Giờ bắt đầu dạng HH:00') })).min(1).max(12),
});
export const rejectSchema = z.object({ reason: z.string().min(1).max(300) });

const BANK = process.env.VIETQR_BANK || 'VCB';
const ACCOUNT = process.env.VIETQR_ACCOUNT || '0123456789';
const qrUrl = (code: string, amount: number) =>
  `https://img.vietqr.io/image/${BANK}-${ACCOUNT}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent('SHUTTLEGO ' + code)}`;
const genCode = () => 'SG' + Math.random().toString(36).slice(2, 8).toUpperCase();

// ---------- Lưới sân trống / đã đặt ----------
export async function availability(venueId: string, playDate: string) {
  date.parse(playDate);
  const v = await q1('SELECT id, name, open_time, close_time FROM venues WHERE id=$1 AND is_active', [venueId]);
  if (!v) throw notFound('Sân');
  const courts = await q('SELECT id, name FROM courts WHERE venue_id=$1 AND is_active ORDER BY name', [venueId]);
  const rules = await q<PriceRule>('SELECT day_type, start_time, end_time, price_per_slot FROM price_rules WHERE venue_id=$1', [venueId]);
  const taken = await q(
    `SELECT s.court_id, s.start_time, b.status FROM booking_slots s JOIN bookings b ON b.id=s.booking_id
     WHERE b.venue_id=$1 AND s.play_date=$2 AND s.is_active`, [venueId, playDate]);
  const takenMap = new Map(taken.map((t) => [`${t.courtId}|${hhmm(t.startTime)}`, t.status]));
  const hours: string[] = [];
  for (let m = toMin(v.openTime); m + SLOT_MINUTES <= toMin(v.closeTime); m += SLOT_MINUTES) hours.push(fromMin(m));
  const now = Date.now();
  return {
    venueId, playDate, openTime: hhmm(v.openTime), closeTime: hhmm(v.closeTime), hours,
    courts: courts.map((c) => ({
      ...c,
      slots: hours.map((h) => {
        const st = takenMap.get(`${c.id}|${h}`);
        const status = st === 'PENDING' ? 'PENDING' : st ? 'BOOKED' : vnDate(playDate, h).getTime() <= now ? 'PAST' : 'FREE';
        return { startTime: h, endTime: fromMin(toMin(h) + SLOT_MINUTES), price: priceFor(rules, playDate, h), status };
      }),
    })),
  };
}

// ---------- Tạo đơn ----------
export async function create(userId: string, d: z.infer<typeof bookingSchema>) {
  const v = await q1('SELECT id, owner_id, name, open_time, close_time FROM venues WHERE id=$1 AND is_active', [d.venueId]);
  if (!v) throw notFound('Sân');
  const keys = new Set(d.slots.map((s) => `${s.courtId}|${s.startTime}`));
  if (keys.size !== d.slots.length) throw new HttpError(400, 'Có khung giờ bị chọn lặp lại');

  const courts = await q('SELECT id FROM courts WHERE venue_id=$1 AND is_active', [d.venueId]);
  const courtIds = new Set(courts.map((c) => c.id));
  const rules = await q<PriceRule>('SELECT day_type, start_time, end_time, price_per_slot FROM price_rules WHERE venue_id=$1', [d.venueId]);

  const rows = d.slots.map((s) => {
    if (!courtIds.has(s.courtId)) throw new HttpError(400, 'Sân con không thuộc cơ sở này hoặc đang tạm ngưng');
    const start = toMin(s.startTime), end = start + SLOT_MINUTES;
    if (start < toMin(v.openTime) || end > toMin(v.closeTime)) throw new HttpError(400, `Khung ${s.startTime} ngoài giờ mở cửa`);
    if (vnDate(d.playDate, s.startTime).getTime() <= Date.now()) throw new HttpError(400, `Khung ${s.startTime} đã qua`);
    const price = priceFor(rules, d.playDate, s.startTime);
    if (price == null) throw new HttpError(400, `Chưa có giá cho khung ${s.startTime}`);
    return { ...s, endTime: fromMin(end), price };
  });
  const total = rows.reduce((a, r) => a + r.price, 0);

  let bookingId: string;
  try {
    bookingId = await tx(async (c) => {
      const b = await q1(
        'INSERT INTO bookings (code,user_id,venue_id,play_date,total_amount,note) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id',
        [genCode(), userId, d.venueId, d.playDate, total, d.note ?? null], c);
      for (const r of rows)
        await c.query('INSERT INTO booking_slots (booking_id,court_id,play_date,start_time,end_time,price) VALUES ($1,$2,$3,$4,$5,$6)',
          [b.id, r.courtId, d.playDate, r.startTime, r.endTime, r.price]);
      await c.query('INSERT INTO payments (booking_id, amount) VALUES ($1,$2)', [b.id, total]);
      return b.id;
    });
  } catch (e: any) {
    // Ràng buộc UNIQUE ở DB là lớp chặn cuối cùng khi 2 người bấm đặt cùng lúc
    if (e.code === '23505' && e.constraint === 'uq_slot_no_double_booking')
      throw new HttpError(409, 'Một hoặc nhiều khung giờ vừa có người khác đặt, vui lòng chọn lại');
    throw e;
  }
  await notify(v.ownerId, 'BOOKING_CREATED', 'Có đơn đặt sân mới', `${v.name} - ngày ${d.playDate}, ${rows.length} khung giờ`, bookingId);
  return detail(bookingId, { id: userId, role: 'PLAYER' });
}

// ---------- Đọc ----------
const SELECT_BOOKING = `
  SELECT b.*, v.name AS venue_name, v.address AS venue_address, v.owner_id,
    u.full_name AS user_name, u.phone AS user_phone,
    (SELECT json_agg(json_build_object('id',s.id,'court_id',s.court_id,'court_name',c.name,
        'start_time',to_char(s.start_time,'HH24:MI'),'end_time',to_char(s.end_time,'HH24:MI'),'price',s.price) ORDER BY c.name, s.start_time)
       FROM booking_slots s JOIN courts c ON c.id=s.court_id WHERE s.booking_id=b.id) AS slots,
    (SELECT row_to_json(p) FROM payments p WHERE p.booking_id=b.id) AS payment,
    EXISTS (SELECT 1 FROM reviews r WHERE r.booking_id=b.id) AS reviewed
  FROM bookings b JOIN venues v ON v.id=b.venue_id JOIN users u ON u.id=b.user_id`;

/** Tự chuyển đơn đã duyệt và đã qua ngày chơi sang COMPLETED. */
const autoComplete = () => q(`UPDATE bookings SET status='COMPLETED', updated_at=now() WHERE status='CONFIRMED' AND play_date < (now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date`);

export async function detail(id: string, user: { id: string; role: string }) {
  const b = await q1(`${SELECT_BOOKING} WHERE b.id=$1`, [id]);
  if (!b) throw notFound('Đơn đặt sân');
  if (b.userId !== user.id && b.ownerId !== user.id) throw new HttpError(403, 'Không có quyền xem đơn này');
  b.paymentQr = qrUrl(b.code, b.totalAmount);
  return b;
}
export async function listMine(userId: string, status?: string) {
  await autoComplete();
  const p: any[] = [userId];
  let w = 'b.user_id=$1';
  if (status) { p.push(status.split(',')); w += ` AND b.status::text = ANY($2)`; }
  return q(`${SELECT_BOOKING} WHERE ${w} ORDER BY b.play_date DESC, b.created_at DESC`, p);
}
export async function listForOwner(ownerId: string, f: { venueId?: string; date?: string; status?: string }) {
  await autoComplete();
  const p: any[] = [ownerId], w = ['v.owner_id=$1'];
  if (f.venueId) { p.push(f.venueId); w.push(`b.venue_id=$${p.length}`); }
  if (f.date) { p.push(f.date); w.push(`b.play_date=$${p.length}`); }
  if (f.status) { p.push(f.status.split(',')); w.push(`b.status::text = ANY($${p.length})`); }
  return q(`${SELECT_BOOKING} WHERE ${w.join(' AND ')} ORDER BY b.play_date, b.created_at`, p);
}

// ---------- Cập nhật trạng thái ----------
async function load(id: string) {
  const b = await q1(`SELECT b.*, v.owner_id, v.name AS venue_name,
      (SELECT MIN(start_time) FROM booking_slots WHERE booking_id=b.id) AS first_start
    FROM bookings b JOIN venues v ON v.id=b.venue_id WHERE b.id=$1`, [id]);
  if (!b) throw notFound('Đơn đặt sân');
  return b;
}
/** Đổi trạng thái + nhả slot (nếu hủy/từ chối) + hoàn tiền mô phỏng. */
async function closeBooking(id: string, status: 'CANCELLED' | 'REJECTED', reason?: string) {
  await tx(async (c) => {
    await c.query('UPDATE bookings SET status=$2, reject_reason=$3, updated_at=now() WHERE id=$1', [id, status, reason ?? null]);
    await c.query('UPDATE booking_slots SET is_active=false WHERE booking_id=$1', [id]);
    await c.query(`UPDATE payments SET status='REFUNDED' WHERE booking_id=$1 AND status='PAID'`, [id]);
  });
}

export async function cancel(id: string, userId: string) {
  const b = await load(id);
  if (b.userId !== userId) throw new HttpError(403, 'Không phải đơn của bạn');
  if (!['PENDING', 'CONFIRMED'].includes(b.status)) throw new HttpError(400, 'Đơn này không thể hủy');
  const hoursLeft = (vnDate(b.playDate, b.firstStart).getTime() - Date.now()) / 3_600_000;
  if (hoursLeft < CANCEL_BEFORE_HOURS) throw new HttpError(400, `Chỉ được hủy trước giờ chơi ${CANCEL_BEFORE_HOURS} tiếng`);
  await closeBooking(id, 'CANCELLED');
  await notify(b.ownerId, 'BOOKING_CANCELLED', 'Khách đã hủy đơn', `Đơn ${b.code} ngày ${b.playDate} đã bị hủy`, id);
  return detail(id, { id: userId, role: 'PLAYER' });
}

async function loadForOwner(id: string, ownerId: string) {
  const b = await load(id);
  if (b.ownerId !== ownerId) throw new HttpError(403, 'Đơn không thuộc sân của bạn');
  if (b.status !== 'PENDING') throw new HttpError(400, 'Chỉ duyệt được đơn đang chờ');
  return b;
}
export async function approve(id: string, ownerId: string) {
  const b = await loadForOwner(id, ownerId);
  await q(`UPDATE bookings SET status='CONFIRMED', updated_at=now() WHERE id=$1`, [id]);
  await notify(b.userId, 'BOOKING_CONFIRMED', 'Đơn đặt sân đã được duyệt', `${b.venueName} - ngày ${b.playDate} (mã ${b.code})`, id);
  return detail(id, { id: ownerId, role: 'OWNER' });
}
export async function reject(id: string, ownerId: string, reason: string) {
  const b = await loadForOwner(id, ownerId);
  await closeBooking(id, 'REJECTED', reason);
  await notify(b.userId, 'BOOKING_REJECTED', 'Đơn đặt sân bị từ chối', `${b.venueName}: ${reason}`, id);
  return detail(id, { id: ownerId, role: 'OWNER' });
}

/** Thanh toán mô phỏng: người chơi bấm "Tôi đã chuyển khoản". */
export async function pay(id: string, userId: string) {
  const b = await load(id);
  if (b.userId !== userId) throw new HttpError(403, 'Không phải đơn của bạn');
  if (!['PENDING', 'CONFIRMED'].includes(b.status)) throw new HttpError(400, 'Đơn không ở trạng thái thanh toán được');
  const p = await q1(`UPDATE payments SET status='PAID', paid_at=now(), reference=$2 WHERE booking_id=$1 AND status='UNPAID' RETURNING *`,
    [id, 'SIM-' + Date.now()]);
  if (!p) throw new HttpError(400, 'Đơn đã được thanh toán');
  await notify(b.ownerId, 'PAYMENT_RECEIVED', 'Khách báo đã thanh toán', `Đơn ${b.code}: ${b.totalAmount.toLocaleString('vi-VN')}đ`, id);
  return detail(id, { id: userId, role: 'PLAYER' });
}

/** Xóa đơn khỏi lịch sử (chỉ đơn đã hủy / bị từ chối). */
export async function remove(id: string, userId: string) {
  const b = await load(id);
  if (b.userId !== userId) throw new HttpError(403, 'Không phải đơn của bạn');
  if (!['CANCELLED', 'REJECTED'].includes(b.status)) throw new HttpError(400, 'Chỉ xóa được đơn đã hủy hoặc bị từ chối');
  await q('DELETE FROM bookings WHERE id=$1', [id]);
}

/** Job nhắc lịch: gửi nhắc cho đơn CONFIRMED bắt đầu trong 60 phút tới (mỗi đơn 1 lần). */
export async function sendReminders() {
  const due = await q(`
    SELECT b.id, b.user_id, b.code, v.name AS venue_name, MIN(s.start_time) AS first_start
    FROM bookings b JOIN venues v ON v.id=b.venue_id JOIN booking_slots s ON s.booking_id=b.id
    WHERE b.status='CONFIRMED'
      AND NOT EXISTS (SELECT 1 FROM notifications n WHERE n.booking_id=b.id AND n.type='REMINDER')
    GROUP BY b.id, v.name
    HAVING (b.play_date + MIN(s.start_time)) AT TIME ZONE 'Asia/Ho_Chi_Minh' BETWEEN now() AND now() + interval '60 minutes'`);
  for (const b of due)
    await notify(b.userId, 'REMINDER', 'Sắp đến giờ chơi!', `${b.venueName} lúc ${hhmm(b.firstStart)} (mã ${b.code})`, b.id);
  return due.length;
}
