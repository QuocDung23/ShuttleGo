import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { HttpError } from '../utils/http';

export interface AuthUser { id: string; role: 'PLAYER' | 'OWNER' }
declare global { namespace Express { interface Request { user: AuthUser } } }

const secret = () => process.env.JWT_SECRET || 'dev-secret';
export const signToken = (u: AuthUser) => jwt.sign(u, secret(), { expiresIn: '7d' });

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const h = req.headers.authorization;
  if (!h?.startsWith('Bearer ')) return next(new HttpError(401, 'Chưa đăng nhập'));
  try {
    const p = jwt.verify(h.slice(7), secret()) as AuthUser;
    req.user = { id: p.id, role: p.role };
    next();
  } catch { next(new HttpError(401, 'Phiên đăng nhập hết hạn')); }
}
export const requireOwner = (req: Request, _res: Response, next: NextFunction) =>
  req.user.role === 'OWNER' ? next() : next(new HttpError(403, 'Chỉ chủ sân được phép'));
