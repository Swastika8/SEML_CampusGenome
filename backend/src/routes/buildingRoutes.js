import { Router } from 'express';
import { getBuildings, getBuildingById, addBuildingHistory } from '../controllers/buildingController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', getBuildings);
router.get('/:id', getBuildingById);
router.post('/:id/history', optionalAuth, addBuildingHistory);

export default router;
