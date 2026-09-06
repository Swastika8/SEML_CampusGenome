import { Router } from 'express';
import { getLifestyle, getLifestyleSpotById } from '../controllers/lifestyleController.js';

const router = Router();

router.get('/', getLifestyle);
router.get('/:id', getLifestyleSpotById);

export default router;
