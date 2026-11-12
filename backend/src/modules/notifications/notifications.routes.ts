import { Router } from 'express';
import { parseId } from '../../common/validation.js';
import {
  createNotificationSchema,
  queryNotificationsSchema,
  readAllSchema,
  updateNotificationSchema,
} from './notifications.schema.js';
import * as service from './notifications.service.js';

export const notificationsRouter = Router();

notificationsRouter.get('/', async (req, res) => {
  res.json(await service.findAll(queryNotificationsSchema.parse(req.query)));
});

/** Body: { userId } */
notificationsRouter.patch('/read-all', async (req, res) => {
  res.json(await service.markAllRead(readAllSchema.parse(req.body).userId));
});

notificationsRouter.get('/:id', async (req, res) => {
  res.json(await service.findOne(parseId(req.params.id)));
});

notificationsRouter.post('/', async (req, res) => {
  res.status(201).json(await service.create(createNotificationSchema.parse(req.body)));
});

notificationsRouter.patch('/:id', async (req, res) => {
  res.json(await service.update(parseId(req.params.id), updateNotificationSchema.parse(req.body)));
});

notificationsRouter.delete('/:id', async (req, res) => {
  await service.remove(parseId(req.params.id));
  res.status(204).end();
});
