export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly details?: unknown,
    public readonly code?: string,
  ) {
    super(message);
  }
}

export const badRequest = (message: string, details?: unknown) =>
  new HttpError(400, message, details);
export const unauthorized = (message = 'Authentication required') =>
  new HttpError(401, message);
export const forbidden = (message = 'You do not have permission to do this', details?: unknown, code?: string) =>
  new HttpError(403, message, details, code);
export const notFound = (message: string) => new HttpError(404, message);
export const conflict = (message: string, details?: unknown) =>
  new HttpError(409, message, details);
