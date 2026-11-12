import type { Request, Response } from 'express';
import { assertSelfOrAdmin } from '@/common/auth.js';
import { UserRole } from '@/common/enums.js';
import { parseId } from '@/common/validation.js';
import { createReportSchema, queryReportsSchema, updateReportSchema } from '@/modules/reports/reports.schema.js';
import * as service from '@/modules/reports/reports.service.js';
import { renderCreated, renderNoContent, renderOk } from '@/views/json.view.js';

export async function index(req: Request, res: Response) {
  const query = queryReportsSchema.parse(req.query);
  if (req.user!.role !== UserRole.ADMIN) query.reporterId = req.user!.id;
  renderOk(res, await service.findAll(query));
}

export async function show(req: Request, res: Response) {
  const report = await service.findOne(parseId(req.params.id));
  assertSelfOrAdmin(report.reporterId, req.user!);
  renderOk(res, report);
}

export async function create(req: Request, res: Response) {
  const input = createReportSchema.parse(req.body);
  if (req.user!.role !== UserRole.ADMIN || input.reporterId === undefined) {
    input.reporterId = req.user!.id;
  }
  renderCreated(res, await service.create(input));
}

export async function update(req: Request, res: Response) {
  renderOk(res, await service.update(parseId(req.params.id), updateReportSchema.parse(req.body)));
}

export async function remove(req: Request, res: Response) {
  await service.remove(parseId(req.params.id));
  renderNoContent(res);
}
