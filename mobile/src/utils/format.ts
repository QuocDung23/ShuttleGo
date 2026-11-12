import { BookingStatus } from '../models';
export const money = (n: number | null | undefined) => (n == null ? '—' : n.toLocaleString('vi-VN') + 'đ');
export const hhmm = (t: string) => t.slice(0, 5);
export const vnToday = () => new Date(Date.now() + 7 * 3600e3).toISOString().slice(0, 10);
export const addDays = (d: string, n: number) => new Date(new Date(d + 'T00:00:00Z').getTime() + n * 86400e3).toISOString().slice(0, 10);
export const dateLabel = (d: string) => { const [y, m, day] = d.split('-'); return `${day}/${m}/${y}`; };
export const STATUS_LABEL: Record<BookingStatus, string> = {
  PENDING: 'Chờ duyệt', CONFIRMED: 'Đã duyệt', REJECTED: 'Bị từ chối', CANCELLED: 'Đã hủy', COMPLETED: 'Hoàn thành',
};
export const STATUS_COLOR: Record<BookingStatus, string> = {
  PENDING: '#F59E0B', CONFIRMED: '#16A34A', REJECTED: '#DC2626', CANCELLED: '#6B7280', COMPLETED: '#2563EB',
};
