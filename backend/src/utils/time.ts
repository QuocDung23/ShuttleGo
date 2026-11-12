export const SLOT_MINUTES = 60;
export const CANCEL_BEFORE_HOURS = 12;

export const toMin = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
export const fromMin = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
export const hhmm = (t: string) => t.slice(0, 5);
/** Thời điểm bắt đầu theo giờ Việt Nam (UTC+7). */
export const vnDate = (date: string, time: string) => new Date(`${date}T${hhmm(time)}:00+07:00`);
export const isWeekend = (date: string) => [0, 6].includes(new Date(`${date}T00:00:00Z`).getUTCDay());

export interface PriceRule { dayType: 'WEEKDAY' | 'WEEKEND' | 'ALL'; startTime: string; endTime: string; pricePerSlot: number }
/** Giá của 1 slot: ưu tiên luật đúng loại ngày, sau đó luật ALL. */
export function priceFor(rules: PriceRule[], date: string, start: string): number | null {
  const type = isWeekend(date) ? 'WEEKEND' : 'WEEKDAY';
  const s = toMin(start);
  const hit = (r: PriceRule) => s >= toMin(r.startTime) && s < toMin(r.endTime);
  const r = rules.find((x) => x.dayType === type && hit(x)) ?? rules.find((x) => x.dayType === 'ALL' && hit(x));
  return r ? r.pricePerSlot : null;
}
