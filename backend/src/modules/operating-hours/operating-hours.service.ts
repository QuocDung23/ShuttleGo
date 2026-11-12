import { notFound } from '../../common/http-error.js';
import { AppDataSource } from '../../database/data-source.js';
import { getOrFail as getVenueOrFail } from '../venues/venues.service.js';
import { OperatingHour } from './operating-hour.entity.js';
import type { ReplaceWeekInput, UpsertDayInput } from './operating-hours.schema.js';

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

export async function upsertDay(venueId: number, dayOfWeek: number, input: UpsertDayInput) {
  await getVenueOrFail(venueId);
  await repo().upsert(toRow(venueId, dayOfWeek, input), ['venueId', 'dayOfWeek']);
  return repo().findOneByOrFail({ venueId, dayOfWeek });
}

export async function replaceWeek(venueId: number, { hours }: ReplaceWeekInput) {
  await getVenueOrFail(venueId);
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

export async function removeDay(venueId: number, dayOfWeek: number) {
  const { affected } = await repo().delete({ venueId, dayOfWeek });
  if (!affected) throw notFound(`No operating hours for venue #${venueId}, day ${dayOfWeek}`);
}
