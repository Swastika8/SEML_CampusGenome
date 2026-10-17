import { Router } from 'express';
import { getPulse, votePulse } from '../controllers/pulseController.js';
import { optionalAuth, authenticateToken } from '../middleware/auth.js';
import { validate, pulseVoteSchema, pulseDateSchema } from '../middleware/validate.js';
const router = Router();
router.get('/', optionalAuth, getPulse);
router.put('/vote', authenticateToken, validate(pulseVoteSchema), votePulse);
router.delete('/vote', authenticateToken, validate(pulseDateSchema), votePulse);
export default router;
