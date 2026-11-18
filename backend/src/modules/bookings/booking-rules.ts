import type { SelectQueryBuilder } from 'typeorm';
import { BookingStatus } from '@/common/enums.js';
import { badRequest } from '@/common/http-error.js';
import { timeToMinutes } from '@/common/validation.js';
import type { PriceRule } from '@/modules/price-rules/price-rule.entity.js';

/** A pending booking holds its slot for five minutes, measured by the server clock. */
export const BOOKING_HOLD_MS = 5 * 60 * 1000;
/** Player selection holds are temporary UI locks and never create bookings. */
export const BOOKING_SELECTION_HOLD_MS = 4 * 60 * 1000;

type TimeRange = { startTime: string; endTime: string };

type OpeningRow = {
  isOpen: boolean;
  openTime: string | null;
  closeTime: string | null;
};

export type OpeningWindow = {
  isOpen: boolean;
  openTime: string | null;
  closeTime: string | null;
};

function toTimeString(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:00`;
}

/** 0 = Sunday, 6 = Saturday. `date` is a plain YYYY-MM-DD calendar date. */
export function dayOfWeekForDate(date: string) {
  return new Date(`${date}T00:00:00Z`).getUTCDay();
}

export function isWeekendDate(date: string) {
  const day = dayOfWeekForDate(date);
  return day === 0 || day === 6;
}

/**
 * Configured hours win. When a venue has no row for that weekday, fall back to
 * the window covered by its price rules. Rule edges are rounded outwards to
 * whole hours so the slot grid and the pricing helper agree.
 */
export function resolveOpeningWindow(
  row: OpeningRow | undefined,
  rules: Pick<PriceRule, 'startTime' | 'endTime'>[],
): OpeningWindow {
  if (row && !row.isOpen) return { isOpen: false, openTime: null, closeTime: null };
  if (row?.openTime && row.closeTime) {
    return { isOpen: true, openTime: row.openTime, closeTime: row.closeTime };
  }
  if (rules.length === 0) return { isOpen: false, openTime: null, closeTime: null };

  const firstStart = Math.min(...rules.map((rule) => timeToMinutes(rule.startTime)));
  const lastEnd = Math.max(...rules.map((rule) => timeToMinutes(rule.endTime)));
  return {
    isOpen: true,
    openTime: toTimeString(Math.floor(firstStart / 60) * 60),
    closeTime: toTimeString(Math.ceil(lastEnd / 60) * 60),
  };
}

/** Whole-hour slots that fit inside the opening window. */
export function buildHourSlots(openTime: string, closeTime: string): TimeRange[] {
  const first = Math.ceil(timeToMinutes(openTime) / 60) * 60;
  const last = Math.floor(timeToMinutes(closeTime) / 60) * 60;
  const slots: TimeRange[] = [];
  for (let start = first; start + 60 <= last; start += 60) {
    slots.push({ startTime: toTimeString(start), endTime: toTimeString(start + 60) });
  }
  return slots;
}

export function assertWholeHourRange(startTime: string, endTime: string) {
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  if (start % 60 !== 0 || end % 60 !== 0 || end <= start) {
    throw badRequest('Giờ đặt phải là các block một tiếng liên tiếp.');
  }
}

export function assertWithinWindow(
  window: OpeningWindow,
  startTime: string,
  endTime: string,
) {
  if (!window.isOpen || !window.openTime || !window.closeTime) {
    throw badRequest('Sân không mở cửa vào ngày này.');
  }
  assertWholeHourRange(startTime, endTime);

  const firstSlot = Math.ceil(timeToMinutes(window.openTime) / 60) * 60;
  const lastSlot = Math.floor(timeToMinutes(window.closeTime) / 60) * 60;
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  if (start < firstSlot || end > lastSlot) {
    throw badRequest('Giờ đặt nằm ngoài giờ mở cửa của sân.');
  }
}

/**
 * Price a whole-hour range. A slot must be fully covered by one price rule;
 * when rounded rules overlap, the highest price applies. The weekend
 * surcharge is added once per booking, never per hour.
 */
export function calculateBookingTotal(
  rules: Pick<PriceRule, 'startTime' | 'endTime' | 'pricePerHour'>[],
  weekendSurcharge: number | null | undefined,
  bookingDate: string,
  startTime: string,
  endTime: string,
) {
  assertWholeHourRange(startTime, endTime);
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  let subtotal = 0;

  for (let hour = start; hour < end; hour += 60) {
    const slotEnd = hour + 60;
    const covering = rules.filter((rule) => {
      const ruleStart = Math.floor(timeToMinutes(rule.startTime) / 60) * 60;
      const ruleEnd = Math.ceil(timeToMinutes(rule.endTime) / 60) * 60;
      return ruleStart <= hour && slotEnd <= ruleEnd;
    });
    if (covering.length === 0) {
      throw badRequest(`Khung giờ ${toTimeString(hour)} không có quy tắc giá phù hợp.`);
    }
    subtotal += Math.max(...covering.map((rule) => rule.pricePerHour));
  }

  return subtotal + (isWeekendDate(bookingDate) ? (weekendSurcharge ?? 0) : 0);
}

/**
 * Shared occupancy rule for both the public availability response and the
 * transactional overlap check. Expired pending checkout holds and cancelled
 * bookings are excluded; live checkout holds still block other players.
 */
export function applyActiveOccupancyFilter<T extends { status: BookingStatus }>(
  qb: SelectQueryBuilder<T>,
  alias = 'b',
) {
  return qb
    .andWhere(`${alias}.status <> :cancelled`, { cancelled: BookingStatus.CANCELLED })
    .andWhere(
      `NOT (${alias}.status = :pending AND ${alias}.holdExpiresAt IS NOT NULL AND ${alias}.holdExpiresAt < now())`,
      { pending: BookingStatus.PENDING },
    );
}
