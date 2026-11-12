import { notFound } from '../../common/http-error.js';
import { definedOnly } from '../../common/validation.js';
import { AppDataSource } from '../../database/data-source.js';
import { getOrFail as getVenueOrFail } from '../venues/venues.service.js';
import { Court } from './court.entity.js';
import type { CreateCourtInput, QueryCourtsInput, UpdateCourtInput } from './courts.schema.js';

const repo = () => AppDataSource.getRepository(Court);

export const findAll = (query: QueryCourtsInput) =>
  repo().find({ where: definedOnly(query), order: { venueId: 'ASC', name: 'ASC' } });

export async function findOne(id: number) {
  const court = await repo().findOneBy({ id });
  if (!court) throw notFound(`Court #${id} not found`);
  return court;
}

export async function create(input: CreateCourtInput) {
  await getVenueOrFail(input.venueId);
  const saved = await repo().save(repo().create(input));
  return findOne(saved.id);
}

export async function update(id: number, input: UpdateCourtInput) {
  return repo().save(repo().merge(await findOne(id), input));
}

/** Fails with 409 if the court already has bookings — set isActive=false instead. */
export async function remove(id: number) {
  await repo().remove(await findOne(id));
}
