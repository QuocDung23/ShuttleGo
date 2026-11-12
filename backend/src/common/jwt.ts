import { createHmac, timingSafeEqual } from 'node:crypto';
import type { UserRole } from '@/common/enums.js';

export interface AuthTokenPayload {
  /** User id */
  sub: number;
  role: UserRole;
  /** Issued at (unix seconds) */
  iat: number;
  /** Expires at (unix seconds) */
  exp: number;
}

const encodePart = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url');

const sign = (data: string, secret: string) =>
  createHmac('sha256', secret).update(data).digest('base64url');

/** Creates a compact HS256 JWT: header.payload.signature */
export function signAuthToken(
  sub: number,
  role: UserRole,
  secret: string,
  ttlSeconds: number,
): string {
  const now = Math.floor(Date.now() / 1000);
  const header = encodePart({ alg: 'HS256', typ: 'JWT' });
  const payload = encodePart({ sub, role, iat: now, exp: now + ttlSeconds });
  const body = `${header}.${payload}`;
  return `${body}.${sign(body, secret)}`;
}

/** Returns the payload if the token is well-formed, correctly signed and not expired. */
export function verifyAuthToken(token: string, secret: string): AuthTokenPayload | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [header, payload, signature] = parts;
  const expected = sign(`${header}.${payload}`, secret);
  const given = Buffer.from(signature);
  const wanted = Buffer.from(expected);
  if (given.length !== wanted.length || !timingSafeEqual(given, wanted)) return null;

  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString()) as Partial<AuthTokenPayload>;
    if (typeof data.sub !== 'number' || typeof data.role !== 'string' || typeof data.exp !== 'number') {
      return null;
    }
    if (data.exp <= Math.floor(Date.now() / 1000)) return null;
    return data as AuthTokenPayload;
  } catch {
    return null;
  }
}
