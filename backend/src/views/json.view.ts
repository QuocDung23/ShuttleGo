import type { Response } from 'express';

/** JSON presentation layer used by the mobile client. */
export function renderOk(res: Response, data: unknown): void {
  res.status(200).json(data);
}

export function renderCreated(res: Response, data: unknown): void {
  res.status(201).json(data);
}

export function renderNoContent(res: Response): void {
  res.status(204).end();
}
