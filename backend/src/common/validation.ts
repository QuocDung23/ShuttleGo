import { z } from 'zod';
import { badRequest } from '@/common/http-error.js';

/** Route param ":id" -> positive integer */
export const idParam = z.coerce.number().int().positive();

export function parseId(value: unknown, name = 'id'): number {
  const result = idParam.safeParse(value);
  if (!result.success) throw badRequest(`Invalid ${name}`);
  return result.data;
}

/** "HH:mm" or "HH:mm:ss" */
export const timeString = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, 'Must be HH:mm or HH:mm:ss');

/** "YYYY-MM-DD" */
export const dateString = z.iso.date();

/** Query-string boolean: "true"/"false"/"1"/"0" */
export const queryBoolean = z
  .enum(['true', 'false', '1', '0'])
  .transform((v) => v === 'true' || v === '1');

/** Optional integer id in a query string */
export const queryId = z.coerce.number().int().positive().optional();

export const pagination = {
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
};

export interface PageQuery {
  page: number;
  limit: number;
}

export const skipTake = ({ page, limit }: PageQuery) => ({
  skip: (page - 1) * limit,
  take: limit,
});

export const paginate = <T>([data, total]: [T[], number], { page, limit }: PageQuery) => ({
  data,
  meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
});

/** "HH:mm[:ss]" -> minutes since midnight */
export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

export function assertTimeRange(start: string, end: string, label = 'time range') {
  if (timeToMinutes(end) <= timeToMinutes(start)) {
    throw badRequest(`Invalid ${label}: end must be after start`);
  }
}

/** Escapes LIKE wildcards so user input is matched literally. */
export const escapeLike = (value: string) => value.replace(/[\\%_]/g, (c) => `\\${c}`);

/** Drops undefined keys (TypeORM 1.x throws on undefined values in `where`). */
export function definedOnly<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined),
  ) as Partial<T>;
}
