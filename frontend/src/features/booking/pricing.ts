import type { OccupiedRange } from '@/models/booking';
import type { PriceRule } from '@/models/venue';
import { timeToMinutes } from '@/shared/format';

/**
 * Frontend preview of the server pricing rules. The backend always
 * recalculates the total on POST /bookings and rejects a mismatch, so these
 * helpers only drive the UI — never trust them as the final amount.
 */

const HOUR = 60;

function toTimeString(minutes: number) {
  const hours = Math.floor(minutes / HOUR);
  const mins = minutes % HOUR;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:00`;
}

function dayOfWeekForDate(date: string) {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

function isWeekendDate(date: string) {
  const day = dayOfWeekForDate(date);
  return day === 0 || day === 6;
}

/** Whole-hour slots that fit inside the opening window, same as the backend. */
export function buildHourSlots(openTime: string, closeTime: string) {
  const first = Math.ceil(timeToMinutes(openTime) / HOUR) * HOUR;
  const last = Math.floor(timeToMinutes(closeTime) / HOUR) * HOUR;
  const slots: { startTime: string; endTime: string }[] = [];
  for (let start = first; start + HOUR <= last; start += HOUR) {
    slots.push({ startTime: toTimeString(start), endTime: toTimeString(start + HOUR) });
  }
  return slots;
}

export function isSlotOccupied(
  slot: { startTime: string; endTime: string },
  ranges: OccupiedRange[],
) {
  const start = timeToMinutes(slot.startTime);
  const end = timeToMinutes(slot.endTime);
  return ranges.some((range) => {
    const rangeStart = timeToMinutes(range.startTime);
    const rangeEnd = timeToMinutes(range.endTime);
    return rangeStart < end && rangeEnd > start;
  });
}

/** A slot must be fully covered by one rule; overlapping rounded rules use the higher price. */
export function priceForSlot(
  rules: PriceRule[],
  slot: { startTime: string; endTime: string },
): number | null {
  const start = timeToMinutes(slot.startTime);
  const end = timeToMinutes(slot.endTime);
  const covering = rules.filter((rule) => {
    const ruleStart = Math.floor(timeToMinutes(rule.startTime) / HOUR) * HOUR;
    const ruleEnd = Math.ceil(timeToMinutes(rule.endTime) / HOUR) * HOUR;
    return ruleStart <= start && end <= ruleEnd;
  });
  if (covering.length === 0) return null;
  return Math.max(...covering.map((rule) => rule.pricePerHour));
}

export function calculateBookingTotal({
  rules,
  weekendSurcharge,
  bookingDate,
  slots,
}: {
  rules: PriceRule[];
  weekendSurcharge: number | null | undefined;
  bookingDate: string;
  slots: { startTime: string; endTime: string }[];
}): number | null {
  if (slots.length === 0) return null;
  let subtotal = 0;
  for (const slot of slots) {
    const price = priceForSlot(rules, slot);
    if (price === null) return null;
    subtotal += price;
  }
  return subtotal + (isWeekendDate(bookingDate) ? (weekendSurcharge ?? 0) : 0);
}

export function isContiguousIndexes(indexes: number[]) {
  const sorted = [...indexes].sort((a, b) => a - b);
  return sorted.every((value, index) => index === 0 || value === sorted[index - 1] + 1);
}

export function hasValidBankDetails(venue: {
  bankAccountNo?: string | null;
  bankQrImageUrl?: string | null;
}) {
  return Boolean(venue.bankAccountNo || venue.bankQrImageUrl);
}

export function formatCountdown(milliseconds: number) {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
