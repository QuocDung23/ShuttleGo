import 'reflect-metadata';
import { join } from 'node:path';
import pg from 'pg';
import { DataSource } from 'typeorm';
import '../config/env.js';
import { Amenity } from '../modules/amenities/amenity.entity.js';
import { Booking } from '../modules/bookings/booking.entity.js';
import { Court } from '../modules/courts/court.entity.js';
import { Favorite } from '../modules/favorites/favorite.entity.js';
import { Notification } from '../modules/notifications/notification.entity.js';
import { OperatingHour } from '../modules/operating-hours/operating-hour.entity.js';
import { PriceRule } from '../modules/price-rules/price-rule.entity.js';
import { Report } from '../modules/reports/report.entity.js';
import { User } from '../modules/users/user.entity.js';
import { Venue } from '../modules/venues/venue.entity.js';
import { SnakeNamingStrategy } from './snake-naming.strategy.js';

// BIGINT (int8) comes back from pg as a string; our ids stay far below 2^53, so parse to number.
pg.types.setTypeParser(pg.types.builtins.INT8, (v) => Number.parseInt(v, 10));
// Keep DATE as a plain "YYYY-MM-DD" string (no timezone shifting).
pg.types.setTypeParser(pg.types.builtins.DATE, (v) => v);

const env = process.env;

/** Used by the app and by the TypeORM CLI (npm run migration:*). */
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: env.DB_HOST ?? 'localhost',
  port: Number(env.DB_PORT ?? 5432),
  username: env.DB_USER ?? 'postgres',
  password: env.DB_PASSWORD ?? 'postgres',
  database: env.DB_NAME ?? 'shuttlego',
  entities: [
    User,
    Amenity,
    Venue,
    Court,
    OperatingHour,
    PriceRule,
    Favorite,
    Booking,
    Notification,
    Report,
  ],
  migrations: [join(import.meta.dirname, 'migrations', '*.{ts,js}')],
  migrationsTableName: 'migrations',
  namingStrategy: new SnakeNamingStrategy(),
  synchronize: false,
  logging: env.DB_LOGGING === 'true',
});
