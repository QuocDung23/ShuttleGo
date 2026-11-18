/** Shared display formatters for dates, money and times. */

export function formatMoney(amount: number): string {
  return `${Math.round(amount).toLocaleString('vi-VN')}đ`;
}

export function formatCompactMoney(amount: number): string {
  const value = Math.round(amount);
  if (value >= 1_000_000) {
    const millions = value / 1_000_000;
    return `${Number.isInteger(millions) ? millions : millions.toFixed(1).replace(/\.0$/, '')}tr`;
  }
  if (value >= 1_000) return `${Math.round(value / 1_000)}k`;
  return String(value);
}

export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.slice(0, 5).split(':').map(Number);
  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) return 0;
  return hours * 60 + minutes;
}

export function formatTimeRange(startTime: string, endTime: string): string {
  return `${startTime.slice(0, 5)} – ${endTime.slice(0, 5)}`;
}

const WEEKDAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

/** Format a YYYY-MM-DD string as "T7, 31/10". */
export function formatBookingDate(date: string): string {
  const [year, month, day] = date.split('-').map(Number);
  if (!year || !month || !day) return date;
  const parsed = new Date(year, month - 1, day);
  return `${WEEKDAYS[parsed.getDay()]}, ${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}`;
}

/** Local YYYY-MM-DD for a Date instance (avoids UTC shift from toISOString). */
export function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

/** Short relative label from an ISO timestamp, e.g. "15 phút trước". */
export function formatRelativeTime(iso: string): string {
  const timestamp = new Date(iso).getTime();
  if (Number.isNaN(timestamp)) return '';
  const minutes = Math.max(0, Math.floor((Date.now() - timestamp) / 60_000));
  if (minutes < 1) return 'Vừa xong';
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} ngày trước`;
  return formatBookingDate(toDateKey(new Date(timestamp)));
}
