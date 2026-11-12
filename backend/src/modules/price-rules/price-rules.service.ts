import type { AuthUser } from '@/common/auth.js';
import { conflict, notFound } from '@/common/http-error.js';
import { assertTimeRange, definedOnly, timeToMinutes } from '@/common/validation.js';
import { AppDataSource } from '@/database/data-source.js';
import { assertCanManageVenue } from '@/modules/venues/venues.service.js';
import { PriceRule } from '@/modules/price-rules/price-rule.entity.js';
import type {
  CreatePriceRuleInput,
  QueryPriceRulesInput,
  UpdatePriceRuleInput,
} from '@/modules/price-rules/price-rules.schema.js';

const repo = () => AppDataSource.getRepository(PriceRule);

export const findAll = (query: QueryPriceRulesInput) =>
  repo().find({ where: definedOnly(query), order: { venueId: 'ASC', startTime: 'ASC' } });

export async function findOne(id: number) {
  const rule = await repo().findOneBy({ id });
  if (!rule) throw notFound(`Price rule #${id} not found`);
  return rule;
}

export async function create(input: CreatePriceRuleInput, user: AuthUser) {
  await assertCanManageVenue(input.venueId, user);
  assertTimeRange(input.startTime, input.endTime);
  await assertNoOverlap(input.venueId, input.startTime, input.endTime);
  const saved = await repo().save(repo().create(input));
  return findOne(saved.id);
}

export async function update(id: number, input: UpdatePriceRuleInput, user: AuthUser) {
  const rule = repo().merge(await findOne(id), input);
  await assertCanManageVenue(rule.venueId, user);
  assertTimeRange(rule.startTime, rule.endTime);
  await assertNoOverlap(rule.venueId, rule.startTime, rule.endTime, id);
  await repo().save(rule);
  return findOne(id);
}

export async function remove(id: number, user: AuthUser) {
  const rule = await findOne(id);
  await assertCanManageVenue(rule.venueId, user);
  await repo().remove(rule);
}

/** Two price rules of the same venue must not cover the same time. */
async function assertNoOverlap(venueId: number, start: string, end: string, excludeId?: number) {
  const rules = await repo().findBy({ venueId });
  const [s, e] = [timeToMinutes(start), timeToMinutes(end)];
  const clash = rules.find(
    (r) => r.id !== excludeId && timeToMinutes(r.startTime) < e && timeToMinutes(r.endTime) > s,
  );
  if (clash) {
    throw conflict(`Overlaps price rule #${clash.id} (${clash.startTime}–${clash.endTime})`);
  }
}
