import type { Request, Response } from 'express';
import { parseId } from '@/common/validation.js';
import {
  createPriceRuleSchema,
  queryPriceRulesSchema,
  updatePriceRuleSchema,
} from '@/modules/price-rules/price-rules.schema.js';
import * as service from '@/modules/price-rules/price-rules.service.js';
import { renderCreated, renderNoContent, renderOk } from '@/views/json.view.js';

export async function index(req: Request, res: Response) {
  renderOk(res, await service.findAll(queryPriceRulesSchema.parse(req.query)));
}

export async function show(req: Request, res: Response) {
  renderOk(res, await service.findOne(parseId(req.params.id)));
}

export async function create(req: Request, res: Response) {
  renderCreated(res, await service.create(createPriceRuleSchema.parse(req.body), req.user!));
}

export async function update(req: Request, res: Response) {
  renderOk(
    res,
    await service.update(parseId(req.params.id), updatePriceRuleSchema.parse(req.body), req.user!),
  );
}

export async function remove(req: Request, res: Response) {
  await service.remove(parseId(req.params.id), req.user!);
  renderNoContent(res);
}
