import '@/config/env.js';

const secret = process.env.JWT_SECRET;

if (!secret) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be set in production');
  }
  console.warn(
    '[auth] JWT_SECRET is not set — using an insecure development secret. Set JWT_SECRET in .env.',
  );
}

/** HMAC key used to sign access tokens. */
export const JWT_SECRET = secret ?? 'shuttlego-insecure-dev-secret';

/** Token lifetime in seconds (default 7 days). */
export const JWT_TTL_SECONDS = Number(process.env.JWT_EXPIRES_IN ?? 60 * 60 * 24 * 7);
