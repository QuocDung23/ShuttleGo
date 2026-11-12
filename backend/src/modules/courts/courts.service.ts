import type { AuthUser } from '@/common/auth.js';
import { notFound } from '@/common/http-error.js';
import { definedOnly } from '@/common/validation.js';
import { AppDataSource } from '@/database/data-source.js';
import { Court } from '@/modules/courts/court.entity.js';
import type { CreateCourtInput, QueryCourtsInput, UpdateCourtInput } from '@/modules/courts/courts.schema.js';
import { assertCanManageVenue } from '@/modules/venues/venues.service.js';

const repo = () => AppDataSource.getRepository(Court);

export const findAll = (query: QueryCourtsInput) =>
  repo().find({ where: definedOnly(query), order: { venueId: 'ASC', name: 'ASC' } });

export async function findOne(id: number) {
  const court = await repo().findOneBy({ id });
  if (!court) throw notFound(`Court #${id} not found`);
  return court;
}

export async function create(input: CreateCourtInput, user: AuthUser) {
  await assertCanManageVenue(input.venueId, user);
  const saved = await repo().save(repo().create(input));
  return findOne(saved.id);
}

export async function update(id: number, input: UpdateCourtInput, user: AuthUser) {
  const court = await findOne(id);
  await assertCanManageVenue(court.venueId, user);
  return repo().save(repo().merge(court, input));
}

/** Fails with 409 if the court already has bookings — set isActive=false instead. */
export async function remove(id: number, user: AuthUser) {
  const court = await findOne(id);
  await assertCanManageVenue(court.venueId, user);
  await repo().remove(court);
}
