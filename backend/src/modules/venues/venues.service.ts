import { EntityManager, ILike, In, type FindOptionsWhere } from 'typeorm';
import type { AuthUser } from '@/common/auth.js';
import { BookingSource, BookingStatus, PaymentStatus, UserRole, VenueStatus } from '@/common/enums.js';
import { badRequest, conflict, forbidden, notFound } from '@/common/http-error.js';
import {
  assertTimeRange,
  definedOnly,
  escapeLike,
  paginate,
  skipTake,
  timeToMinutes,
} from '@/common/validation.js';
import { AppDataSource } from '@/database/data-source.js';
import { Amenity } from '@/modules/amenities/amenity.entity.js';
import { Booking } from '@/modules/bookings/booking.entity.js';
import { BookingHold } from '@/modules/bookings/booking-hold.entity.js';
import { expirePendingCheckoutBookings } from '@/modules/bookings/booking-expiration.js';
import {
  applyActiveOccupancyFilter,
  dayOfWeekForDate,
  resolveOpeningWindow,
} from '@/modules/bookings/booking-rules.js';
import { Court } from '@/modules/courts/court.entity.js';
import { PriceRule } from '@/modules/price-rules/price-rule.entity.js';
import { Venue } from '@/modules/venues/venue.entity.js';
import type {
  CreateVenueInput,
  QueryVenuesInput,
  ReviewVenueInput,
  UpdateVenueInput,
} from '@/modules/venues/venues.schema.js';
import { realtime } from '@/realtime/realtime.js';

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
    relations: { amenities: true, priceRules: true, courts: true },
    order: query.sort === 'name' ? { name: 'ASC' } : { id: 'DESC', priceRules: { startTime: 'ASC' } },
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
      courts: { id: 'ASC' },
      operatingHours: { dayOfWeek: 'ASC' },
      priceRules: { startTime: 'ASC' },
    },
  });
  if (!venue) throw notFound(`Venue #${id} not found`);
  return venue;
}

/**
 * Public availability for one date. Only approved venues are exposed, only
 * active courts are listed, and occupied ranges carry no customer data.
 */
export async function getAvailability(venueId: number, date: string) {
  const venue = await repo().findOne({
    where: { id: venueId, status: VenueStatus.APPROVED },
    relations: { courts: true, operatingHours: true, priceRules: true },
    order: { courts: { id: 'ASC' } },
  });
  if (!venue) throw notFound(`Venue #${venueId} not found`);

  const dayRow = venue.operatingHours?.find(
    (row) => row.dayOfWeek === dayOfWeekForDate(date),
  );
  const window = resolveOpeningWindow(dayRow, venue.priceRules ?? []);
  const courts = (venue.courts ?? []).filter((court) => court.isActive);

  const occupiedByCourt = new Map<number, { startTime: string; endTime: string }[]>();
  const heldByCourt = new Map<number, { startTime: string; endTime: string }[]>();
  const checkoutByCourt = new Map<number, { startTime: string; endTime: string }[]>();
  if (courts.length > 0) {
    const qb = applyActiveOccupancyFilter(
      AppDataSource.getRepository(Booking)
        .createQueryBuilder('b')
        .select([
          'b.courtId',
          'b.startTime',
          'b.endTime',
          'b.source',
          'b.status',
          'b.paymentStatus',
          'b.holdExpiresAt',
        ])
        .where('b.bookingDate = :date', { date })
        .andWhere('b.courtId IN (:...courtIds)', { courtIds: courts.map((court) => court.id) }),
    );
    const rows = await qb.getMany();
    for (const row of rows) {
      const checkoutHold =
        row.source === BookingSource.APP &&
        row.status === BookingStatus.PENDING &&
        row.paymentStatus === PaymentStatus.UNPAID &&
        row.holdExpiresAt !== null;
      const target = checkoutHold ? checkoutByCourt : occupiedByCourt;
      const list = target.get(row.courtId) ?? [];
      list.push({ startTime: row.startTime, endTime: row.endTime });
      target.set(row.courtId, list);
    }

    const holds = await AppDataSource.getRepository(BookingHold)
      .createQueryBuilder('h')
      .select(['h.courtId', 'h.startTime', 'h.endTime'])
      .where('h.bookingDate = :date', { date })
      .andWhere('h.courtId IN (:...courtIds)', { courtIds: courts.map((court) => court.id) })
      .andWhere('h.expiresAt > now()')
      .getMany();
    for (const hold of holds) {
      const list = heldByCourt.get(hold.courtId) ?? [];
      list.push({ startTime: hold.startTime, endTime: hold.endTime });
      heldByCourt.set(hold.courtId, list);
    }
  }

  return {
    venueId,
    date,
    isOpen: window.isOpen,
    openTime: window.openTime,
    closeTime: window.closeTime,
    courts: courts.map((court) => ({
      id: court.id,
      name: court.name,
      occupiedRanges: occupiedByCourt.get(court.id) ?? [],
      heldRanges: heldByCourt.get(court.id) ?? [],
      checkoutRanges: checkoutByCourt.get(court.id) ?? [],
    })),
  };
}

/** Plain venue row, throws 404. Also used by other modules. */
export async function getOrFail(id: number) {
  const venue = await repo().findOneBy({ id });
  if (!venue) throw notFound(`Venue #${id} not found`);
  return venue;
}

function validateVenuePriceRules(priceRules: CreateVenueInput['priceRules']) {
  if (priceRules.length !== 2) {
    throw badRequest('priceRules must contain exactly 2 items');
  }
  const [regular, peak] = priceRules;
  if (regular.label !== 'Giờ thường' || peak.label !== 'Giờ cao điểm') {
    throw badRequest('priceRules must be [Giờ thường, Giờ cao điểm] in order');
  }
  assertTimeRange(regular.startTime, regular.endTime, 'Giờ thường');
  assertTimeRange(peak.startTime, peak.endTime, 'Giờ cao điểm');
  if (timeToMinutes(regular.endTime) !== timeToMinutes(peak.startTime)) {
    throw badRequest('priceRules must be adjacent: Giờ thường ends when Giờ cao điểm starts');
  }
}

export async function create(
  { amenityIds, priceRules, courtCount, ...input }: CreateVenueInput,
  user: AuthUser,
) {
  // Owners can only create venues for themselves; admins may assign an owner.
  const ownerId = user.role === UserRole.ADMIN ? input.ownerId : user.id;
  if (!ownerId) throw badRequest('ownerId is required');
  if (user.role !== UserRole.ADMIN && input.ownerId !== undefined && input.ownerId !== user.id) {
    throw forbidden('Owners can only create their own venues');
  }

  validateVenuePriceRules(priceRules);

  const savedId = await AppDataSource.transaction(async (manager) => {
    const venueRepo = manager.getRepository(Venue);
    const venue = venueRepo.create({ ...input, ownerId } as Partial<Venue>);
    if (amenityIds) venue.amenities = await loadAmenitiesWithManager(manager, amenityIds);
    const saved = await venueRepo.save(venue);

    const ruleRepo = manager.getRepository(PriceRule);
    await ruleRepo.save(
      priceRules.map((rule) => ruleRepo.create({ ...rule, venueId: saved.id })),
    );

    const courtRepo = manager.getRepository(Court);
    await courtRepo.save(
      Array.from({ length: courtCount }, (_, index) =>
        courtRepo.create({
          venueId: saved.id,
          name: `Sân ${index + 1}`,
          isActive: true,
        }),
      ),
    );

    return saved.id;
  });

  const venue = await findOne(savedId);
  realtime.admins('venue.application_submitted', { venueId: venue.id, status: 'pending' });
  return venue;
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
  if (amenityIds) venue.amenities = await loadAmenitiesWithManager(AppDataSource.manager, amenityIds);
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
  const reviewed = await findOne(id);
  if (reviewed.status === VenueStatus.APPROVED) {
    realtime.admins('venue.review_changed', { venueId: reviewed.id, status: 'approved' });
    realtime.users([reviewed.ownerId], 'owner.venue_approved', {
      venueId: reviewed.id,
      status: 'approved',
    });
  } else if (
    reviewed.status === VenueStatus.REJECTED ||
    reviewed.status === VenueStatus.SUSPENDED
  ) {
    realtime.admins('venue.review_changed', {
      venueId: reviewed.id,
      status: reviewed.status,
    });
    realtime.users([reviewed.ownerId], 'owner.venue_reviewed', {
      venueId: reviewed.id,
      status: reviewed.status,
    });
  }
  return reviewed;
}

export async function remove(id: number, user: AuthUser) {
  const venue = await getOrFail(id);
  assertCanManage(venue, user);
  await repo().remove(venue);
}

/** Venues owned by the authenticated owner, for onboarding/approval gate. */
export async function findMine(ownerId: number) {
  const data = await repo().find({
    where: { ownerId },
    select: { id: true, name: true, status: true, reviewNote: true, reviewedAt: true, updatedAt: true },
    order: { updatedAt: 'DESC', id: 'DESC' },
  });
  return { data };
}

/** Owner resubmits a rejected venue for review. */
export async function resubmit(id: number, user: AuthUser) {
  const venue = await getOrFail(id);
  assertCanManage(venue, user);
  if (venue.status !== VenueStatus.REJECTED) {
    throw conflict('Only rejected venues can be resubmitted');
  }
  venue.status = VenueStatus.PENDING;
  venue.reviewNote = null;
  venue.reviewedAt = null;
  venue.reviewedBy = null;
  await repo().save(venue);
  const resubmitted = await findOne(id);
  realtime.admins('venue.application_submitted', { venueId: resubmitted.id, status: 'pending' });
  return resubmitted;
}

export async function getAmenities(id: number) {
  const venue = await repo().findOne({ where: { id }, relations: { amenities: true } });
  if (!venue) throw notFound(`Venue #${id} not found`);
  return venue.amenities ?? [];
}

export async function setAmenities(id: number, amenityIds: number[], user: AuthUser) {
  const venue = await getOrFail(id);
  assertCanManage(venue, user);
  venue.amenities = await loadAmenitiesWithManager(AppDataSource.manager, amenityIds);
  await repo().save(venue);
  return venue.amenities;
}

async function loadAmenitiesWithManager(manager: EntityManager, ids: number[]) {
  if (ids.length === 0) return [];
  const amenities = await manager.getRepository(Amenity).findBy({ id: In(ids) });
  if (amenities.length !== ids.length) {
    const found = new Set(amenities.map((a) => a.id));
    throw badRequest(`Amenity not found: ${ids.filter((i) => !found.has(i)).join(', ')}`);
  }
  return amenities;
}
