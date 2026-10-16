import { Router } from 'express';
import { getCommunities, getCommunityById } from '../controllers/communityController.js';

import { numericId } from '../middleware/validate.js';
const router = Router();

router.get('/', getCommunities);
router.get('/:id', numericId(), getCommunityById);

export default router;
