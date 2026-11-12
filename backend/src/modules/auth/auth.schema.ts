import { z } from 'zod';
import { UserRole } from '@/common/enums.js';
import { phoneString } from '@/modules/users/users.schema.js';

export const registerSchema = z.object({
  fullName: z.string().trim().min(1).max(100),
  phone: phoneString,
  password: z.string().min(6).max(72),
  /** Players and owners can self-register; admins are created by other admins. */
  role: z.enum([UserRole.PLAYER, UserRole.OWNER]).optional(),
  avatarUrl: z.string().nullable().optional(),
  fcmToken: z.string().nullable().optional(),
});

export const loginSchema = z.object({
  phone: phoneString,
  password: z.string().min(1).max(72),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
