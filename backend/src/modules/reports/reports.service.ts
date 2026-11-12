import { ReportStatus } from '../../common/enums.js';
import { notFound } from '../../common/http-error.js';
import { definedOnly, paginate, skipTake } from '../../common/validation.js';
import { AppDataSource } from '../../database/data-source.js';
import { Report } from './report.entity.js';
import type { CreateReportInput, QueryReportsInput, UpdateReportInput } from './reports.schema.js';

const repo = () => AppDataSource.getRepository(Report);
const CLOSED = [ReportStatus.RESOLVED, ReportStatus.REJECTED];

export async function findAll({ page, limit, ...filters }: QueryReportsInput) {
  const result = await repo().findAndCount({
    where: definedOnly(filters),
    relations: { reporter: true },
    order: { id: 'DESC' },
    ...skipTake({ page, limit }),
  });
  return paginate(result, { page, limit });
}

export async function findOne(id: number) {
  const report = await repo().findOne({
    where: { id },
    relations: { reporter: true, handler: true, booking: true, venue: true },
  });
  if (!report) throw notFound(`Report #${id} not found`);
  return report;
}

export async function create(input: CreateReportInput) {
  const saved = await repo().save(repo().create(input));
  return findOne(saved.id);
}

export async function update(id: number, input: UpdateReportInput) {
  const report = await repo().findOneBy({ id });
  if (!report) throw notFound(`Report #${id} not found`);
  repo().merge(report, input);
  // resolved_at is set when the report is closed, cleared when it is reopened
  if (input.status) report.resolvedAt = CLOSED.includes(input.status) ? new Date() : null;
  await repo().save(report);
  return findOne(id);
}

export async function remove(id: number) {
  const { affected } = await repo().delete({ id });
  if (!affected) throw notFound(`Report #${id} not found`);
}
