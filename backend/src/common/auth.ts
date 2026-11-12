import type { RequestHandler } from 'express';
import { JWT_SECRET } from '@/config/auth.js';
import { UserRole } from '@/common/enums.js';
import { forbidden, unauthorized } from '@/common/http-error.js';
import { verifyAuthToken } from '@/common/jwt.js';

export interface AuthUser {
  id: number;
  role: UserRole;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

/** Reads the `Authorization: Bearer <token>` header and attaches `req.user`. */
export const authenticate: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    next(unauthorized('Missing bearer token'));
    return;
  }
  const payload = verifyAuthToken(header.slice(7).trim(), JWT_SECRET);
  if (!payload) {
    next(unauthorized('Invalid or expired token'));
    return;
  }
  req.user = { id: payload.sub, role: payload.role };
  next();
};

/** Allows only the listed roles. Must run after `authenticate`. */
export function requireRole(...roles: UserRole[]): RequestHandler {
  return (req, _res, next) => {
    if (!req.user) {
      next(unauthorized());
      return;
    }
    if (!roles.includes(req.user.role)) {
      next(forbidden(`Requires role: ${roles.join(' or ')}`));
      return;
    }
    next();
  };
}

/** Throws 403 unless the user is an admin or owns the row. */
export function assertSelfOrAdmin(ownerId: number, user: AuthUser, message?: string): void {
  if (user.role !== UserRole.ADMIN && ownerId !== user.id) {
    throw forbidden(message ?? 'You can only access your own data');
  }
}
