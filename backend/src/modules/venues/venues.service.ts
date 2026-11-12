import { ILike, In, type FindOptionsWhere } from 'typeorm';
import { badRequest, notFound } from '../../common/http-error.js';
import { definedOnly, escapeLike, paginate, skipTake } from '../../common/validation.js';
import { AppDataSource } from '../../database/data-source.js';
import { Amenity } from '../amenities/amenity.entity.js';
import { Venue } from './venue.entity.js';
import type {
  CreateVenueInput,
  QueryVenuesInput,
  ReviewVenueInput,
  UpdateVenueInput,
} from './venues.schema.js';

const repo = () => AppDataSource.getRepository(Venue);

export async function findAll(query: QueryVenuesInput) {
  const base: FindOptionsWhere<Venue> = definedOnly({
    ownerId: query.ownerId,
    status: query.status,
    city: query.city && ILike(escapeLike(query.city)),
    district: query.district && ILike(escapeLike(query.district)),
  });
  const term = query.search && `%${escapeLike(query.search)}%`;
  const where = term
    ? [
        { ...base, name: ILike(term) },
        { ...base, address: ILike(term) },
      ]
    : base;

  const result = await repo().findAndCount({
    where,
    relations: { amenities: true },
    order: query.sort === 'name' ? { name: 'ASC' } : { id: 'DESC' },
    ...skipTake(query),
  });
  return paginate(result, query);
}

/** Venue detail incl. owner, amenities, courts, operating hours and price rules. */
export async function findOne(id: number) {
  const venue = await repo().findOne({
    where: { id },
    relations: {
      owner: true,
      amenities: true,
      courts: true,
      operatingHours: true,
      priceRules: true,
    },
    order: {
      courts: { name: 'ASC' },
      operatingHours: { dayOfWeek: 'ASC' },
      priceRules: { startTime: 'ASC' },
    },
  });
  if (!venue) throw notFound(`Venue #${id} not found`);
  return venue;
}

/** Plain venue row, throws 404. Also used by other modules. */
export async function getOrFail(id: number) {
  const venue = await repo().findOneBy({ id });
  if (!venue) throw notFound(`Venue #${id} not found`);
  return venue;
}

export async function create({ amenityIds, ...input }: CreateVenueInput) {
  const venue = repo().create(input);
  if (amenityIds) venue.amenities = await loadAmenities(amenityIds);
  const saved = await repo().save(venue);
  return findOne(saved.id);
}

export async function update(id: number, { amenityIds, ...input }: UpdateVenueInput) {
  const venue = await getOrFail(id);
  repo().merge(venue, input);
  if (amenityIds) venue.amenities = await loadAmenities(amenityIds);
  await repo().save(venue);
  return findOne(id);
}

export async function review(id: number, input: ReviewVenueInput) {
  const venue = await getOrFail(id);
  repo().merge(venue, {
    status: input.status,
    reviewedBy: input.reviewedBy,
    reviewNote: input.reviewNote ?? null,
    reviewedAt: new Date(),
  });
  await repo().save(venue);
  return findOne(id);
}

export async function remove(id: number) {
  await repo().remove(await getOrFail(id));
}

export async function getAmenities(id: number) {
  const venue = await repo().findOne({ where: { id }, relations: { amenities: true } });
  if (!venue) throw notFound(`Venue #${id} not found`);
  return venue.amenities ?? [];
}

export async function setAmenities(id: number, amenityIds: number[]) {
  const venue = await getOrFail(id);
  venue.amenities = await loadAmenities(amenityIds);
  await repo().save(venue);
  return venue.amenities;
}

async function loadAmenities(ids: number[]) {
  if (ids.length === 0) return [];
  const amenities = await AppDataSource.getRepository(Amenity).findBy({ id: In(ids) });
  if (amenities.length !== ids.length) {
    const found = new Set(amenities.map((a) => a.id));
    throw badRequest(`Amenity not found: ${ids.filter((i) => !found.has(i)).join(', ')}`);
  }
  return amenities;
}
