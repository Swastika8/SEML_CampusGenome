import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { rateLimit } from 'express-rate-limit';
import { randomUUID } from 'node:crypto';
import pool, { isDemo } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import nodeRoutes from './routes/nodeRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import lifestyleRoutes from './routes/lifestyleRoutes.js';
import careerRoutes from './routes/careerRoutes.js';
import academicRoutes from './routes/academicRoutes.js';
import communityRoutes from './routes/communityRoutes.js';
import buildingRoutes from './routes/buildingRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import userRoutes from './routes/userRoutes.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

const app = express();
app.disable('x-powered-by');
app.use((req, res, next) => {
  req.id = randomUUID();
  res.setHeader('X-Request-ID', req.id);
  next();
});
app.use(helmet());
const origins = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173')
  .split(',')
  .map((s) => s.trim());
app.use(
  cors({
    origin: (origin, callback) => callback(null, !origin || origins.includes(origin)),
    credentials: false,
  }),
);
app.use(express.json({ limit: '1mb' }));
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));
const rateOptions = { standardHeaders: 'draft-7', legacyHeaders: false };
app.use(
  '/api',
  rateLimit({
    ...rateOptions,
    windowMs: 60000,
    limit: Number(process.env.API_RATE_LIMIT || 300),
    message: { success: false, message: 'Too many requests. Please try again shortly.' },
  }),
);
app.use(
  '/api/auth',
  rateLimit({
    ...rateOptions,
    windowMs: 15 * 60000,
    limit: 50,
    skip: (req) => req.method === 'GET',
    message: { success: false, message: 'Too many sign-in attempts. Please try again later.' },
  }),
);
app.get('/', (req, res) =>
  res.json({ name: 'CampusGenome API', version: '2.0.0', health: '/api/health' }),
);
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({
      success: true,
      status: 'healthy',
      mode: isDemo ? 'demo' : 'postgres',
      version: '2.0.0',
    });
  } catch {
    res
      .status(503)
      .json({ success: false, status: 'unavailable', message: 'Database is unavailable.' });
  }
});
app.get('/api/stats', async (req, res, next) => {
  try {
    const result = await pool.query(`SELECT
      (SELECT COUNT(*)::int FROM knowledge_nodes WHERE status!='Removed') AS contributions,
      (SELECT COUNT(*)::int FROM users) AS students,
      (SELECT COUNT(*)::int FROM verifications) AS verifications,
      (SELECT COUNT(*)::int FROM buildings) AS places,
      (SELECT COUNT(*)::int FROM event_nodes ev JOIN knowledge_nodes k ON k.id=ev.node_id WHERE k.status!='Removed' AND CASE WHEN ev.event_date ~ '^\\d{4}-\\d{2}-\\d{2}$' THEN ev.event_date::date ELSE NULL END>=CURRENT_DATE) AS upcoming_events`);
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
});
for (const [name, router] of Object.entries({
  auth: authRoutes,
  nodes: nodeRoutes,
  events: eventRoutes,
  lifestyle: lifestyleRoutes,
  career: careerRoutes,
  academics: academicRoutes,
  communities: communityRoutes,
  buildings: buildingRoutes,
  courses: courseRoutes,
  users: userRoutes,
}))
  app.use('/api/' + name, router);
app.use(notFoundHandler);
app.use(errorHandler);
export default app;
