import { z } from 'zod';
import { UserRole, UserStatus } from '@/common/enums.js';
import { pagination } from '@/common/validation.js';

/** Vietnamese mobile number: 0901234567 or +84901234567 */
export const phoneString = z
  .string()
  .regex(/^(0\d{9}|\+84\d{9})$/, 'Invalid phone number');

export const createUserSchema = z.object({
  fullName: z.string().trim().min(1).max(100),
  phone: phoneString,
  password: z.string().min(6).max(72),
  role: z.enum(UserRole).optional(),
  status: z.enum(UserStatus).optional(),
  avatarUrl: z.string().nullable().optional(),
  fcmToken: z.string().nullable().optional(),
});

export const updateUserSchema = createUserSchema.partial();

export const queryUsersSchema = z.object({
  ...pagination,
  role: z.enum(UserRole).optional(),
  status: z.enum(UserStatus).optional(),
  /** search by full name or phone */
  search: z.string().trim().min(1).optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type QueryUsersInput = z.infer<typeof queryUsersSchema>;
