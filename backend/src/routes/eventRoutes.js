import { Router } from 'express';
import { getEvents, getEventById } from '../controllers/eventController.js';

import { numericId } from '../middleware/validate.js';
const router = Router();

router.get('/', getEvents);
router.get('/:id', numericId(), getEventById);

export default router;
