import app from './app.js';
import pool, { isDemo } from './config/db.js';
import { bootstrap } from './db/bootstrap.js';

try {
  await bootstrap();
  const port = Number(process.env.PORT || 5000);
  const server = app.listen(port, process.env.HOST || (isDemo ? '127.0.0.1' : '0.0.0.0'), () =>
    console.log(
      'CampusGenome API: http://localhost:' +
        port +
        ' (' +
        (isDemo ? 'local demo' : 'PostgreSQL') +
        ')',
    ),
  );
  const shutdown = () => {
    server.close(async () => {
      await pool.end();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000).unref();
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
} catch (err) {
  console.error('Startup failed:', err.message);
  console.error('For the self-contained local demo, run npm run dev from the project root.');
  await pool.end().catch(() => {});
  process.exit(1);
}
