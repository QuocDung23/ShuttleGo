import '@/config/env.js';
import { createServer } from 'node:http';
import { app } from '@/app.js';
import { AppDataSource } from '@/database/data-source.js';
import {
  expireBookingHolds,
  expirePendingCheckoutBookings,
} from '@/modules/bookings/booking-expiration.js';
import { attachRealtimeServer } from '@/realtime/realtime.js';

const PORT = Number(process.env.PORT ?? 3000);

await AppDataSource.initialize();
if (process.env.DB_MIGRATIONS_RUN !== 'false') {
  const ran = await AppDataSource.runMigrations();
  if (ran.length) console.log(`Ran migrations: ${ran.map((m) => m.name).join(', ')}`);
}
await Promise.all([expirePendingCheckoutBookings(), expireBookingHolds()]);
const bookingExpiryTimer = setInterval(() => {
  void Promise.all([expirePendingCheckoutBookings(), expireBookingHolds()]).catch((error) => {
    console.error('Failed to expire abandoned booking holds:', error);
  });
}, 15_000);
bookingExpiryTimer.unref();

const server = createServer(app);
const io = attachRealtimeServer(server);
server.listen(PORT, () => {
  console.log(`ShuttleGo API listening on http://localhost:${PORT}/api`);
  console.log(`Swagger UI available at http://localhost:${PORT}/api/docs`);
});

let shuttingDown = false;
const shutdown = () => {
  if (shuttingDown) return;
  shuttingDown = true;
  clearInterval(bookingExpiryTimer);
  io.close(() => {
    void AppDataSource.destroy().finally(() => process.exit(0));
  });
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
