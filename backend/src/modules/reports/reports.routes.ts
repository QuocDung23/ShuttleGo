import { Router } from 'express';
import { assertSelfOrAdmin, authenticate, requireRole } from '@/common/auth.js';
import { UserRole } from '@/common/enums.js';
import { parseId } from '@/common/validation.js';
import { createReportSchema, queryReportsSchema, updateReportSchema } from '@/modules/reports/reports.schema.js';
import * as service from '@/modules/reports/reports.service.js';

export const reportsRouter = Router();

reportsRouter.use(authenticate);

reportsRouter.get('/', async (req, res) => {
  const query = queryReportsSchema.parse(req.query);
  if (req.user!.role !== UserRole.ADMIN) query.reporterId = req.user!.id;
  res.json(await service.findAll(query));
});

reportsRouter.get('/:id', async (req, res) => {
  const report = await service.findOne(parseId(req.params.id));
  assertSelfOrAdmin(report.reporterId, req.user!);
  res.json(report);
});

/** Any authenticated user can report; the reporter is always the current user. */
reportsRouter.post('/', async (req, res) => {
  const input = createReportSchema.parse(req.body);
  if (req.user!.role !== UserRole.ADMIN || input.reporterId === undefined) {
    input.reporterId = req.user!.id;
  }
  res.status(201).json(await service.create(input));
});

/** Only admins handle reports. */
reportsRouter.patch('/:id', requireRole(UserRole.ADMIN), async (req, res) => {
  res.json(
    await service.update(parseId(req.params.id), updateReportSchema.parse(req.body)),
  );
});

reportsRouter.delete('/:id', requireRole(UserRole.ADMIN), async (req, res) => {
  await service.remove(parseId(req.params.id));
  res.status(204).end();
});
