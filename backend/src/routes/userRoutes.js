import { Router } from 'express';
import { getLeaderboard, getUserProfile } from '../controllers/userController.js';

const router = Router();

router.get('/leaderboard', getLeaderboard);
router.get('/:handleOrId', getUserProfile);

export default router;
