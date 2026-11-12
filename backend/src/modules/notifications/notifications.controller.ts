import type { Request, Response } from 'express';
import { assertSelfOrAdmin } from '@/common/auth.js';
import { UserRole } from '@/common/enums.js';
import { parseId } from '@/common/validation.js';
import {
  createNotificationSchema,
  queryNotificationsSchema,
  readAllSchema,
  updateNotificationSchema,
} from '@/modules/notifications/notifications.schema.js';
import * as service from '@/modules/notifications/notifications.service.js';
import { renderCreated, renderNoContent, renderOk } from '@/views/json.view.js';

export async function index(req: Request, res: Response) {
  const query = queryNotificationsSchema.parse(req.query);
  if (req.user!.role !== UserRole.ADMIN) query.userId = req.user!.id;
  renderOk(res, await service.findAll(query));
}

export async function markAllRead(req: Request, res: Response) {
  const { userId } = readAllSchema.parse(req.body);
  assertSelfOrAdmin(userId, req.user!);
  renderOk(res, await service.markAllRead(userId));
}

export async function show(req: Request, res: Response) {
  const notification = await service.findOne(parseId(req.params.id));
  assertSelfOrAdmin(notification.userId, req.user!);
  renderOk(res, notification);
}

export async function create(req: Request, res: Response) {
  renderCreated(res, await service.create(createNotificationSchema.parse(req.body)));
}

export async function update(req: Request, res: Response) {
  const id = parseId(req.params.id);
  const notification = await service.findOne(id);
  assertSelfOrAdmin(notification.userId, req.user!);
  renderOk(res, await service.update(id, updateNotificationSchema.parse(req.body)));
}

export async function remove(req: Request, res: Response) {
  const id = parseId(req.params.id);
  const notification = await service.findOne(id);
  assertSelfOrAdmin(notification.userId, req.user!);
  await service.remove(id);
  renderNoContent(res);
}
