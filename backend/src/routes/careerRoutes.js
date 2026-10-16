import { Router } from 'express';
import { getOpportunities, getOpportunityById } from '../controllers/careerController.js';

import { numericId } from '../middleware/validate.js';
const router = Router();

router.get('/', getOpportunities);
router.get('/:id', numericId(), getOpportunityById);

export default router;
