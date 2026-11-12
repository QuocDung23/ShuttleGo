import cors from 'cors';
import express from 'express';
import { errorHandler, notFoundHandler } from './common/error-handler.js';
import { amenitiesRouter } from './modules/amenities/amenities.routes.js';
import { bookingsRouter } from './modules/bookings/bookings.routes.js';
import { courtsRouter } from './modules/courts/courts.routes.js';
import { favoritesRouter } from './modules/favorites/favorites.routes.js';
import { notificationsRouter } from './modules/notifications/notifications.routes.js';
import { priceRulesRouter } from './modules/price-rules/price-rules.routes.js';
import { reportsRouter } from './modules/reports/reports.routes.js';
import { usersRouter } from './modules/users/users.routes.js';
import { venuesRouter } from './modules/venues/venues.routes.js';

export const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

const api = express.Router();
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
