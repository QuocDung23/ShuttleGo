import { notFound } from '@/common/http-error.js';
import { definedOnly, paginate, skipTake } from '@/common/validation.js';
import { AppDataSource } from '@/database/data-source.js';
import { Notification } from '@/modules/notifications/notification.entity.js';
import type {
  CreateNotificationInput,
  QueryNotificationsInput,
  UpdateNotificationInput,
} from '@/modules/notifications/notifications.schema.js';

const repo = () => AppDataSource.getRepository(Notification);

export async function findAll({ page, limit, ...filters }: QueryNotificationsInput) {
  const result = await repo().findAndCount({
    where: definedOnly(filters),
    order: { id: 'DESC' },
    ...skipTake({ page, limit }),
  });
  return paginate(result, { page, limit });
}

export async function findOne(id: number) {
  const notification = await repo().findOneBy({ id });
  if (!notification) throw notFound(`Notification #${id} not found`);
  return notification;
}

export async function create(input: CreateNotificationInput) {
  const saved = await repo().save(repo().create(input));
  return findOne(saved.id);
}

export async function update(id: number, input: UpdateNotificationInput) {
  return repo().save(repo().merge(await findOne(id), input));
}

/** Marks every unread notification of a user as read. */
export async function markAllRead(userId: number) {
  const { affected } = await repo().update({ userId, isRead: false }, { isRead: true });
  return { updated: affected ?? 0 };
}

export async function remove(id: number) {
  await repo().remove(await findOne(id));
}
