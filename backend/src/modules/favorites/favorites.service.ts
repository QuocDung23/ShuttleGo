import { notFound } from '../../common/http-error.js';
import { definedOnly, paginate, skipTake } from '../../common/validation.js';
import { AppDataSource } from '../../database/data-source.js';
import { Favorite } from './favorite.entity.js';
import type { CreateFavoriteInput, QueryFavoritesInput } from './favorites.schema.js';

const repo = () => AppDataSource.getRepository(Favorite);

export async function findAll(query: QueryFavoritesInput) {
  const result = await repo().findAndCount({
    where: definedOnly({ userId: query.userId, venueId: query.venueId }),
    relations: { venue: true },
    order: { createdAt: 'DESC' },
    ...skipTake(query),
  });
  return paginate(result, query);
}

/** Idempotent: liking an already-liked venue returns the existing row. */
export async function create({ userId, venueId }: CreateFavoriteInput) {
  await repo().upsert({ userId, venueId }, { conflictPaths: ['userId', 'venueId'], skipUpdateIfNoValuesChanged: true });
  return repo().findOneOrFail({ where: { userId, venueId }, relations: { venue: true } });
}

export async function remove(userId: number, venueId: number) {
  const { affected } = await repo().delete({ userId, venueId });
  if (!affected) throw notFound('Favorite not found');
}
