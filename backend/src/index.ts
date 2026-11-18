import '@/config/env.js';
import { app } from '@/app.js';
import { AppDataSource } from '@/database/data-source.js';
import { expirePendingCheckoutBookings } from '@/modules/bookings/booking-expiration.js';

const PORT = Number(process.env.PORT ?? 3000);

await AppDataSource.initialize();
if (process.env.DB_MIGRATIONS_RUN !== 'false') {
  const ran = await AppDataSource.runMigrations();
  if (ran.length) console.log(`Ran migrations: ${ran.map((m) => m.name).join(', ')}`);
}
await expirePendingCheckoutBookings();
const bookingExpiryTimer = setInterval(() => {
  void expirePendingCheckoutBookings().catch((error) => {
    console.error('Failed to expire abandoned booking holds:', error);
  });
}, 15_000);
bookingExpiryTimer.unref();

const server = app.listen(PORT, () => {
  console.log(`ShuttleGo API listening on http://localhost:${PORT}/api`);
  console.log(`Swagger UI available at http://localhost:${PORT}/api/docs`);
});

const shutdown = () => {
  clearInterval(bookingExpiryTimer);
  server.close(() => void AppDataSource.destroy().then(() => process.exit(0)));
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
