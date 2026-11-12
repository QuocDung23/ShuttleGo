import { z } from 'zod';
import { NotificationType } from '@/common/enums.js';
import { idParam, pagination, queryBoolean, queryId } from '@/common/validation.js';

export const createNotificationSchema = z.object({
  userId: idParam,
  type: z.enum(NotificationType),
  title: z.string().trim().min(1).max(200),
  body: z.string().min(1),
  bookingId: idParam.nullable().optional(),
  isRead: z.boolean().optional(),
});

export const updateNotificationSchema = createNotificationSchema.omit({ userId: true }).partial();

export const readAllSchema = z.object({ userId: idParam });

export const queryNotificationsSchema = z.object({
  ...pagination,
  userId: queryId,
  isRead: queryBoolean.optional(),
  type: z.enum(NotificationType).optional(),
});

export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
export type UpdateNotificationInput = z.infer<typeof updateNotificationSchema>;
export type QueryNotificationsInput = z.infer<typeof queryNotificationsSchema>;
