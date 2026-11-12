import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { q1 } from '../config/db';
import { signToken } from '../middleware/auth';
import { HttpError, notFound } from '../utils/http';

export const registerSchema = z.object({
  fullName: z.string().min(2), email: z.string().email(), password: z.string().min(6),
  phone: z.string().optional(), role: z.enum(['PLAYER', 'OWNER']).default('PLAYER'),
});
export const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });
export const profileSchema = z.object({
  fullName: z.string().min(2).optional(), phone: z.string().nullable().optional(), avatarUrl: z.string().url().nullable().optional(),
});
export const passwordSchema = z.object({ oldPassword: z.string(), newPassword: z.string().min(6) });

const COLS = 'id, full_name, email, phone, avatar_url, role, created_at';

export async function register(d: z.infer<typeof registerSchema>) {
  const hash = await bcrypt.hash(d.password, 10);
  const u = await q1(
    `INSERT INTO users (full_name, email, phone, password_hash, role) VALUES ($1,lower($2),$3,$4,$5) RETURNING ${COLS}`,
    [d.fullName, d.email, d.phone ?? null, hash, d.role]);
  return { user: u, token: signToken({ id: u.id, role: u.role }) };
}
export async function login(d: z.infer<typeof loginSchema>) {
  const u = await q1(`SELECT ${COLS}, password_hash FROM users WHERE email = lower($1)`, [d.email]);
  if (!u || !(await bcrypt.compare(d.password, u.passwordHash))) throw new HttpError(401, 'Sai email hoặc mật khẩu');
  delete u.passwordHash;
  return { user: u, token: signToken({ id: u.id, role: u.role }) };
}
export async function me(id: string) {
  const u = await q1(`SELECT ${COLS} FROM users WHERE id=$1`, [id]);
  if (!u) throw notFound('Người dùng');
  return u;
}
export async function updateProfile(id: string, d: z.infer<typeof profileSchema>) {
  const u = await q1(
    `UPDATE users SET full_name=COALESCE($2,full_name), phone=CASE WHEN $3::boolean THEN $4 ELSE phone END,
       avatar_url=CASE WHEN $5::boolean THEN $6 ELSE avatar_url END, updated_at=now()
     WHERE id=$1 RETURNING ${COLS}`,
    [id, d.fullName ?? null, d.phone !== undefined, d.phone ?? null, d.avatarUrl !== undefined, d.avatarUrl ?? null]);
  if (!u) throw notFound('Người dùng');
  return u;
}
export async function changePassword(id: string, d: z.infer<typeof passwordSchema>) {
  const u = await q1('SELECT password_hash FROM users WHERE id=$1', [id]);
  if (!u || !(await bcrypt.compare(d.oldPassword, u.passwordHash))) throw new HttpError(400, 'Mật khẩu cũ không đúng');
  await q1('UPDATE users SET password_hash=$2, updated_at=now() WHERE id=$1', [id, await bcrypt.hash(d.newPassword, 10)]);
}
