import cors from 'cors';
import express from 'express';
import { errorHandler, notFoundHandler } from '@/common/error-handler.js';
import { amenitiesRouter } from '@/modules/amenities/amenities.routes.js';
import { authRouter } from '@/modules/auth/auth.routes.js';
import { bookingsRouter } from '@/modules/bookings/bookings.routes.js';
import { courtsRouter } from '@/modules/courts/courts.routes.js';
import { docsRouter } from '@/modules/docs/docs.routes.js';
import { favoritesRouter } from '@/modules/favorites/favorites.routes.js';
import { healthRouter } from '@/modules/health/health.routes.js';
import { notificationsRouter } from '@/modules/notifications/notifications.routes.js';
import { priceRulesRouter } from '@/modules/price-rules/price-rules.routes.js';
import { reportsRouter } from '@/modules/reports/reports.routes.js';
import { usersRouter } from '@/modules/users/users.routes.js';
import { venuesRouter } from '@/modules/venues/venues.routes.js';

export const app = express();

// Comma-separated allowlist, e.g. CORS_ORIGIN="https://app.shuttlego.vn,https://admin.shuttlego.vn".
// When unset, all origins are allowed (fine for local development / native apps).
const corsOrigin = process.env.CORS_ORIGIN;
app.use(cors(corsOrigin ? { origin: corsOrigin.split(',').map((o) => o.trim()) } : {}));
app.use(express.json({ limit: '1mb' }));

const api = express.Router();
api.use('/docs', docsRouter);
api.use('/health', healthRouter);
api.use('/auth', authRouter);
api.use('/users', usersRouter);
api.use('/amenities', amenitiesRouter);
api.use('/venues', venuesRouter); // + /venues/:id/amenities, /venues/:id/operating-hours
api.use('/courts', courtsRouter);
api.use('/price-rules', priceRulesRouter);
api.use('/favorites', favoritesRouter);
api.use('/bookings', bookingsRouter);
api.use('/notifications', notificationsRouter);
api.use('/reports', reportsRouter);
app.use('/api', api);

app.use(notFoundHandler);
app.use(errorHandler);
