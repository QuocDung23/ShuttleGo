import { Router } from 'express';
import { assertSelfOrAdmin, authenticate, requireRole } from '@/common/auth.js';
import { UserRole } from '@/common/enums.js';
import { parseId } from '@/common/validation.js';
import {
  createNotificationSchema,
  queryNotificationsSchema,
  readAllSchema,
  updateNotificationSchema,
} from '@/modules/notifications/notifications.schema.js';
import * as service from '@/modules/notifications/notifications.service.js';

export const notificationsRouter = Router();

notificationsRouter.use(authenticate);

notificationsRouter.get('/', async (req, res) => {
  const query = queryNotificationsSchema.parse(req.query);
  if (req.user!.role !== UserRole.ADMIN) query.userId = req.user!.id;
  res.json(await service.findAll(query));
});

/** Body: { userId } — marks all of the user's unread notifications as read. */
notificationsRouter.patch('/read-all', async (req, res) => {
  const { userId } = readAllSchema.parse(req.body);
  assertSelfOrAdmin(userId, req.user!);
  res.json(await service.markAllRead(userId));
});

notificationsRouter.get('/:id', async (req, res) => {
  const notification = await service.findOne(parseId(req.params.id));
  assertSelfOrAdmin(notification.userId, req.user!);
  res.json(notification);
});

/** System-generated notifications are created by admins. */
notificationsRouter.post('/', requireRole(UserRole.ADMIN), async (req, res) => {
  res.status(201).json(await service.create(createNotificationSchema.parse(req.body)));
});

notificationsRouter.patch('/:id', async (req, res) => {
  const id = parseId(req.params.id);
  const notification = await service.findOne(id);
  assertSelfOrAdmin(notification.userId, req.user!);
  res.json(await service.update(id, updateNotificationSchema.parse(req.body)));
});

notificationsRouter.delete('/:id', async (req, res) => {
  const id = parseId(req.params.id);
  const notification = await service.findOne(id);
  assertSelfOrAdmin(notification.userId, req.user!);
  await service.remove(id);
  res.status(204).end();
});
