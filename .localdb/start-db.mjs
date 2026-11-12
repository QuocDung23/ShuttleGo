// PostgreSQL cục bộ cho ShuttleGO (không cần cài PostgreSQL vào máy).
// Chạy: cd .localdb && npm start   -> postgres://shuttlego:shuttlego@localhost:5432/shuttlego
import EmbeddedPostgres from 'embedded-postgres';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const dataDir = join(here, 'data');
const firstRun = !existsSync(join(dataDir, 'PG_VERSION'));

const pg = new EmbeddedPostgres({
  databaseDir: dataDir,
  user: 'shuttlego',
  password: 'shuttlego',
  port: 5432,
  persistent: true,
  initdbFlags: ['--encoding=UTF8', '--locale=C'],
  onLog: () => {},
  onError: (e) => console.error(String(e)),
});

if (firstRun) await pg.initialise();
await pg.start();

if (firstRun) {
  await pg.createDatabase('shuttlego');
  const client = pg.getPgClient('shuttlego');
  await client.connect();
  await client.query(readFileSync(join(here, '..', 'backend', 'db', 'schema.sql'), 'utf8'));
  await client.end();
  console.log('Da tao database shuttlego + schema.');
}
console.log('PostgreSQL san sang tai localhost:5432 (Ctrl+C de dung).');

const stop = async () => { await pg.stop(); process.exit(0); };
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
