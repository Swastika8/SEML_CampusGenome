import { Router } from 'express';
import { getLifestyle, getLifestyleSpotById } from '../controllers/lifestyleController.js';

import { numericId } from '../middleware/validate.js';
const router = Router();

router.get('/', getLifestyle);
router.get('/:id', numericId(), getLifestyleSpotById);

export default router;
