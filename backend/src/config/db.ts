import { Pool, PoolClient, types } from 'pg';

types.setTypeParser(1082, (v) => v); // DATE -> 'YYYY-MM-DD' (không bị lệch múi giờ)
types.setTypeParser(20, (v) => parseInt(v, 10)); // COUNT(*) bigint -> number
types.setTypeParser(1700, (v) => parseFloat(v)); // AVG numeric -> number

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const camel = (s: string) => s.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
function camelize(v: any): any {
  if (Array.isArray(v)) return v.map(camelize);
  if (v && typeof v === 'object' && !(v instanceof Date)) {
    return Object.fromEntries(Object.entries(v).map(([k, x]) => [camel(k), camelize(x)]));
  }
  return v;
}

type Db = Pool | PoolClient;
/** Chạy SQL, trả về mảng dòng với key camelCase. */
export async function q<T = any>(sql: string, params: any[] = [], db: Db = pool): Promise<T[]> {
  const res = await db.query(sql, params);
  return camelize(res.rows) as T[];
}
export async function q1<T = any>(sql: string, params: any[] = [], db: Db = pool): Promise<T | null> {
  return (await q<T>(sql, params, db))[0] ?? null;
}
/** Chạy nhiều câu lệnh trong 1 transaction. */
export async function tx<T>(fn: (c: PoolClient) => Promise<T>): Promise<T> {
  const c = await pool.connect();
  try {
    await c.query('BEGIN');
    const r = await fn(c);
    await c.query('COMMIT');
    return r;
  } catch (e) {
    await c.query('ROLLBACK');
    throw e;
  } finally {
    c.release();
  }
}
