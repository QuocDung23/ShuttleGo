import { ILike, In, type FindOptionsWhere } from 'typeorm';
import type { AuthUser } from '@/common/auth.js';
import { UserRole } from '@/common/enums.js';
import { badRequest, forbidden, notFound } from '@/common/http-error.js';
import { definedOnly, escapeLike, paginate, skipTake } from '@/common/validation.js';
import { AppDataSource } from '@/database/data-source.js';
import { Amenity } from '@/modules/amenities/amenity.entity.js';
import { Venue } from '@/modules/venues/venue.entity.js';
import type {
  CreateVenueInput,
  QueryVenuesInput,
  ReviewVenueInput,
  UpdateVenueInput,
} from '@/modules/venues/venues.schema.js';

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

export async function create({ amenityIds, ...input }: CreateVenueInput, user: AuthUser) {
  // Owners can only create venues for themselves; admins may assign an owner.
  const ownerId = user.role === UserRole.ADMIN ? input.ownerId : user.id;
  if (!ownerId) throw badRequest('ownerId is required');
  if (user.role !== UserRole.ADMIN && input.ownerId !== undefined && input.ownerId !== user.id) {
    throw forbidden('Owners can only create their own venues');
  }

  const venue = repo().create({ ...input, ownerId });
  if (amenityIds) venue.amenities = await loadAmenities(amenityIds);
  const saved = await repo().save(venue);
  return findOne(saved.id);
}

/** Throws 403 unless the actor is an admin or owns the venue. */
export function assertCanManage(venue: Pick<Venue, 'ownerId'>, user: AuthUser) {
  if (user.role === UserRole.ADMIN) return;
  if (user.role === UserRole.OWNER && venue.ownerId === user.id) return;
  throw forbidden('You do not manage this venue');
}

/** Loads the venue (404 if missing) and checks the actor may manage it. */
export async function assertCanManageVenue(venueId: number, user: AuthUser) {
  assertCanManage(await getOrFail(venueId), user);
}

export async function update(id: number, { amenityIds, ...input }: UpdateVenueInput, user: AuthUser) {
  const venue = await getOrFail(id);
  assertCanManage(venue, user);
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

export async function remove(id: number, user: AuthUser) {
  const venue = await getOrFail(id);
  assertCanManage(venue, user);
  await repo().remove(venue);
}

export async function getAmenities(id: number) {
  const venue = await repo().findOne({ where: { id }, relations: { amenities: true } });
  if (!venue) throw notFound(`Venue #${id} not found`);
  return venue.amenities ?? [];
}

export async function setAmenities(id: number, amenityIds: number[], user: AuthUser) {
  const venue = await getOrFail(id);
  assertCanManage(venue, user);
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
