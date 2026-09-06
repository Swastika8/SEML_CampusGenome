import { Router } from 'express';
import { getCommunities, getCommunityById } from '../controllers/communityController.js';

const router = Router();

router.get('/', getCommunities);
router.get('/:id', getCommunityById);

export default router;
