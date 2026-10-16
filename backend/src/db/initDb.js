import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config({ path: fileURLToPath(new URL('../../.env', import.meta.url)) });
const { Client } = pg;
const url = process.env.DATABASE_URL ? new URL(process.env.DATABASE_URL) : null;
const name = url
  ? decodeURIComponent(url.pathname.slice(1))
  : process.env.PGDATABASE || 'CampusGenome';
if (!name || name.length > 63)
  throw new Error('Provide a valid PostgreSQL database name (1-63 characters).');
const options = url
  ? { connectionString: url.toString() }
  : {
      host: process.env.PGHOST || 'localhost',
      port: Number(process.env.PGPORT || 5432),
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD,
      database: name,
    };
const adminUrl = url ? new URL(url) : null;
if (adminUrl) adminUrl.pathname = '/postgres';
const admin = new Client(
  adminUrl ? { connectionString: adminUrl.toString() } : { ...options, database: 'postgres' },
);
let app;
try {
  await admin.connect();
  const result = await admin.query('SELECT 1 FROM pg_database WHERE datname=$1', [name]);
  if (!result.rows.length)
    await admin.query('CREATE DATABASE "' + name.replaceAll('"', '""') + '"');
  await admin.end();
  app = new Client(options);
  await app.connect();
  await app.query(await readFile(new URL('./schema.sql', import.meta.url), 'utf8'));
  console.log('CampusGenome schema initialized. No sample data was inserted.');
  console.log('To intentionally load sample data, run npm run db:seed.');
} catch (error) {
  console.error('Database initialization failed:', error.message);
  process.exitCode = 1;
} finally {
  await admin.end().catch(() => {});
  if (app) await app.end().catch(() => {});
}
