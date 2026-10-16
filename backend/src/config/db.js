import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { mkdir } from 'node:fs/promises';

dotenv.config({ path: fileURLToPath(new URL('../../.env', import.meta.url)), quiet: true });
export const isDemo = process.argv.includes('--demo') || process.env.DB_MODE === 'demo';
if (isDemo && process.env.NODE_ENV === 'production')
  throw new Error('Demo mode is disabled in production.');

let embedded;
const native = isDemo
  ? null
  : new pg.Pool({
      ...(process.env.DATABASE_URL
        ? { connectionString: process.env.DATABASE_URL }
        : {
            host: process.env.PGHOST || 'localhost',
            port: Number(process.env.PGPORT || 5432),
            user: process.env.PGUSER || 'postgres',
            password: process.env.PGPASSWORD,
            database: process.env.PGDATABASE || 'CampusGenome',
          }),
      max: 20,
      options: process.env.PGOPTIONS,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
      statement_timeout: 10000,
    });
native?.on('error', (err) => console.error('Database pool error:', err.message));
export const databaseReady = (async () => {
  if (isDemo) {
    const { PGlite } = await import('@electric-sql/pglite');
    const directory =
      process.env.DEMO_DATA_DIR ||
      resolve(fileURLToPath(new URL('../../', import.meta.url)), '.data/campus');
    if (directory !== 'memory://') await mkdir(directory, { recursive: true });
    embedded = await PGlite.create(directory);
  }
})();

const pool = {
  async query(sql, params) {
    await databaseReady;
    if (!isDemo) return native.query(sql, params);
    if (params === undefined) return (await embedded.exec(sql)).at(-1) || { rows: [] };
    return embedded.query(sql, params);
  },
  async end() {
    await databaseReady;
    return isDemo ? embedded.close() : native.end();
  },
};

// A transaction callback reserves the whole embedded session or one pg connection.
export async function transaction(work) {
  await databaseReady;
  if (isDemo) return embedded.transaction(work);
  const client = await native.connect();
  try {
    await client.query('BEGIN');
    const result = await work(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
export default pool;
