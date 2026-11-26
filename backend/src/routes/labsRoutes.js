import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { exportPocket, exportCalendar } from '../controllers/labsController.js';

// Mounted before API rate limits/body parsing so private failures are not cached.
export const privateExportResponse = (req, res, next) => {
  res.set('Cache-Control', 'private, no-store');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.vary('Authorization');
  res.set('Access-Control-Expose-Headers', 'X-Campus-Skipped-Events');
  next();
};

const router = Router();
router.use(authenticateToken);
router.get('/pocket', exportPocket);
router.get('/calendar', exportCalendar);
export default router;
