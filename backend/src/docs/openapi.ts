import { amenityPaths } from '@/modules/amenities/amenities.openapi.js';
import { authPaths } from '@/modules/auth/auth.openapi.js';
import { bookingPaths } from '@/modules/bookings/bookings.openapi.js';
import { courtPaths } from '@/modules/courts/courts.openapi.js';
import { favoritePaths } from '@/modules/favorites/favorites.openapi.js';
import { healthPaths } from '@/modules/health/health.openapi.js';
import { notificationPaths } from '@/modules/notifications/notifications.openapi.js';
import { operatingHourPaths } from '@/modules/operating-hours/operating-hours.openapi.js';
import { priceRulePaths } from '@/modules/price-rules/price-rules.openapi.js';
import { reportPaths } from '@/modules/reports/reports.openapi.js';
import { userPaths } from '@/modules/users/users.openapi.js';
import { venuePaths } from '@/modules/venues/venues.openapi.js';
import { openApiSchemas } from '@/docs/openapi.schemas.js';

export const openApiDocument = {
  openapi: '3.0.4',
  info: {
    title: 'ShuttleGo API',
    version: '0.1.0',
    description:
      'Express.js + TypeScript API for ShuttleGo. Use Authorize to send a JWT to protected endpoints.',
  },
  servers: [{ url: '/api', description: 'Current server' }],
  tags: [
    { name: 'Health' },
    { name: 'Auth' },
    { name: 'Users' },
    { name: 'Amenities' },
    { name: 'Venues' },
    { name: 'Operating hours' },
    { name: 'Courts' },
    { name: 'Price rules' },
    { name: 'Favorites' },
    { name: 'Bookings' },
    { name: 'Notifications' },
    { name: 'Reports' },
  ],
  paths: {
    ...healthPaths,
    ...authPaths,
    ...userPaths,
    ...amenityPaths,
    ...venuePaths,
    ...operatingHourPaths,
    ...courtPaths,
    ...priceRulePaths,
    ...favoritePaths,
    ...bookingPaths,
    ...notificationPaths,
    ...reportPaths,
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: openApiSchemas,
  },
};
