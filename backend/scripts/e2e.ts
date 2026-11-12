// Kiểm thử đầu-cuối toàn bộ CRUD. Cần DB đã init schema. Chạy: npm test
import 'dotenv/config';
import assert from 'node:assert/strict';
import { AddressInfo } from 'node:net';
process.env.DISABLE_PUSH = '1';
import { app } from '../src/app';
import { pool, q } from '../src/config/db';

let base = '';
let passed = 0;
async function api(method: string, path: string, body?: any, token?: string) {
  const res = await fetch(base + path, {
    method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  return { status: res.status, data: text ? JSON.parse(text) : null };
}
function ok(name: string, cond: boolean, extra?: any) { assert.ok(cond, `${name} ${extra ? JSON.stringify(extra) : ''}`); passed++; console.log('  ✔', name); }

const vnToday = () => new Date(Date.now() + 7 * 3600e3).toISOString().slice(0, 10);
const addDays = (d: string, n: number) => new Date(new Date(d + 'T00:00:00Z').getTime() + n * 86400e3).toISOString().slice(0, 10);

async function main() {
  await q('TRUNCATE users, venues, bookings, notifications CASCADE');
  const server = app.listen(0);
  base = `http://localhost:${(server.address() as AddressInfo).port}/api`;
  const D = addDays(vnToday(), 3); // ngày chơi: 3 ngày tới

  console.log('Auth & hồ sơ');
  const o = await api('POST', '/auth/register', { fullName: 'Chủ sân', email: 'o@t.vn', password: '123456', role: 'OWNER' });
  ok('đăng ký chủ sân', o.status === 201 && !!o.data.token);
  const p = await api('POST', '/auth/register', { fullName: 'Người chơi', email: 'p@t.vn', password: '123456' });
  const p2 = await api('POST', '/auth/register', { fullName: 'Người chơi 2', email: 'p2@t.vn', password: '123456' });
  ok('email trùng -> 409', (await api('POST', '/auth/register', { fullName: 'X Y', email: 'P@t.vn', password: '123456' })).status === 409);
  ok('mật khẩu sai -> 401', (await api('POST', '/auth/login', { email: 'p@t.vn', password: 'sai' })).status === 401);
  const OT = o.data.token, PT = (await api('POST', '/auth/login', { email: 'p@t.vn', password: '123456' })).data.token, P2T = p2.data.token;
  const prof = await api('PUT', '/auth/me', { fullName: 'An Nguyễn', phone: '0909' }, PT);
  ok('sửa hồ sơ', prof.data.fullName === 'An Nguyễn' && prof.data.phone === '0909');
  ok('đổi mật khẩu', (await api('PUT', '/auth/password', { oldPassword: '123456', newPassword: 'abcdef' }, PT)).status === 204);
  ok('đăng nhập bằng mật khẩu mới', (await api('POST', '/auth/login', { email: 'p@t.vn', password: 'abcdef' })).status === 200);
  ok('validate dữ liệu -> 400', (await api('POST', '/auth/register', { email: 'bad' })).status === 400);

  console.log('Cơ sở sân (CRUD)');
  ok('người chơi không được tạo sân -> 403', (await api('POST', '/venues', { name: 'X', address: 'abc' }, PT)).status === 403);
  const v = await api('POST', '/venues', { name: 'Sân Test', address: '1 Lê Lợi', district: 'Quận 1', amenities: ['PARKING', 'DRINKS'] }, OT);
  ok('thêm cơ sở', v.status === 201 && v.data.amenities.length === 2, v.data);
  const V = v.data.id;
  const v2 = await api('POST', '/venues', { name: 'Sân Xóa', address: '2 Lê Lợi' }, OT);
  const vu = await api('PUT', `/venues/${V}`, { phone: '0281234', amenities: ['PARKING', 'DRINKS', 'LOCKER'] }, OT);
  ok('sửa cơ sở + tiện ích', vu.data.phone === '0281234' && vu.data.amenities.length === 3);
  ok('người khác sửa -> 403', (await api('PUT', `/venues/${V}`, { name: 'Hack' }, PT)).status === 403);
  ok('xóa cơ sở chưa có đơn', (await api('DELETE', `/venues/${v2.data.id}`, undefined, OT)).status === 204);
  ok('xem cơ sở đã xóa -> 404', (await api('GET', `/venues/${v2.data.id}`)).status === 404);

  console.log('Sân con & bảng giá (CRUD)');
  const c1 = await api('POST', `/venues/${V}/courts`, { name: 'Sân 1' }, OT);
  const c2 = await api('POST', `/venues/${V}/courts`, { name: 'Sân 2' }, OT);
  const c3 = await api('POST', `/venues/${V}/courts`, { name: 'Sân tạm' }, OT);
  ok('thêm sân con', c1.status === 201 && c2.status === 201);
  ok('tên sân con trùng -> 409', (await api('POST', `/venues/${V}/courts`, { name: 'Sân 1' }, OT)).status === 409);
  ok('sửa sân con', (await api('PUT', `/courts/${c3.data.id}`, { name: 'Sân 3' }, OT)).data.name === 'Sân 3');
  ok('xóa sân con', (await api('DELETE', `/courts/${c3.data.id}`, undefined, OT)).status === 204);
  const pr = await api('POST', `/venues/${V}/price-rules`, { dayType: 'ALL', startTime: '06:00', endTime: '17:00', pricePerSlot: 50000 }, OT);
  await api('POST', `/venues/${V}/price-rules`, { dayType: 'ALL', startTime: '17:00', endTime: '22:00', pricePerSlot: 80000 }, OT);
  ok('thêm bảng giá', pr.status === 201);
  ok('sửa bảng giá', (await api('PUT', `/price-rules/${pr.data.id}`, { pricePerSlot: 60000 }, OT)).data.pricePerSlot === 60000);
  const tmp = await api('POST', `/venues/${V}/price-rules`, { startTime: '05:00', endTime: '06:00', pricePerSlot: 1 }, OT);
  ok('xóa bảng giá', (await api('DELETE', `/price-rules/${tmp.data.id}`, undefined, OT)).status === 204);
  ok('giờ bắt đầu >= giờ kết thúc -> lỗi', (await api('POST', `/venues/${V}/price-rules`, { startTime: '10:00', endTime: '09:00', pricePerSlot: 1 }, OT)).status >= 400);

  console.log('Tìm kiếm & lọc');
  ok('tìm theo tên', (await api('GET', '/venues?q=test')).data.length === 1);
  ok('lọc quận', (await api('GET', '/venues?district=Quận 2')).data.length === 0);
  ok('lọc tiện ích (đủ)', (await api('GET', '/venues?amenities=PARKING,LOCKER')).data.length === 1);
  ok('lọc tiện ích (thiếu)', (await api('GET', '/venues?amenities=AC')).data.length === 0);
  ok('lọc giá tối đa', (await api('GET', '/venues?maxPrice=55000')).data.length === 0);

  console.log('Lưới giờ trống & đặt sân');
  const S1 = c1.data.id, S2 = c2.data.id;
  let grid = await api('GET', `/venues/${V}/availability?date=${D}`);
  ok('lưới có 2 sân x 16 khung', grid.data.courts.length === 2 && grid.data.hours.length === 16);
  ok('giá theo khung giờ', grid.data.courts[0].slots.find((s: any) => s.startTime === '18:00').price === 80000);
  const b1 = await api('POST', '/bookings', { venueId: V, playDate: D, slots: [{ courtId: S1, startTime: '18:00' }, { courtId: S1, startTime: '19:00' }] }, PT);
  ok('đặt 2 khung liền kề', b1.status === 201 && b1.data.totalAmount === 160000 && b1.data.status === 'PENDING', b1.data);
  ok('trả về link VietQR', b1.data.paymentQr.includes('amount=160000'));
  ok('đặt trùng -> 409', (await api('POST', '/bookings', { venueId: V, playDate: D, slots: [{ courtId: S1, startTime: '19:00' }] }, P2T)).status === 409);
  const race = await Promise.all([1, 2, 3].map(() => api('POST', '/bookings', { venueId: V, playDate: D, slots: [{ courtId: S2, startTime: '20:00' }] }, P2T)));
  ok('3 người đặt cùng lúc -> chỉ 1 thành công', race.filter((r) => r.status === 201).length === 1 && race.filter((r) => r.status === 409).length === 2);
  ok('ngoài giờ mở cửa -> 400', (await api('POST', '/bookings', { venueId: V, playDate: D, slots: [{ courtId: S1, startTime: '22:00' }] }, PT)).status === 400);
  ok('ngày đã qua -> 400', (await api('POST', '/bookings', { venueId: V, playDate: addDays(vnToday(), -1), slots: [{ courtId: S1, startTime: '10:00' }] }, PT)).status === 400);
  grid = await api('GET', `/venues/${V}/availability?date=${D}`);
  const st = (c: number, h: string) => grid.data.courts[c].slots.find((s: any) => s.startTime === h).status;
  ok('lưới hiển thị PENDING / FREE', st(0, '18:00') === 'PENDING' && st(0, '10:00') === 'FREE');

  console.log('Duyệt / từ chối / thanh toán / hủy');
  ok('chủ sân nhận thông báo đơn mới', (await api('GET', '/notifications', undefined, OT)).data.some((n: any) => n.type === 'BOOKING_CREATED'));
  ok('thanh toán mô phỏng', (await api('POST', `/bookings/${b1.data.id}/pay`, undefined, PT)).data.payment.status === 'PAID');
  ok('thanh toán lại -> 400', (await api('POST', `/bookings/${b1.data.id}/pay`, undefined, PT)).status === 400);
  ok('người chơi không được duyệt -> 403', (await api('PATCH', `/bookings/${b1.data.id}/approve`, undefined, PT)).status === 403);
  ok('chủ sân duyệt', (await api('PATCH', `/bookings/${b1.data.id}/approve`, undefined, OT)).data.status === 'CONFIRMED');
  grid = await api('GET', `/venues/${V}/availability?date=${D}`);
  ok('lưới hiển thị BOOKED sau duyệt', st(0, '18:00') === 'BOOKED');
  ok('người chơi nhận thông báo duyệt', (await api('GET', '/notifications', undefined, PT)).data[0].type === 'BOOKING_CONFIRMED');
  const raceWin = race.find((r) => r.status === 201)!.data;
  const rj = await api('PATCH', `/bookings/${raceWin.id}/reject`, { reason: 'Sân bảo trì' }, OT);
  ok('chủ sân từ chối', rj.data.status === 'REJECTED' && rj.data.rejectReason === 'Sân bảo trì');
  ok('slot bị từ chối được nhả, đặt lại được', (await api('POST', '/bookings', { venueId: V, playDate: D, slots: [{ courtId: S2, startTime: '20:00' }] }, PT)).status === 201);
  ok('đơn của chủ sân lọc theo trạng thái', (await api('GET', `/bookings/owner?status=PENDING`, undefined, OT)).data.length === 1);
  ok('người khác xem đơn -> 403', (await api('GET', `/bookings/${b1.data.id}`, undefined, P2T)).status === 403);

  const cancelled = await api('PATCH', `/bookings/${b1.data.id}/cancel`, undefined, PT);
  ok('hủy trước 12h -> CANCELLED + hoàn tiền', cancelled.data.status === 'CANCELLED' && cancelled.data.payment.status === 'REFUNDED');
  ok('hủy lần 2 -> 400', (await api('PATCH', `/bookings/${b1.data.id}/cancel`, undefined, PT)).status === 400);
  // Đơn sắp chơi trong < 12h: đặt rồi dời ngày chơi về hôm nay bằng SQL để kiểm tra chính sách
  const late = await api('POST', '/bookings', { venueId: V, playDate: D, slots: [{ courtId: S1, startTime: '21:00' }] }, PT);
  const soon = new Date(Date.now() + 7 * 3600e3 + 2 * 3600e3); // VN time + 2h
  await q('UPDATE bookings SET play_date=$2 WHERE id=$1', [late.data.id, soon.toISOString().slice(0, 10)]);
  await q('UPDATE booking_slots SET play_date=$2, start_time=$3, end_time=$3::time + interval \'1 hour\' WHERE booking_id=$1',
    [late.data.id, soon.toISOString().slice(0, 10), soon.toISOString().slice(11, 13) + ':00']);
  ok('hủy sát giờ (<12h) -> 400', (await api('PATCH', `/bookings/${late.data.id}/cancel`, undefined, PT)).status === 400);

  console.log('Lịch sử & xóa');
  const mine = await api('GET', '/bookings/mine', undefined, PT);
  ok('lịch sử đặt sân', mine.data.length === 3);
  ok('lọc lịch sử theo trạng thái', (await api('GET', '/bookings/mine?status=CANCELLED', undefined, PT)).data.length === 1);
  ok('không xóa được đơn đang chờ -> 400', (await api('DELETE', `/bookings/${late.data.id}`, undefined, PT)).status === 400);
  ok('xóa đơn đã hủy khỏi lịch sử', (await api('DELETE', `/bookings/${b1.data.id}`, undefined, PT)).status === 204);
  ok('không xóa được sân con đã có lịch -> 409', (await api('DELETE', `/courts/${S1}`, undefined, OT)).status === 409);
  ok('không xóa được cơ sở đã có đơn -> 409', (await api('DELETE', `/venues/${V}`, undefined, OT)).status === 409);

  console.log('Nhắc lịch');
  await api('PATCH', `/bookings/${late.data.id}/approve`, undefined, OT);
  const { sendReminders } = await import('../src/services/bookingService');
  await q(`UPDATE booking_slots SET start_time = ((now() AT TIME ZONE 'Asia/Ho_Chi_Minh') + interval '30 minutes')::time,
           play_date = ((now() AT TIME ZONE 'Asia/Ho_Chi_Minh') + interval '30 minutes')::date WHERE booking_id=$1`, [late.data.id]);
  await q(`UPDATE bookings SET play_date = ((now() AT TIME ZONE 'Asia/Ho_Chi_Minh') + interval '30 minutes')::date WHERE id=$1`, [late.data.id]);
  ok('gửi nhắc lịch trước giờ chơi', (await sendReminders()) === 1);
  ok('không nhắc lặp lại', (await sendReminders()) === 0);

  console.log('Đánh giá (CRUD) & thông báo');
  ok('chưa chơi xong không đánh giá -> 400', (await api('POST', '/reviews', { bookingId: late.data.id, rating: 5 }, PT)).status === 400);
  await q(`UPDATE bookings SET play_date = play_date - 2 WHERE id=$1`, [late.data.id]);
  await api('GET', '/bookings/mine', undefined, PT); // kích hoạt tự chuyển COMPLETED
  const rv = await api('POST', '/reviews', { bookingId: late.data.id, rating: 4, comment: 'Sân đẹp' }, PT);
  ok('thêm đánh giá', rv.status === 201);
  ok('đánh giá trùng đơn -> 409', (await api('POST', '/reviews', { bookingId: late.data.id, rating: 3 }, PT)).status === 409);
  ok('sửa đánh giá', (await api('PUT', `/reviews/${rv.data.id}`, { rating: 5 }, PT)).data.rating === 5);
  ok('điểm trung bình cập nhật', (await api('GET', `/venues/${V}`)).data.avgRating === 5);
  ok('xóa đánh giá', (await api('DELETE', `/reviews/${rv.data.id}`, undefined, PT)).status === 204);
  const notes = (await api('GET', '/notifications', undefined, PT)).data;
  ok('đánh dấu đã đọc', (await api('PATCH', `/notifications/${notes[0].id}/read`, undefined, PT)).data.isRead === true);
  ok('xóa thông báo', (await api('DELETE', `/notifications/${notes[0].id}`, undefined, PT)).status === 204);
  ok('đăng ký push token', (await api('POST', '/notifications/devices', { token: 'ExponentPushToken[abc123]' }, PT)).status === 204);

  console.log(`\nTẤT CẢ ${passed} KIỂM THỬ ĐẠT`);
  server.close();
  await pool.end();
}
main().catch(async (e) => { console.error('✘', e.message); await pool.end(); process.exit(1); });
