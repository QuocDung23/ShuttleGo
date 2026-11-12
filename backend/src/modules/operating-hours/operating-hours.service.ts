import type { AuthUser } from '@/common/auth.js';
import { notFound } from '@/common/http-error.js';
import { AppDataSource } from '@/database/data-source.js';
import { OperatingHour } from '@/modules/operating-hours/operating-hour.entity.js';
import type { ReplaceWeekInput, UpsertDayInput } from '@/modules/operating-hours/operating-hours.schema.js';
import { assertCanManageVenue, getOrFail as getVenueOrFail } from '@/modules/venues/venues.service.js';

const repo = () => AppDataSource.getRepository(OperatingHour);

const toRow = (venueId: number, dayOfWeek: number, input: UpsertDayInput) => ({
  venueId,
  dayOfWeek,
  isOpen: input.isOpen,
  openTime: input.isOpen ? (input.openTime ?? null) : null,
  closeTime: input.isOpen ? (input.closeTime ?? null) : null,
});

export async function findByVenue(venueId: number) {
  await getVenueOrFail(venueId);
  return repo().find({ where: { venueId }, order: { dayOfWeek: 'ASC' } });
}

export async function upsertDay(
  venueId: number,
  dayOfWeek: number,
  input: UpsertDayInput,
  user: AuthUser,
) {
  await assertCanManageVenue(venueId, user);
  await repo().upsert(toRow(venueId, dayOfWeek, input), ['venueId', 'dayOfWeek']);
  return repo().findOneByOrFail({ venueId, dayOfWeek });
}

export async function replaceWeek(venueId: number, { hours }: ReplaceWeekInput, user: AuthUser) {
  await assertCanManageVenue(venueId, user);
  await AppDataSource.transaction(async (manager) => {
    await manager.delete(OperatingHour, { venueId });
    if (hours.length) {
      await manager.insert(
        OperatingHour,
        hours.map(({ dayOfWeek, ...h }) => toRow(venueId, dayOfWeek, h)),
      );
    }
  });
  return findByVenue(venueId);
}

export async function removeDay(venueId: number, dayOfWeek: number, user: AuthUser) {
  await assertCanManageVenue(venueId, user);
  const { affected } = await repo().delete({ venueId, dayOfWeek });
  if (!affected) throw notFound(`No operating hours for venue #${venueId}, day ${dayOfWeek}`);
}
