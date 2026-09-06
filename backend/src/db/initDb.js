import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const { Client } = pg;

const dbHost = process.env.PGHOST || 'localhost';
const dbPort = parseInt(process.env.PGPORT || '5432', 10);
const dbUser = process.env.PGUSER || 'postgres';
const dbPassword = process.env.PGPASSWORD || 'postgres';
const dbName = process.env.PGDATABASE || 'CampusGenome';

async function initDatabase() {
  console.log('--- CampusGenome Database Initialization ---');
  console.log(`Target: postgres://${dbUser}:****@${dbHost}:${dbPort}/${dbName}`);

  // 1. Connect to default postgres DB to check/create CampusGenome
  const defaultClient = new Client({
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPassword,
    database: 'postgres',
  });

  try {
    await defaultClient.connect();
    console.log('Connected to PostgreSQL server.');

    const checkDbRes = await defaultClient.query(
      `SELECT 1 FROM pg_database WHERE datname = $1;`,
      [dbName]
    );

    if (checkDbRes.rowCount === 0) {
      console.log(`Database "${dbName}" does not exist. Creating it...`);
      await defaultClient.query(`CREATE DATABASE "${dbName}";`);
      console.log(`Database "${dbName}" created successfully!`);
    } else {
      console.log(`Database "${dbName}" already exists.`);
    }
  } catch (err) {
    console.error('Error checking/creating database:', err.message);
    throw err;
  } finally {
    await defaultClient.end();
  }

  // 2. Connect to CampusGenome to execute schema and seed
  const appClient = new Client({
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPassword,
    database: dbName,
  });

  try {
    await appClient.connect();
    console.log(`Connected to database "${dbName}".`);

    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    console.log('Executing schema.sql...');
    await appClient.query(schemaSql);
    console.log('Schema tables, keys, and indexes initialized successfully.');

    const seedPath = path.join(__dirname, 'seed.sql');
    const seedSql = fs.readFileSync(seedPath, 'utf8');
    console.log('Executing seed.sql...');
    await appClient.query(seedSql);
    console.log('Seed data inserted successfully.');

    // Print summary stats
    const usersCount = await appClient.query('SELECT COUNT(*) FROM users');
    const nodesCount = await appClient.query('SELECT COUNT(*) FROM knowledge_nodes');
    const buildingsCount = await appClient.query('SELECT COUNT(*) FROM buildings');
    const coursesCount = await appClient.query('SELECT COUNT(*) FROM courses');

    console.log('\n--- Database Stats ---');
    console.log(`Users: ${usersCount.rows[0].count}`);
    console.log(`Knowledge Nodes: ${nodesCount.rows[0].count}`);
    console.log(`Buildings: ${buildingsCount.rows[0].count}`);
    console.log(`Courses: ${coursesCount.rows[0].count}`);
    console.log('Database initialization complete!\n');
  } catch (err) {
    console.error('Error applying schema/seed:', err.message);
    throw err;
  } finally {
    await appClient.end();
  }
}

initDatabase().catch((err) => {
  console.error('Fatal initialization error:', err.message);
  process.exit(1);
});
