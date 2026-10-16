import { Router } from 'express';
import {
  getBuildings,
  getBuildingById,
  addBuildingHistory,
} from '../controllers/buildingController.js';
import { authenticateToken } from '../middleware/auth.js';

import { validate, buildingHistorySchema } from '../middleware/validate.js';
const router = Router();

router.get('/', getBuildings);
router.get('/:id', getBuildingById);
router.post('/:id/history', authenticateToken, validate(buildingHistorySchema), addBuildingHistory);

export default router;
