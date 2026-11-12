import '@/config/env.js';
import { app } from '@/app.js';
import { AppDataSource } from '@/database/data-source.js';

const PORT = Number(process.env.PORT ?? 3000);

await AppDataSource.initialize();
if (process.env.DB_MIGRATIONS_RUN !== 'false') {
  const ran = await AppDataSource.runMigrations();
  if (ran.length) console.log(`Ran migrations: ${ran.map((m) => m.name).join(', ')}`);
}

const server = app.listen(PORT, () => {
  console.log(`ShuttleGo API listening on http://localhost:${PORT}/api`);
});

const shutdown = () => {
  server.close(() => void AppDataSource.destroy().then(() => process.exit(0)));
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
