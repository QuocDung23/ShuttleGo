import type { Request, Response } from 'express';
import { openApiDocument } from '@/docs/openapi.js';
import { renderOk } from '@/views/json.view.js';

export function showSpec(_req: Request, res: Response) {
  renderOk(res, openApiDocument);
}
