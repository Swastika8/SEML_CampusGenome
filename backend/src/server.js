import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import pool from './config/db.js';

// Route imports
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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Utility Middlewares
app.use(helmet());
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));
app.use(morgan('dev'));

// API Root Health Check
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to CampusGenome REST API',
    status: 'online',
    version: '1.0.0',
    documentation: '/api/health',
  });
});

app.get('/api/health', async (req, res) => {
  try {
    const dbCheck = await pool.query('SELECT NOW() AS current_time, current_database() AS db_name;');
    res.status(200).json({
      success: true,
      status: 'healthy',
      serverTime: new Date().toISOString(),
      database: {
        connected: true,
        name: dbCheck.rows[0].db_name,
        timestamp: dbCheck.rows[0].current_time,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      status: 'database_error',
      message: err.message,
    });
  }
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/nodes', nodeRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/lifestyle', lifestyleRoutes);
app.use('/api/career', careerRoutes);
app.use('/api/academics', academicRoutes);
app.use('/api/communities', communityRoutes);
app.use('/api/buildings', buildingRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/users', userRoutes);

// 404 & Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`===========================================`);
  console.log(` CampusGenome API Server running on port ${PORT}`);
  console.log(` Health Check: http://localhost:${PORT}/api/health`);
  console.log(` Environment:  ${process.env.NODE_ENV || 'development'}`);
  console.log(`===========================================`);
});

export default app;
