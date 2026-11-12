import type { Request, Response } from 'express';
import { renderOk } from '@/views/json.view.js';

export function show(_req: Request, res: Response) {
  renderOk(res, { status: 'ok' });
}
