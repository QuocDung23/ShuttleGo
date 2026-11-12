import type { ErrorRequestHandler, RequestHandler } from 'express';
import { QueryFailedError } from 'typeorm';
import { ZodError } from 'zod';
import { HttpError } from './http-error.js';

/** Postgres error codes -> HTTP status + message */
const PG_ERRORS: Record<string, [number, string]> = {
  '23505': [409, 'Duplicate value'],
  '23503': [409, 'Record is still referenced by other data'],
  '23502': [400, 'Missing required value'],
  '23514': [400, 'Value violates a check constraint'],
  '22P02': [400, 'Invalid input value'],
  '22003': [400, 'Numeric value out of range'],
};

export const notFoundHandler: RequestHandler = (req, res) => {
  res.status(404).json({ message: `Cannot ${req.method} ${req.path}` });
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({ message: err.message, details: err.details });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      message: 'Validation failed',
      details: err.issues.map((i) => ({
        path: i.path.join('.'),
        message: i.message,
      })),
    });
    return;
  }

  if (err instanceof QueryFailedError) {
    const driverError = err.driverError as { code?: string; detail?: string };
    // FK violation on insert/update = referenced row is missing (400); on delete = row still in use (409)
    if (driverError.code === '23503' && driverError.detail?.includes('is not present')) {
      res.status(400).json({ message: 'Referenced record does not exist', details: driverError.detail });
      return;
    }
    const mapped = driverError.code ? PG_ERRORS[driverError.code] : undefined;
    if (mapped) {
      res.status(mapped[0]).json({ message: mapped[1], details: driverError.detail });
      return;
    }
  }

  // Malformed JSON body
  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({ message: 'Invalid JSON body' });
    return;
  }

  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
};
